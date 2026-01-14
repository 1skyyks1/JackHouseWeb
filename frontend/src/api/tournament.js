import request from '@/utils/request'

// ========== 公开 API ==========
// 获取赛事列表
export const getTournaments = () => request.get('/t')

// 获取赛事详情
export const getTournament = (tid) => request.get(`/t/${tid}`)

// 获取队伍列表
export const getTeams = (tid) => request.get(`/t/${tid}/teams`)

// 获取 Staff 列表
export const getStaff = (tid) => request.get(`/t/${tid}/staff`)

// ========== 选手 API ==========
// 创建队伍
export const createTeam = (tid, data) => request.post(`/t/${tid}/team`, data)

// 加入队伍
export const joinTeam = (tid, inviteCode) => request.post(`/t/${tid}/team/join`, { invite_code: inviteCode })

// 离开队伍
export const leaveTeam = (tid) => request.delete(`/t/${tid}/team/leave`)

// ========== 管理 API ==========
// 创建赛事
export const createTournament = (data) => request.post('/t', data)

// 更新赛事
export const updateTournament = (tid, data) => request.put(`/t/${tid}`, data)

// 删除赛事
export const deleteTournament = (tid) => request.delete(`/t/${tid}`)

// 审核队伍
export const updateTeamStatus = (tid, teamId, status) => request.put(`/t/${tid}/team/${teamId}`, { status })

// 批量通过审核
export const approveAllTeams = (tid) => request.post(`/t/${tid}/team/approve-all`)

// 添加 Staff
export const addStaff = (tid, userId, role) => request.post(`/t/${tid}/staff`, { user_id: userId, role })

// 移除 Staff
export const removeStaff = (tid, staffId) => request.delete(`/t/${tid}/staff/${staffId}`)

// ========== 资格赛 API ==========
// 获取资格赛图池
export const getQualMappool = (tid) => request.get(`/t/${tid}/qualifier/mappool`)

// 获取资格赛成绩
export const getQualScores = (tid) => request.get(`/t/${tid}/qualifier/scores`)

// 获取资格赛排名
export const getQualRanking = (tid) => request.get(`/t/${tid}/qualifier/ranking`)

// 添加资格赛图（管理）
export const addQualMap = (tid, data) => request.post(`/t/${tid}/qualifier/mappool`, data)

// 更新资格赛图（管理）
export const updateQualMap = (tid, mapId, data) => request.put(`/t/${tid}/qualifier/mappool/${mapId}`, data)

// 删除资格赛图（管理）
export const deleteQualMap = (tid, mapId) => request.delete(`/t/${tid}/qualifier/mappool/${mapId}`)

// 从 MP 获取成绩（管理）
export const fetchQualScores = (tid, mpId, teamId) => request.post(`/t/${tid}/qualifier/fetch-scores`, { mp_id: mpId, team_id: teamId })

// 计算排名（管理）
export const calculateRanking = (tid) => request.post(`/t/${tid}/qualifier/calculate-ranking`)

// ========== 正赛 API ==========
// 获取轮次列表
export const getRounds = (tid) => request.get(`/t/${tid}/rounds`)

// 获取对阵表
export const getBracket = (tid) => request.get(`/t/${tid}/bracket`)

// 获取轮次图池
export const getRoundMappool = (tid, roundId) => request.get(`/t/${tid}/round/${roundId}/mappool`)

// 获取比赛详情
export const getMatch = (tid, matchId) => request.get(`/t/${tid}/match/${matchId}`)

// 创建轮次（管理）
export const createRound = (tid, data) => request.post(`/t/${tid}/round`, data)

// 更新轮次（管理）
export const updateRound = (tid, roundId, data) => request.put(`/t/${tid}/round/${roundId}`, data)

// 删除轮次（管理）
export const deleteRound = (tid, roundId) => request.delete(`/t/${tid}/round/${roundId}`)

// 添加轮次图池（管理）
export const addRoundMap = (tid, roundId, data) => request.post(`/t/${tid}/round/${roundId}/mappool`, data)

// 删除轮次图池（管理）
export const deleteRoundMap = (tid, mapId) => request.delete(`/t/${tid}/round/mappool/${mapId}`)

// 生成对阵表（管理）
export const generateBracket = (tid, roundId) => request.post(`/t/${tid}/bracket/generate`, { round_id: roundId })

// 创建比赛（管理）
export const createMatch = (tid, data) => request.post(`/t/${tid}/match`, data)

// 更新比赛（管理）
export const updateMatch = (tid, matchId, data) => request.put(`/t/${tid}/match/${matchId}`, data)

// 从 MP 获取比赛分数（管理）
export const fetchMatchScores = (tid, matchId) => request.post(`/t/${tid}/match/${matchId}/fetch-scores`)

// ========== 裁判工作台 API ==========
// 获取裁判工作台数据
export const getRefereeData = (tid, matchId) => request.get(`/t/${tid}/referee/${matchId}`)

// 记录 Roll 点
export const recordRoll = (tid, matchId, team1Roll, team2Roll) =>
    request.post(`/t/${tid}/referee/${matchId}/roll`, { team1_roll: team1Roll, team2_roll: team2Roll })

// 记录 Protect/Ban/Pick
export const recordAction = (tid, matchId, mapId, actionType, actionBy) =>
    request.post(`/t/${tid}/referee/${matchId}/action`, { map_id: mapId, action_type: actionType, action_by: actionBy })

// 记录暂停
export const recordTimeout = (tid, matchId, team) =>
    request.post(`/t/${tid}/referee/${matchId}/timeout`, { team })

// 更新单局比分
export const updateGameScore = (tid, matchId, gameId, data) =>
    request.put(`/t/${tid}/referee/${matchId}/game/${gameId}`, data)

// 撤销上一步
export const undoLastAction = (tid, matchId) =>
    request.delete(`/t/${tid}/referee/${matchId}/undo`)
