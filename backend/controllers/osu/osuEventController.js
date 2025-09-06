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
        const scores = await api.getUserScores(osuUser, "recent", osu.Ruleset.mania, { lazer: false, fails: false }, { limit: 1 });
        const score = scores[0];
        if (!score) {
            // 未获取到最近成绩
            return res.status(400).json({ message: req.t('osuScore.noRecentScore') });
        }

        const stage = await EventStage.findOne({
            where: { map_id: score.beatmap_id, event_id }
        })
        if (!stage) {
            // 最近成绩谱面不正确
            return res.status(400).json({ message: req.t('osuScore.invalidStage') });
        }

        let eventScore = await EventScore.findOne({
            where: { user_id, stage_id: stage.id },
        })
        if (eventScore) {
            if (eventScore.score < score.legacy_total_score) {
                eventScore.score = score.legacy_total_score;
                await eventScore.save();
            }
            else {
                // 未取得更高分数
                return res.status(400).json({ message: req.t('osuScore.scoreNotHigher') });
            }
        } else {
            eventScore = await EventScore.create({
                stage_id: stage.id,
                user_id: user_id,
                score: score.legacy_total_score,
            })
        }
        res.status(200).json({ data: eventScore })
    } catch (error) {
        // 错误
        console.log(error)
        res.status(500).json({ message: req.t('osuScore.serverError') });
    }
}