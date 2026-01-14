const { TQualMappool, TQualScore, TTeam, TPlayer, Tournament } = require('../../models/tournament');
const User = require('../../models/user/user');
const osu = require('osu-api-v2-js');
const { Op } = require('sequelize');

const CLIENT_ID = Number(process.env.OSU_CLIENT_ID);
const CLIENT_SECRET = process.env.OSU_CLIENT_SECRET;

// 获取资格赛图池
exports.getQualMappool = async (req, res) => {
    try {
        const { tid } = req.params;
        const maps = await TQualMappool.findAll({
            where: { t_id: tid },
            order: [['index', 'ASC']]
        });
        res.json(maps);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 添加资格赛图（需 pooler 权限）
exports.addQualMap = async (req, res) => {
    try {
        const { tid } = req.params;
        const { index, map_id, artist, title, mapper, weight } = req.body;

        const map = await TQualMappool.create({
            t_id: tid,
            index,
            map_id,
            artist,
            title,
            mapper,
            weight: weight || 1.0
        });
        res.status(201).json(map);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 更新资格赛图
exports.updateQualMap = async (req, res) => {
    try {
        const { tid, mapId } = req.params;
        const map = await TQualMappool.findOne({ where: { id: mapId, t_id: tid } });
        if (!map) {
            return res.status(404).json({ message: '图不存在' });
        }

        const fields = ['index', 'map_id', 'artist', 'title', 'mapper', 'weight'];
        fields.forEach(f => {
            if (req.body[f] !== undefined) map[f] = req.body[f];
        });

        await map.save();
        res.json(map);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 删除资格赛图
exports.deleteQualMap = async (req, res) => {
    try {
        const { tid, mapId } = req.params;
        const map = await TQualMappool.findOne({ where: { id: mapId, t_id: tid } });
        if (!map) {
            return res.status(404).json({ message: '图不存在' });
        }
        await map.destroy();
        res.json({ message: '删除成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 获取资格赛成绩
exports.getQualScores = async (req, res) => {
    try {
        const { tid } = req.params;
        const scores = await TQualScore.findAll({
            include: [
                { model: TQualMappool, as: 'map', where: { t_id: tid } },
                { model: TTeam, as: 'team' },
                { model: TPlayer, as: 'player', include: [{ model: User, as: 'user', attributes: ['user_id', 'user_name', 'avatar'] }] }
            ]
        });
        res.json(scores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 从 osu! API 获取资格赛成绩（通过 MP 房间 ID）
exports.fetchQualScoresFromMp = async (req, res) => {
    try {
        const { tid } = req.params;
        const { mp_id, team_id } = req.body;

        // 获取赛事和图池
        const tournament = await Tournament.findByPk(tid);
        if (!tournament) {
            return res.status(404).json({ message: '赛事不存在' });
        }

        const qualMaps = await TQualMappool.findAll({ where: { t_id: tid } });
        const mapIdSet = new Set(qualMaps.map(m => m.map_id));
        const mapIndexMap = new Map(qualMaps.map(m => [m.map_id, m]));

        // 获取队伍
        const team = await TTeam.findOne({
            where: { id: team_id, t_id: tid },
            include: [{ model: TPlayer, as: 'players' }]
        });
        if (!team) {
            return res.status(404).json({ message: '队伍不存在' });
        }
        const playerOsuUids = new Set();
        for (const p of team.players) {
            const user = await User.findByPk(p.user_id);
            if (user?.osu_uid) playerOsuUids.add(user.osu_uid);
        }

        // 调用 osu! API 获取 MP 房间数据
        const api = await osu.API.createAsync(CLIENT_ID, CLIENT_SECRET);
        const match = await api.getMatch(mp_id);

        if (!match || !match.events) {
            return res.status(400).json({ message: '无法获取比赛数据' });
        }

        // 解析成绩
        const games = match.events.filter(e => e.game);
        const savedScores = [];

        for (const event of games) {
            const game = event.game;
            if (!mapIdSet.has(game.beatmap_id)) continue;

            const qualMap = mapIndexMap.get(game.beatmap_id);

            for (const score of game.scores) {
                // 检查是否是该队伍的选手
                if (!playerOsuUids.has(score.user_id)) continue;

                // 查找 player_id
                const user = await User.findOne({ where: { osu_uid: score.user_id } });
                if (!user) continue;
                const player = team.players.find(p => p.user_id === user.user_id);
                if (!player) continue;

                // 检查是否已有更高成绩
                const existing = await TQualScore.findOne({
                    where: { map_id: qualMap.id, team_id: team.id }
                });

                const scoreValue = score.legacy_total_score || score.total_score;

                if (existing) {
                    // 只保留更高分
                    if (scoreValue > existing.score) {
                        existing.score = scoreValue;
                        existing.player_id = player.id;
                        await existing.save();
                        savedScores.push({ map: qualMap.index, score: scoreValue, updated: true });
                    }
                } else {
                    await TQualScore.create({
                        map_id: qualMap.id,
                        team_id: team.id,
                        player_id: player.id,
                        score: scoreValue
                    });
                    savedScores.push({ map: qualMap.index, score: scoreValue, updated: false });
                }
            }
        }

        // 更新队伍的 qual_mp_id
        team.qual_mp_id = mp_id;
        await team.save();

        res.json({ message: '成绩获取完成', scores: savedScores });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 计算排名
exports.calculateRanking = async (req, res) => {
    try {
        const { tid } = req.params;
        const tournament = await Tournament.findByPk(tid);
        if (!tournament) {
            return res.status(404).json({ message: '赛事不存在' });
        }

        // 获取所有图和成绩
        const qualMaps = await TQualMappool.findAll({ where: { t_id: tid }, order: [['index', 'ASC']] });
        const teams = await TTeam.findAll({ where: { t_id: tid, status: 1 } });

        // 获取所有成绩
        const allScores = await TQualScore.findAll({
            include: [{ model: TQualMappool, as: 'map', where: { t_id: tid } }]
        });

        // 按队伍分组成绩
        const teamScores = new Map();
        for (const team of teams) {
            teamScores.set(team.id, { team, scores: new Map() });
        }

        for (const score of allScores) {
            const ts = teamScores.get(score.team_id);
            if (ts) {
                ts.scores.set(score.map_id, score.score);
            }
        }

        // 计算排名
        if (tournament.qual_rank_mode === 0) {
            // 模式0：排名累加法
            // 先计算每张图的排名
            for (const map of qualMaps) {
                const mapScores = [];
                for (const [teamId, ts] of teamScores) {
                    const score = ts.scores.get(map.id) || 0;
                    mapScores.push({ teamId, score });
                }
                // 按分数降序排序
                mapScores.sort((a, b) => b.score - a.score);
                // 分配排名
                mapScores.forEach((item, idx) => {
                    const ts = teamScores.get(item.teamId);
                    if (!ts.rankSum) ts.rankSum = 0;
                    ts.rankSum += idx + 1;
                });
            }

            // 按排名总和升序排序，平分时总分更高者靠前
            const ranking = Array.from(teamScores.values())
                .map(ts => ({
                    team: ts.team,
                    rankSum: ts.rankSum || 999,
                    totalScore: Array.from(ts.scores.values()).reduce((a, b) => a + b, 0)
                }))
                .sort((a, b) => {
                    if (a.rankSum !== b.rankSum) return a.rankSum - b.rankSum;
                    return b.totalScore - a.totalScore;
                });

            // 更新队伍排名
            for (let i = 0; i < ranking.length; i++) {
                const team = ranking[i].team;
                team.qual_rank = i + 1;
                team.qual_score = ranking[i].totalScore;
                await team.save();
            }

            res.json({ message: '排名计算完成', ranking: ranking.map((r, i) => ({ rank: i + 1, team: r.team.display_name, rankSum: r.rankSum, totalScore: r.totalScore })) });
        } else {
            // 模式1：加权分数法
            for (const [teamId, ts] of teamScores) {
                let weightedSum = 0;
                for (const map of qualMaps) {
                    const score = ts.scores.get(map.id) || 0;
                    weightedSum += score * (map.weight || 1.0);
                }
                ts.weightedScore = weightedSum / qualMaps.length;
            }

            const ranking = Array.from(teamScores.values())
                .map(ts => ({
                    team: ts.team,
                    weightedScore: ts.weightedScore || 0
                }))
                .sort((a, b) => b.weightedScore - a.weightedScore);

            for (let i = 0; i < ranking.length; i++) {
                const team = ranking[i].team;
                team.qual_rank = i + 1;
                team.qual_score = Math.round(ranking[i].weightedScore);
                await team.save();
            }

            res.json({ message: '排名计算完成', ranking: ranking.map((r, i) => ({ rank: i + 1, team: r.team.display_name, weightedScore: r.weightedScore })) });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 获取资格赛排名
exports.getQualRanking = async (req, res) => {
    try {
        const { tid } = req.params;
        const teams = await TTeam.findAll({
            where: { t_id: tid, status: 1, qual_rank: { [Op.ne]: null } },
            include: [
                { model: TPlayer, as: 'players', include: [{ model: User, as: 'user', attributes: ['user_id', 'user_name', 'avatar', 'osu_uid'] }] }
            ],
            order: [['qual_rank', 'ASC']]
        });
        res.json(teams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};
