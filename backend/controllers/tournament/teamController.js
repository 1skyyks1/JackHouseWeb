const { TTeam, TPlayer, Tournament } = require('../../models/tournament');
const User = require('../../models/user/user');
const crypto = require('crypto');

// 生成邀请码（6位字母数字混合）
const generateInviteCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除易混淆字符
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(crypto.randomInt(chars.length));
    }
    return code;
};

// 获取队伍列表
exports.getTeams = async (req, res) => {
    try {
        const { tid } = req.params;
        const teams = await TTeam.findAll({
            where: { t_id: tid },
            include: [
                { model: User, as: 'captain', attributes: ['user_id', 'user_name', 'avatar', 'osu_uid'] },
                { model: TPlayer, as: 'players', include: [{ model: User, as: 'user', attributes: ['user_id', 'user_name', 'avatar', 'osu_uid'] }] }
            ],
            order: [['qual_rank', 'ASC'], ['created_time', 'ASC']]
        });
        res.json(teams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 创建队伍
exports.createTeam = async (req, res) => {
    try {
        const { tid } = req.params;
        const { name } = req.body;
        const userId = req.user.user_id;

        // 检查赛事是否在报名期
        const tournament = await Tournament.findByPk(tid);
        if (!tournament) {
            return res.status(404).json({ message: '赛事不存在' });
        }
        const now = new Date();
        if (now < new Date(tournament.reg_start) || now > new Date(tournament.reg_end)) {
            return res.status(400).json({ message: '不在报名时间内' });
        }

        // 检查用户是否已报名
        const existingPlayer = await TPlayer.findOne({
            include: [{ model: TTeam, as: 'team', where: { t_id: tid } }],
            where: { user_id: userId }
        });
        if (existingPlayer) {
            return res.status(400).json({ message: '你已经在一支队伍中' });
        }

        // 创建队伍
        const inviteCode = generateInviteCode();
        const team = await TTeam.create({
            t_id: tid,
            name,
            display_name: name,
            invite_code: inviteCode,
            captain_id: userId,
            status: 0
        });

        // 创建队员记录
        await TPlayer.create({
            team_id: team.id,
            user_id: userId,
            is_captain: 1
        });

        res.status(201).json({
            ...team.toJSON(),
            invite_code: inviteCode
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 加入队伍
exports.joinTeam = async (req, res) => {
    try {
        const { tid } = req.params;
        const { invite_code } = req.body;
        const userId = req.user.user_id;

        // 检查赛事
        const tournament = await Tournament.findByPk(tid);
        if (!tournament) {
            return res.status(404).json({ message: '赛事不存在' });
        }
        const now = new Date();
        if (now < new Date(tournament.reg_start) || now > new Date(tournament.reg_end)) {
            return res.status(400).json({ message: '不在报名时间内' });
        }

        // 检查用户是否已报名
        const existingPlayer = await TPlayer.findOne({
            include: [{ model: TTeam, as: 'team', where: { t_id: tid } }],
            where: { user_id: userId }
        });
        if (existingPlayer) {
            return res.status(400).json({ message: '你已经在一支队伍中' });
        }

        // 查找队伍
        const team = await TTeam.findOne({
            where: { t_id: tid, invite_code },
            include: [{ model: TPlayer, as: 'players' }]
        });
        if (!team) {
            return res.status(404).json({ message: '邀请码无效' });
        }

        // 检查队伍人数
        if (team.players.length >= tournament.team_size_max) {
            return res.status(400).json({ message: '队伍已满' });
        }

        // 加入队伍
        await TPlayer.create({
            team_id: team.id,
            user_id: userId,
            is_captain: 0
        });

        // 如果队伍满员，清除邀请码
        if (team.players.length + 1 >= tournament.team_size_max) {
            team.invite_code = null;
            await team.save();
        }

        res.json({ message: '加入成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 离开队伍
exports.leaveTeam = async (req, res) => {
    try {
        const { tid } = req.params;
        const userId = req.user.user_id;

        const player = await TPlayer.findOne({
            include: [{ model: TTeam, as: 'team', where: { t_id: tid } }],
            where: { user_id: userId }
        });
        if (!player) {
            return res.status(404).json({ message: '你不在任何队伍中' });
        }

        // 如果是队长且队伍有其他成员，不能离开
        if (player.is_captain) {
            const teamPlayers = await TPlayer.count({ where: { team_id: player.team_id } });
            if (teamPlayers > 1) {
                return res.status(400).json({ message: '队长不能离开，请先转让队长或移除其他队员' });
            }
            // 队伍只有队长一人，解散队伍
            await TTeam.destroy({ where: { id: player.team_id } });
        }

        await player.destroy();
        res.json({ message: '已离开队伍' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 审核队伍（管理）
exports.updateTeamStatus = async (req, res) => {
    try {
        const { tid, teamId } = req.params;
        const { status } = req.body;

        const team = await TTeam.findOne({ where: { id: teamId, t_id: tid } });
        if (!team) {
            return res.status(404).json({ message: '队伍不存在' });
        }

        team.status = status;
        await team.save();
        res.json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 批量通过审核
exports.approveAllTeams = async (req, res) => {
    try {
        const { tid } = req.params;
        await TTeam.update({ status: 1 }, { where: { t_id: tid, status: 0 } });
        res.json({ message: '已批量通过' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};
