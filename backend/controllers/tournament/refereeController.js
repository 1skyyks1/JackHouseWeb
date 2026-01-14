const { TMatch, TGame, TMappool, TRound, TTeam, TPlayer } = require('../../models/tournament');
const User = require('../../models/user/user');
const osu = require('osu-api-v2-js');

const CLIENT_ID = Number(process.env.OSU_CLIENT_ID);
const CLIENT_SECRET = process.env.OSU_CLIENT_SECRET;

// 获取裁判工作台数据
exports.getRefereeData = async (req, res) => {
    try {
        const { matchId } = req.params;

        const match = await TMatch.findByPk(matchId, {
            include: [
                {
                    model: TRound,
                    as: 'round',
                    include: [{ model: TMappool, as: 'mappool', order: [['type', 'ASC'], ['id', 'ASC']] }]
                },
                {
                    model: TTeam,
                    as: 'team1',
                    include: [{ model: TPlayer, as: 'players', include: [{ model: User, as: 'user', attributes: ['user_id', 'user_name', 'osu_uid'] }] }]
                },
                {
                    model: TTeam,
                    as: 'team2',
                    include: [{ model: TPlayer, as: 'players', include: [{ model: User, as: 'user', attributes: ['user_id', 'user_name', 'osu_uid'] }] }]
                },
                {
                    model: TGame,
                    as: 'games',
                    order: [['order', 'ASC']],
                    include: [{ model: TMappool, as: 'map' }]
                }
            ]
        });

        if (!match) {
            return res.status(404).json({ message: '比赛不存在' });
        }

        // 计算已使用的 ban/protect/pick
        const usedMaps = {
            team1_protect: [],
            team2_protect: [],
            team1_ban: [],
            team2_ban: [],
            picked: []
        };

        for (const game of match.games || []) {
            if (game.action_type === 0) {
                // protect
                if (game.action_by === 1) usedMaps.team1_protect.push(game.map_id);
                else usedMaps.team2_protect.push(game.map_id);
            } else if (game.action_type === 1) {
                // ban
                if (game.action_by === 1) usedMaps.team1_ban.push(game.map_id);
                else usedMaps.team2_ban.push(game.map_id);
            } else if (game.action_type === 2) {
                // pick
                usedMaps.picked.push(game.map_id);
            }
        }

        // 生成房间名
        const roomName = `${match.round.name}: (${match.team1.display_name}) vs (${match.team2.display_name})`;

        res.json({
            match,
            usedMaps,
            roomName,
            commands: generateCommands(match, roomName)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 生成裁判指令
function generateCommands(match, roomName) {
    return {
        createRoom: `!mp make ${roomName}`,
        invite: [
            ...(match.team1?.players?.map(p => `!mp invite ${p.user?.user_name}`) || []),
            ...(match.team2?.players?.map(p => `!mp invite ${p.user?.user_name}`) || [])
        ],
        settings: '!mp set 3 0 1',  // Team VS, ScoreV2
        timer: '!mp timer 150',
        start: '!mp start 10',
        abort: '!mp abort',
        close: '!mp close',
        rollMessage: '请双方队长 Roll 点，高 Roll 先 Protect'
    };
}

// 记录 Roll 点
exports.recordRoll = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { team1_roll, team2_roll } = req.body;

        const match = await TMatch.findByPk(matchId);
        if (!match) {
            return res.status(404).json({ message: '比赛不存在' });
        }

        match.team1_roll = team1_roll;
        match.team2_roll = team2_roll;
        match.status = 1; // 进行中
        await match.save();

        res.json({
            message: 'Roll 点已记录',
            team1_roll,
            team2_roll,
            highRoll: team1_roll > team2_roll ? 1 : 2
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 记录 Protect/Ban/Pick
exports.recordAction = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { map_id, action_type, action_by } = req.body;
        // action_type: 0=protect, 1=ban, 2=pick
        // action_by: 1=team1, 2=team2

        const match = await TMatch.findByPk(matchId, {
            include: [{ model: TGame, as: 'games' }]
        });
        if (!match) {
            return res.status(404).json({ message: '比赛不存在' });
        }

        const order = (match.games?.length || 0) + 1;

        const game = await TGame.create({
            match_id: matchId,
            map_id,
            order,
            player1_id: 0,
            player2_id: 0,
            player1_score: 0,
            player2_score: 0,
            winner_team: 0,
            action_type,
            action_by
        });

        res.json({ message: '操作已记录', game });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 记录技术暂停
exports.recordTimeout = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { team } = req.body; // 1 or 2

        const match = await TMatch.findByPk(matchId);
        if (!match) {
            return res.status(404).json({ message: '比赛不存在' });
        }

        if (team === 1) {
            if (match.team1_timeout_used) {
                return res.status(400).json({ message: '红队已用过暂停' });
            }
            match.team1_timeout_used = 1;
        } else {
            if (match.team2_timeout_used) {
                return res.status(400).json({ message: '蓝队已用过暂停' });
            }
            match.team2_timeout_used = 1;
        }

        await match.save();
        res.json({ message: '暂停已记录' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 更新单局比分（手动输入）
exports.updateGameScore = async (req, res) => {
    try {
        const { matchId, gameId } = req.params;
        const { player1_id, player2_id, player1_score, player2_score } = req.body;

        const game = await TGame.findOne({ where: { id: gameId, match_id: matchId } });
        if (!game) {
            return res.status(404).json({ message: '对局不存在' });
        }

        game.player1_id = player1_id || game.player1_id;
        game.player2_id = player2_id || game.player2_id;
        game.player1_score = player1_score;
        game.player2_score = player2_score;
        game.winner_team = player1_score > player2_score ? 1 : 2;

        await game.save();

        // 更新比赛总分
        const match = await TMatch.findByPk(matchId, {
            include: [
                { model: TGame, as: 'games', where: { action_type: 2 } }, // 只计算 pick 的局
                { model: TRound, as: 'round' }
            ]
        });

        if (match) {
            let t1 = 0, t2 = 0;
            for (const g of match.games || []) {
                if (g.winner_team === 1) t1++;
                else if (g.winner_team === 2) t2++;
            }
            match.team1_score = t1;
            match.team2_score = t2;

            // 检查是否结束
            if (t1 >= match.round.first_to) {
                match.winner_id = match.team1_id;
                match.status = 2;
            } else if (t2 >= match.round.first_to) {
                match.winner_id = match.team2_id;
                match.status = 2;
            }

            await match.save();
        }

        res.json({ message: '比分已更新', game });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 撤销上一步操作
exports.undoLastAction = async (req, res) => {
    try {
        const { matchId } = req.params;

        const lastGame = await TGame.findOne({
            where: { match_id: matchId },
            order: [['order', 'DESC']]
        });

        if (!lastGame) {
            return res.status(400).json({ message: '没有可撤销的操作' });
        }

        await lastGame.destroy();
        res.json({ message: '已撤销上一步' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};
