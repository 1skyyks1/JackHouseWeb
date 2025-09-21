const { User, Event, EventStage, EventScore } = require('../../models/index');
const sequelize = require('../../config/db')
const osu = require("osu-api-v2-js");

const CLIENT_ID = Number(process.env.OSU_CLIENT_ID);
const CLIENT_SECRET = process.env.OSU_CLIENT_SECRET;

// 从osu获取最近一条分数，用于课题
exports.userRecentScore = async (req, res) => {
    const user_id = req.user.user_id;
    const event_id = req.params.event_id;
    try {
        const event = await Event.findByPk(event_id);
        if (!event) {
            // 未知活动
            return res.status(400).json({ message: req.t('osuScore.eventNotFound') });
        } else {
            const now = new Date();
            const startTime = new Date(event.start);
            const endTime = new Date(event.end);
            if(now < startTime || now > endTime) {
                // 目前不是活动时间
                return res.status(403).json({ message: req.t('osuScore.notEventTime') });
            }
        }

        const user = await User.findByPk(user_id)
        const api = await osu.API.createAsync(CLIENT_ID, CLIENT_SECRET);
        const osuUser = await api.getUser(Number(user.osu_uid));
        const scores = await api.getUserScores(osuUser, "recent", osu.Ruleset.mania, { lazer: false, fails: false }, { limit: 50 });
        if (!scores || scores.length === 0) {
            // 未获取到最近成绩
            return res.status(400).json({ message: req.t('osuScore.noRecentScore') });
        }

        const stages = await EventStage.findAll({
            where: { event_id }
        });
        const validMapIds = new Set(stages.map(s => s.map_id));
        const bestScoresMap = new Map();

        for (const score of scores) {
            if (!validMapIds.has(score.beatmap_id)) continue;
            const current = bestScoresMap.get(score.beatmap_id);
            if (!current || score.legacy_total_score > current.legacy_total_score) {
                bestScoresMap.set(score.beatmap_id, score);
            }
        }

        if (bestScoresMap.size === 0) {
            return res.status(400).json({ message: req.t('osuScore.noValidScore') });
        }

        const stageMap = new Map();
        for (const stage of stages) {
            stageMap.set(stage.map_id, stage.id);
        }

        const existingScores = await EventScore.findAll({
            where: {
                user_id,
                stage_id: Array.from(stageMap.values())
            }
        });
        const existingMap = new Map();
        for (const es of existingScores) {
            existingMap.set(es.stage_id, es);
        }

        let hasUpdated = false; // 记录是否有成绩更新
        for (const [beatmap_id, score] of bestScoresMap.entries()) {
            const stage_id = stageMap.get(beatmap_id);
            const existing = existingMap.get(stage_id);

            if (existing) {
                if (score.legacy_total_score > existing.score) {
                    existing.score = score.legacy_total_score;
                    await existing.save();
                    hasUpdated = true;
                }
            } else {
                const newScore = await EventScore.create({
                    stage_id,
                    user_id,
                    score: score.legacy_total_score
                });
                hasUpdated = true;
            }
        }

        if (!hasUpdated) {
            return res.status(400).json({ message: req.t('osuScore.scoreNotHigher') });
        }

        res.status(200).json({ message: req.t('osuScore.updateSuccess') });
    } catch (error) {
        // 错误
        console.log(error)
        res.status(500).json({ message: req.t('osuScore.serverError') });
    }
}