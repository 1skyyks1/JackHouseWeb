import request from "@/utils/request";

// 图包下发表评论
export function packCommentCreate(data) {
    return request({
        url: '/packCom',
        method: 'POST',
        data: data
    })
}

// 获取图包评论
export function packCommentList(page, pageSize, pack_id) {
    return request({
        url: '/packCom/' + pack_id,
        method: 'GET',
        params: {
            page: page,
            pageSize: pageSize,
        }
    })
}

// 删除图包评论
export function packCommentDelete(commentId){
    return request({
        url: '/packCom/' + commentId,
        method: 'DELETE',
    })
}