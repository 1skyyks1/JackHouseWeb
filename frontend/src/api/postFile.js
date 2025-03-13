import request from "@/utils/request";

// 获取所有投稿
export function postFileList(page, pageSize){
    return request({
        url: '/postFile',
        method: 'GET',
        params: {
            page,
            pageSize
        }
    })
}

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

// 根据postId获取单个帖子的所有投稿
export function postFileByPostId(postId, page, pageSize){
    return request({
        url: '/postFile/post/' + postId,
        method: 'GET',
        params: {
            page,
            pageSize
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
        url: '/post/' + fileId,
        method: 'DELETE'
    })
}

// 上传
export function postFileUpload(data){
    return request({
        url: '/postFile/upload',
        method: 'POST',
        data: data,
        headers:{
            'Content-Type': 'multipart/form-data',
        }
    })
}

// 下载
export function postFileUrl(fileId){
    return request({
        url: `/postFile/url/` + fileId,
        method: 'GET',
    });
}