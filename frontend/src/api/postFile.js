import request from "@/utils/request";

// 获取所有投稿
export function postFileList(){
    return request({
        url: '/postFile',
        method: 'GET'
    })
}

// 根据userId获取投稿
export function postFileByUserId(userId){
    return request({
        url: '/postFile/user/' + userId,
        method: 'GET'
    })
}

// 根据postId获取单个帖子的所有投稿
export function postFileByPostId(postId){
    return request({
        url: '/postFile/' + postId,
        method: 'GET'
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
        url: '/postFile' + fileId,
        method: 'PUT',
        data: data
    })
}

// 删除投稿
export function postFileDelete(fileId){
    return request({
        url: '/post' + fileId,
        method: 'DELETE'
    })
}