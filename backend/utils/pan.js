const fetch = require('node-fetch');

const url = process.env.PAN_URL
const aid = process.env.PAN_AID;
const key = process.env.PAN_KEY;

/**
 * 获取 AuthCode
 * @returns {Promise<string|null>} 成功返回 AuthCode，失败返回 null
 */
async function getAuthCode() {
    const response = await fetch(
        `${url}/opapi/GetAuthCode?aid=${encodeURIComponent(aid)}&key=${encodeURIComponent(key)}`,
        {
            method: 'GET',
            redirect: 'follow'
        }
    );

    const result = await response.json();

    if (result.code === 200) {
        return result.data;
    } else {
        console.log("获取失败");
        return null;
    }
}

/**
 * 获取临时上传地址
 * @param {string} authCode - 必填，从 getAuthCode 获取
 * @param {string} [fid] - 可选，上传至哪个文件夹
 * @param {number} [time] - 可选，有效时长，单位分钟，默认 30
 * @returns {Promise<{url: string, query: string} | null>}
 */
async function fetchUploadUrl(authCode, fid, time) {
    if (!authCode) {
        console.log("无authCode");
        return null;
    }

    const url = new URL('/opapi/Getuploads', process.env.PAN_URL);
    url.searchParams.append('authcode', authCode);
    if (fid) url.searchParams.append('fid', fid);
    if (time) url.searchParams.append('time', String(time));

    try {
        const response = await fetch(url.toString(), { method: 'GET' });
        const result = await response.json();

        if (result.code === 200 && result.data) {
            return result.data; // { url: "...", query: "..." }
        } else {
            console.log("获取上传地址失败");
            return null;
        }
    } catch (err) {
        console.error("请求错误");
        return null;
    }
}

/**
 * 获取鉴权链接
 * @param {string} [file] - 文件名或链接，例如 xxx.zip
 * @param {string} [authCode] - 可选，从 getAuthCode 获取，传了就不需要 aid/key
 * @returns {Promise<{code: number, msg: string, data: string, total: string} | null>}
 */
async function getSign(file, authCode) {
    const url = new URL('/opapi/GetSign', process.env.PAN_URL);

    if (file) url.searchParams.append('file', file);
    if (authCode) {
        url.searchParams.append('authcode', authCode);
    } else {
        url.searchParams.append('aid', process.env.PAN_AID);
        url.searchParams.append('key', process.env.PAN_KEY);
    }

    try {
        const response = await fetch(url.toString(), { method: 'GET' });
        const result = await response.json();

        if (result.code === 200 && result.data) {
            return result; // { code, msg, data, total }
        } else {
            console.log("获取鉴权链接失败");
            return null;
        }
    } catch (err) {
        console.error("请求错误");
        return null;
    }
}

/**
 * 新增文件夹
 * @param {string} c_name - 文件夹名称
 * @param {string} c_fid - 上级目录ID，不传则新增到根目录
 * @param {string} authCode - authCode
 * @returns {Promise<number | null>}
 */
async function addFolder(c_name, c_fid = '', authCode) {
    if (!authCode) {
        console.error("缺少authCode");
        return null;
    }

    const url = new URL('/opapi/addPath', process.env.PAN_URL);
    url.searchParams.append('authcode', authCode);

    const formData = new URLSearchParams();
    formData.append('c_name', c_name);
    formData.append('c_fid', c_fid);

    try {
        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        const result = await response.json();

        if (result.code === 200) {
            return result.data; // 新增文件夹ID
        } else {
            console.warn("新增文件夹失败");
            return null;
        }
    } catch (err) {
        console.error("请求错误");
        return null;
    }
}


module.exports = { getAuthCode, fetchUploadUrl, getSign, addFolder };