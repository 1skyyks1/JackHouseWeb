import request from "@/utils/request";

// 获取所有帖子
export function postList(){
    return request({
        url: '/post',
        method: 'GET'
    })
}

// 根据类型type获取帖子
export function postByType(type){
    return request({
        url: '/post/type/' + type,
        method: 'GET'
    })
}

// 根据userId获取帖子
export function postByUserId(userId){
    return request({
        url: '/post/user/' + userId,
        method: 'GET'
    })
}

// 根据postId获取单个帖子
export function postById(postId){
    return request({
        url: '/post/' + postId,
        method: 'GET'
    })
}

// 创建帖子
export function postCreate(data){
    return request({
        url: '/post',
        method: 'POST',
        data: data
    })
}

// 更新帖子
export function postUpdate(postId, data){
    return request({
        url: '/post' + postId,
        method: 'PUT',
        data: data
    })
}

// 删除帖子
export function postDelete(postId){
    return request({
        url: '/post' + postId,
        method: 'DELETE'
    })
}