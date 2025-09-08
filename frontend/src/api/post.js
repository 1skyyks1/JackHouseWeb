import request from "@/utils/request";

// 获取所有帖子
export function postList(page, pageSize){
    return request({
        url: '/post',
        method: 'GET',
        params: {
            page,
            pageSize,
        }
    })
}

// 根据类型type获取帖子
export function postByType(type, page, pageSize){
    return request({
        url: '/post/type/' + type,
        method: 'GET',
        params: {
            page,
            pageSize,
        }
    })
}

// 根据userId获取帖子
export function postByUserId(userId, page, pageSize){
    return request({
        url: '/post/user/' + userId,
        method: 'GET',
        params: {
            page,
            pageSize,
        }
    })
}

// 根据userId获取 征稿 帖
export function requestPostList(){
    return request({
        url: '/post/requestPost',
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
        url: '/post/' + postId,
        method: 'PUT',
        data: data
    })
}

// 删除帖子
export function postDelete(postId){
    return request({
        url: '/post/' + postId,
        method: 'DELETE'
    })
}

//搜索帖子
export function postSearch(keyword, locale, page, pageSize){
    return request({
        url: '/post/search',
        method: 'GET',
        params: {
            keyword,
            locale,
            page,
            pageSize,
        }
    })
}

// 获取每种类型最新的三个帖子
export function allType3Post(){
    return request({
        url: '/post/forum',
        method: 'GET',
    })
}

export function postWithContentByType(type, page, pageSize){
    return request({
        url: '/post/typeWithContent/' + type,
        method: 'GET',
        params: {
            page,
            pageSize,
        }
    })
}