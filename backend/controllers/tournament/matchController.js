const { TRound, TMappool, TMatch, TGame, TTeam, TPlayer, Tournament } = require('../../models/tournament');
const User = require('../../models/user/user');
const osu = require('osu-api-v2-js');

const CLIENT_ID = Number(process.env.OSU_CLIENT_ID);
const CLIENT_SECRET = process.env.OSU_CLIENT_SECRET;

// 获取轮次列表
exports.getRounds = async (req, res) => {
    try {
        const { tid } = req.params;
        const rounds = await TRound.findAll({
            where: { t_id: tid },
            order: [['order', 'ASC']],
            include: [{ model: TMappool, as: 'mappool' }]
        });
        res.json(rounds);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 创建轮次
exports.createRound = async (req, res) => {
    try {
        const { tid } = req.params;
        const { name, bracket_type, first_to, order, start_time, end_time } = req.body;

        const round = await TRound.create({
            t_id: tid,
            name,
            bracket_type, // 0=胜者组 1=败者组
            first_to,
            order,
            start_time,
            end_time
        });
        res.status(201).json(round);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 更新轮次
exports.updateRound = async (req, res) => {
    try {
        const { tid, roundId } = req.params;
        const round = await TRound.findOne({ where: { id: roundId, t_id: tid } });
        if (!round) {
            return res.status(404).json({ message: '轮次不存在' });
        }

        const fields = ['name', 'bracket_type', 'first_to', 'order', 'start_time', 'end_time'];
        fields.forEach(f => {
            if (req.body[f] !== undefined) round[f] = req.body[f];
        });

        await round.save();
        res.json(round);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 删除轮次
exports.deleteRound = async (req, res) => {
    try {
        const { tid, roundId } = req.params;
        const round = await TRound.findOne({ where: { id: roundId, t_id: tid } });
        if (!round) {
            return res.status(404).json({ message: '轮次不存在' });
        }
        await round.destroy();
        res.json({ message: '删除成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 获取轮次图池
exports.getRoundMappool = async (req, res) => {
    try {
        const { roundId } = req.params;
        const maps = await TMappool.findAll({
            where: { round_id: roundId },
            order: [['type', 'ASC'], ['id', 'ASC']]
        });
        res.json(maps);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 添加轮次图池
exports.addRoundMap = async (req, res) => {
    try {
        const { roundId } = req.params;
        const { type, map_id, artist, title, mapper } = req.body;

        const map = await TMappool.create({
            round_id: roundId,
            type,
            map_id,
            artist,
            title,
            mapper
        });
        res.status(201).json(map);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 删除轮次图池
exports.deleteRoundMap = async (req, res) => {
    try {
        const { mapId } = req.params;
        const map = await TMappool.findByPk(mapId);
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

// 获取对阵表（所有比赛）
exports.getBracket = async (req, res) => {
    try {
        const { tid } = req.params;
        const matches = await TMatch.findAll({
            include: [
                {
                    model: TRound,
                    as: 'round',
                    where: { t_id: tid },
                    attributes: ['id', 'name', 'bracket_type', 'first_to', 'order']
                },
                { model: TTeam, as: 'team1', attributes: ['id', 'display_name'] },
                { model: TTeam, as: 'team2', attributes: ['id', 'display_name'] },
                { model: TTeam, as: 'winner', attributes: ['id', 'display_name'] }
            ],
            order: [[{ model: TRound, as: 'round' }, 'order', 'ASC'], ['id', 'ASC']]
        });
        res.json(matches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 生成 RO32 对阵表（根据资格赛排名）
exports.generateBracket = async (req, res) => {
    try {
        const { tid } = req.params;
        const { round_id } = req.body;

        // 获取轮次
        const round = await TRound.findOne({ where: { id: round_id, t_id: tid } });
        if (!round) {
            return res.status(404).json({ message: '轮次不存在' });
        }

        // 获取资格赛晋级队伍（按排名）
        const tournament = await Tournament.findByPk(tid);
        const teams = await TTeam.findAll({
            where: { t_id: tid, status: 1 },
            order: [['qual_rank', 'ASC']],
            limit: tournament.qual_top_n
        });

        if (teams.length < 2) {
            return res.status(400).json({ message: '队伍数量不足' });
        }

        // 种子对阵算法（1v32, 16v17, 8v25...）
        const n = teams.length;
        const matches = [];

        // 标准双败制种子位置
        const seedPairs = generateSeedPairs(n);

        for (let i = 0; i < seedPairs.length; i++) {
            const [seed1, seed2] = seedPairs[i];
            const team1 = teams[seed1 - 1];
            const team2 = seed2 <= n ? teams[seed2 - 1] : null;

            const match = await TMatch.create({
                round_id: round.id,
                team1_id: team1.id,
                team2_id: team2?.id || null,
                scheduled_time: round.start_time || new Date(),
                status: team2 ? 0 : 2, // 如果没有对手，直接晋级
                winner_id: team2 ? null : team1.id
            });
            matches.push(match);
        }

        res.json({ message: '对阵表生成完成', matches });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 生成种子对阵
function generateSeedPairs(n) {
    // 向上取整到 2 的幂次
    const size = Math.pow(2, Math.ceil(Math.log2(n)));
    const pairs = [];

    // 标准种子对阵：1v32, 16v17, 8v25, 9v24, 4v29, 13v20, 5v28, 12v21...
    function fillBracket(pos, count) {
        if (count === 1) return [pos];
        const half = count / 2;
        const left = fillBracket(pos, half);
        const right = fillBracket(pos + half, half);
        const result = [];
        for (let i = 0; i < half; i++) {
            result.push(left[i], right[half - 1 - i]);
        }
        return result;
    }

    const seeds = fillBracket(1, size);
    for (let i = 0; i < seeds.length; i += 2) {
        pairs.push([seeds[i], seeds[i + 1]]);
    }

    return pairs;
}

// 获取单场比赛详情
exports.getMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const match = await TMatch.findByPk(matchId, {
            include: [
                { model: TRound, as: 'round', include: [{ model: TMappool, as: 'mappool' }] },
                { model: TTeam, as: 'team1', include: [{ model: TPlayer, as: 'players', include: [{ model: User, as: 'user' }] }] },
                { model: TTeam, as: 'team2', include: [{ model: TPlayer, as: 'players', include: [{ model: User, as: 'user' }] }] },
                { model: TTeam, as: 'winner' },
                { model: TGame, as: 'games', include: [{ model: TMappool, as: 'map' }] }
            ]
        });
        if (!match) {
            return res.status(404).json({ message: '比赛不存在' });
        }
        res.json(match);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 创建比赛
exports.createMatch = async (req, res) => {
    try {
        const { round_id, team1_id, team2_id, scheduled_time, is_possible } = req.body;

        const match = await TMatch.create({
            round_id,
            team1_id,
            team2_id,
            scheduled_time,
            is_possible: is_possible || 0,
            status: 0
        });
        res.status(201).json(match);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 更新比赛
exports.updateMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const match = await TMatch.findByPk(matchId);
        if (!match) {
            return res.status(404).json({ message: '比赛不存在' });
        }

        const fields = ['mp_id', 'team1_roll', 'team2_roll', 'team1_score', 'team2_score',
            'winner_id', 'scheduled_time', 'status', 'team1_timeout_used', 'team2_timeout_used', 'is_possible'];
        fields.forEach(f => {
            if (req.body[f] !== undefined) match[f] = req.body[f];
        });

        await match.save();
        res.json(match);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 从 MP 获取比赛分数
exports.fetchMatchScores = async (req, res) => {
    try {
        const { matchId } = req.params;

        const match = await TMatch.findByPk(matchId, {
            include: [
                { model: TRound, as: 'round', include: [{ model: TMappool, as: 'mappool' }] },
                { model: TTeam, as: 'team1', include: [{ model: TPlayer, as: 'players' }] },
                { model: TTeam, as: 'team2', include: [{ model: TPlayer, as: 'players' }] }
            ]
        });

        if (!match || !match.mp_id) {
            return res.status(400).json({ message: '请先设置 MP 房间 ID' });
        }

        // 获取队伍选手的 osu_uid
        const team1Uids = new Set();
        const team2Uids = new Set();

        for (const p of match.team1.players) {
            const user = await User.findByPk(p.user_id);
            if (user?.osu_uid) team1Uids.add(user.osu_uid);
        }
        for (const p of match.team2.players) {
            const user = await User.findByPk(p.user_id);
            if (user?.osu_uid) team2Uids.add(user.osu_uid);
        }

        // 调用 osu! API
        const api = await osu.API.createAsync(CLIENT_ID, CLIENT_SECRET);
        const mpMatch = await api.getMatch(match.mp_id);

        if (!mpMatch || !mpMatch.events) {
            return res.status(400).json({ message: '无法获取比赛数据' });
        }

        // 图池映射
        const mapIdToPool = new Map();
        for (const m of match.round.mappool) {
            mapIdToPool.set(m.map_id, m);
        }

        // 解析所有 games
        const games = mpMatch.events.filter(e => e.game);
        const savedGames = [];
        let team1Total = 0;
        let team2Total = 0;

        // 清除旧的 game 记录
        await TGame.destroy({ where: { match_id: match.id } });

        for (let i = 0; i < games.length; i++) {
            const game = games[i].game;
            const poolMap = mapIdToPool.get(game.beatmap_id);
            if (!poolMap) continue; // 不在图池中的图跳过

            let p1Score = 0, p2Score = 0;
            let p1Id = null, p2Id = null;

            for (const score of game.scores) {
                const scoreVal = score.legacy_total_score || score.total_score;
                if (team1Uids.has(score.user_id)) {
                    p1Score = scoreVal;
                    const user = await User.findOne({ where: { osu_uid: score.user_id } });
                    const player = match.team1.players.find(p => p.user_id === user?.user_id);
                    p1Id = player?.id;
                } else if (team2Uids.has(score.user_id)) {
                    p2Score = scoreVal;
                    const user = await User.findOne({ where: { osu_uid: score.user_id } });
                    const player = match.team2.players.find(p => p.user_id === user?.user_id);
                    p2Id = player?.id;
                }
            }

            const winner = p1Score > p2Score ? 1 : 2;
            if (winner === 1) team1Total++;
            else team2Total++;

            await TGame.create({
                match_id: match.id,
                map_id: poolMap.id,
                order: i + 1,
                player1_id: p1Id || 0,
                player2_id: p2Id || 0,
                player1_score: p1Score,
                player2_score: p2Score,
                winner_team: winner,
                action_type: 2, // pick
                action_by: 0
            });

            savedGames.push({
                order: i + 1,
                map: poolMap.type,
                p1Score,
                p2Score,
                winner
            });
        }

        // 更新比赛分数
        match.team1_score = team1Total;
        match.team2_score = team2Total;

        // 检查是否决出胜负
        if (team1Total >= match.round.first_to) {
            match.winner_id = match.team1_id;
            match.status = 2;
        } else if (team2Total >= match.round.first_to) {
            match.winner_id = match.team2_id;
            match.status = 2;
        }

        await match.save();

        res.json({
            message: '分数获取完成',
            team1_score: team1Total,
            team2_score: team2Total,
            games: savedGames,
            winner: match.winner_id ? (match.winner_id === match.team1_id ? 'team1' : 'team2') : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};
