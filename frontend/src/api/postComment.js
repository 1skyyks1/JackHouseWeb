import request from "@/utils/request";

export function commentByPostId(page, pageSize, postId){
    return request({
        url: '/comment/post/' + postId,
        method: 'GET',
        params: {
            page,
            pageSize
        }
    })
}

export function commentList(page, pageSize){
    return request({
        url: '/comment',
        method: 'GET',
        params: {
            page,
            pageSize
        }
    })
}

export function commentByUserId(page, pageSize, userId){
    return request({
        url: '/comment/user/' + userId,
        method: 'GET',
        params: {
            page,
            pageSize
        }
    })
}

export function postCommentCreate(data){
    return request({
        url: '/comment',
        method: 'POST',
        data: data
    })
}

export function postCommentUpdate(commentId, comment){
    return request({
        url: '/comment/' + commentId,
        method: 'PUT',
        data: {
            comment: comment
        }
    })
}

export function postCommentDelete(commentId){
    return request({
        url: '/comment/' + commentId,
        method: 'DELETE',
    })
}