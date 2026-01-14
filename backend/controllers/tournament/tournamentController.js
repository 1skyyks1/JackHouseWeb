const { Tournament, TStaff, TTeam, TPlayer, TRound, TMappool, TMatch, TQualMappool } = require('../../models/tournament');
const User = require('../../models/user/user');

// 获取赛事列表
exports.getTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.findAll({
            order: [['created_time', 'DESC']]
        });
        res.json(tournaments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 获取赛事详情
exports.getTournament = async (req, res) => {
    try {
        const { tid } = req.params;
        const tournament = await Tournament.findByPk(tid, {
            include: [
                { model: TStaff, as: 'staff', include: [{ model: User, as: 'user', attributes: ['user_id', 'user_name', 'avatar'] }] },
                { model: TRound, as: 'rounds', order: [['order', 'ASC']] }
            ]
        });
        if (!tournament) {
            return res.status(404).json({ message: '赛事不存在' });
        }
        res.json(tournament);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 创建赛事（需 host 权限）
exports.createTournament = async (req, res) => {
    try {
        const { name, acronym, desc, banner, team_size_min, team_size_max, qual_top_n, qual_rank_mode, reg_start, reg_end, qual_start, qual_end } = req.body;

        const tournament = await Tournament.create({
            name, acronym, desc, banner,
            team_size_min: team_size_min || 1,
            team_size_max: team_size_max || 2,
            qual_top_n: qual_top_n || 32,
            qual_rank_mode: qual_rank_mode || 0,
            reg_start, reg_end, qual_start, qual_end,
            status: 0
        });

        // 将创建者设为 host
        await TStaff.create({
            t_id: tournament.id,
            user_id: req.user.user_id,
            role: 'host'
        });

        res.status(201).json(tournament);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 更新赛事（需 host 权限）
exports.updateTournament = async (req, res) => {
    try {
        const { tid } = req.params;
        const tournament = await Tournament.findByPk(tid);
        if (!tournament) {
            return res.status(404).json({ message: '赛事不存在' });
        }

        const updateFields = ['name', 'acronym', 'desc', 'banner', 'team_size_min', 'team_size_max',
            'qual_top_n', 'qual_rank_mode', 'reg_start', 'reg_end', 'qual_start', 'qual_end', 'status'];

        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                tournament[field] = req.body[field];
            }
        });

        await tournament.save();
        res.json(tournament);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};

// 删除赛事（需 host 权限）
exports.deleteTournament = async (req, res) => {
    try {
        const { tid } = req.params;
        const tournament = await Tournament.findByPk(tid);
        if (!tournament) {
            return res.status(404).json({ message: '赛事不存在' });
        }
        await tournament.destroy();
        res.json({ message: '删除成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: req.t('common.serverError') });
    }
};
