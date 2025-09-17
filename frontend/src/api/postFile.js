import request from "@/utils/request";

// 根据userId获取投稿
export function postFileByUserId(userId, page, pageSize){
    return request({
        url: '/postFile/user/' + userId,
        method: 'GET',
        params: {
            page,
            pageSize
        }
    })
}

// 根据条件获取投稿
export function postFileList(page, pageSize, post_id, status, keyword){
    return request({
        url: '/postFile',
        method: 'GET',
        params: {
            page,
            pageSize,
            post_id,
            status,
            keyword
        }
    })
}

// 创建投稿
export function postFileCreate(data){
    return request({
        url: '/postFile',
        method: 'POST',
        data: data
    })
}

// 更新投稿信息
export function postFileUpdate(fileId, data){
    return request({
        url: '/postFile/' + fileId,
        method: 'PUT',
        data: data
    })
}

// 审核投稿
export function postFileReview(fileId, data){
    return request({
        url: '/postFile/review/' + fileId,
        method: 'PUT',
        data: data
    })
}

// 删除投稿
export function postFileDelete(fileId){
    return request({
        url: '/postFile/' + fileId,
        method: 'DELETE'
    })
}

// 获取上传链接
export function uploadUrl(postId){
    return request({
        url: '/postFile/upload/' + postId,
        method: 'GET',
    })
}

// 获取下载url
export function downloadUrl(fileId){
    return request({
        url: `/postFile/download/` + fileId,
        method: 'GET',
    });
}