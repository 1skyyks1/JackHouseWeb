const { refreshAccessToken } = require('./oauth');
const User = require('../models/user');

async function callOsuApi(userId, endpoint) {
    const user = await User.findOne({ where: { user_id: userId } });
    if (!user) {
        throw new Error('User not found');
    }

    let accessToken = user.access_token; // 假设 access_token 也保存在数据库中
    const now = Math.floor(Date.now() / 1000);

    // 检查 access_token 是否过期
    if (user.token_expires_at < now) {
        const tokenResponse = await refreshAccessToken(user.refresh_token);
        accessToken = tokenResponse.access_token;

        // 更新数据库中的 access_token 和 refresh_token
        user.access_token = tokenResponse.access_token;
        user.refresh_token = tokenResponse.refresh_token;
        user.token_expires_at = now + tokenResponse.expires_in;
        await user.save();
    }

    // 使用新的 access_token 调用 API
    const response = await fetch(`https://osu.ppy.sh/api/v2/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return response.json();
}

module.exports = {
    callOsuApi,
};