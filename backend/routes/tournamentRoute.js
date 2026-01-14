const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { isHost, isReferee, isPooler, isStaff } = require('../middleware/tournamentAuth');

// 控制器
const tournamentController = require('../controllers/tournament/tournamentController');
const teamController = require('../controllers/tournament/teamController');
const staffController = require('../controllers/tournament/staffController');
const qualifierController = require('../controllers/tournament/qualifierController');
const matchController = require('../controllers/tournament/matchController');
const { Tournament } = require('../models/tournament');
const { Op } = require('sequelize');

// ========== 参数解析：支持 ID 或 Acronym（大小写不敏感） ==========
router.param('tid', async (req, res, next, tid) => {
    try {
        let tournament;
        // 判断是否为纯数字（当作 ID）
        if (/^\d+$/.test(tid)) {
            tournament = await Tournament.findByPk(tid);
            // 如果用 ID 找不到，尝试用 acronym（支持纯数字的 acronym）
            if (!tournament) {
                tournament = await Tournament.findOne({
                    where: { acronym: { [Op.like]: tid } }
                });
            }
        } else {
            // 非数字，直接用 Acronym 查找（大小写不敏感）
            tournament = await Tournament.findOne({
                where: { acronym: { [Op.like]: tid } }
            });
        }

        if (!tournament) {
            return res.status(404).json({ message: '赛事不存在' });
        }

        // 将解析后的 ID 重写到 params，确保后续逻辑正常
        req.params.tid = tournament.id;
        req.tournament = tournament;
        next();
    } catch (error) {
        console.error('tid 解析失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// ========== 公开路由 ==========
// 赛事列表
router.get('/', tournamentController.getTournaments);

// 赛事详情
router.get('/:tid', tournamentController.getTournament);

// 队伍列表
router.get('/:tid/teams', teamController.getTeams);

// Staff 列表
router.get('/:tid/staff', staffController.getStaff);

// 资格赛图池
router.get('/:tid/qualifier/mappool', qualifierController.getQualMappool);

// 资格赛成绩
router.get('/:tid/qualifier/scores', qualifierController.getQualScores);

// 资格赛排名
router.get('/:tid/qualifier/ranking', qualifierController.getQualRanking);

// 轮次列表
router.get('/:tid/rounds', matchController.getRounds);

// 对阵表
router.get('/:tid/bracket', matchController.getBracket);

// 轮次图池
router.get('/:tid/round/:roundId/mappool', matchController.getRoundMappool);

// 比赛详情
router.get('/:tid/match/:matchId', matchController.getMatch);

// ========== 需要登录的路由 ==========
// 创建队伍
router.post('/:tid/team', authMiddleware(), teamController.createTeam);

// 加入队伍
router.post('/:tid/team/join', authMiddleware(), teamController.joinTeam);

// 离开队伍
router.delete('/:tid/team/leave', authMiddleware(), teamController.leaveTeam);

// ========== 管理路由（需要 Staff 权限）==========
// 创建赛事
router.post('/', authMiddleware(), tournamentController.createTournament);

// 更新赛事
router.put('/:tid', authMiddleware(), isHost, tournamentController.updateTournament);

// 删除赛事
router.delete('/:tid', authMiddleware(), isHost, tournamentController.deleteTournament);

// 审核队伍
router.put('/:tid/team/:teamId', authMiddleware(), isHost, teamController.updateTeamStatus);

// 批量通过审核
router.post('/:tid/team/approve-all', authMiddleware(), isHost, teamController.approveAllTeams);

// 添加 Staff
router.post('/:tid/staff', authMiddleware(), isHost, staffController.addStaff);

// 移除 Staff
router.delete('/:tid/staff/:staffId', authMiddleware(), isHost, staffController.removeStaff);

// ========== 资格赛管理路由 ==========
// 添加资格赛图
router.post('/:tid/qualifier/mappool', authMiddleware(), isPooler, qualifierController.addQualMap);

// 更新资格赛图
router.put('/:tid/qualifier/mappool/:mapId', authMiddleware(), isPooler, qualifierController.updateQualMap);

// 删除资格赛图
router.delete('/:tid/qualifier/mappool/:mapId', authMiddleware(), isPooler, qualifierController.deleteQualMap);

// 从 MP 获取成绩
router.post('/:tid/qualifier/fetch-scores', authMiddleware(), isReferee, qualifierController.fetchQualScoresFromMp);

// 计算排名
router.post('/:tid/qualifier/calculate-ranking', authMiddleware(), isHost, qualifierController.calculateRanking);

// ========== 正赛管理路由 ==========
// 创建轮次
router.post('/:tid/round', authMiddleware(), isHost, matchController.createRound);

// 更新轮次
router.put('/:tid/round/:roundId', authMiddleware(), isHost, matchController.updateRound);

// 删除轮次
router.delete('/:tid/round/:roundId', authMiddleware(), isHost, matchController.deleteRound);

// 添加轮次图池
router.post('/:tid/round/:roundId/mappool', authMiddleware(), isPooler, matchController.addRoundMap);

// 删除轮次图池
router.delete('/:tid/round/mappool/:mapId', authMiddleware(), isPooler, matchController.deleteRoundMap);

// 生成对阵表
router.post('/:tid/bracket/generate', authMiddleware(), isHost, matchController.generateBracket);

// 创建比赛
router.post('/:tid/match', authMiddleware(), isHost, matchController.createMatch);

// 更新比赛
router.put('/:tid/match/:matchId', authMiddleware(), isReferee, matchController.updateMatch);

// 从 MP 获取比赛分数
router.post('/:tid/match/:matchId/fetch-scores', authMiddleware(), isReferee, matchController.fetchMatchScores);

// ========== 裁判工作台路由 ==========
const refereeController = require('../controllers/tournament/refereeController');

// 获取裁判工作台数据
router.get('/:tid/referee/:matchId', authMiddleware(), isReferee, refereeController.getRefereeData);

// 记录 Roll 点
router.post('/:tid/referee/:matchId/roll', authMiddleware(), isReferee, refereeController.recordRoll);

// 记录 Protect/Ban/Pick
router.post('/:tid/referee/:matchId/action', authMiddleware(), isReferee, refereeController.recordAction);

// 记录暂停
router.post('/:tid/referee/:matchId/timeout', authMiddleware(), isReferee, refereeController.recordTimeout);

// 更新单局比分
router.put('/:tid/referee/:matchId/game/:gameId', authMiddleware(), isReferee, refereeController.updateGameScore);

// 撤销上一步
router.delete('/:tid/referee/:matchId/undo', authMiddleware(), isReferee, refereeController.undoLastAction);

module.exports = router;
