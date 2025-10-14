import request from '@/utils/request.js'

export function badgeList(page, pageSize) {
    return request({
        url: '/badge',
        method: 'GET',
        params: {
            page,
            pageSize
        }
    })
}

export function badgeUpload(data) {
    return request({
        url: '/badge',
        method: 'POST',
        data: data,
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })
}

// data: { "userIds": [1, 2, 3] }
export function badgeAddUser(id, data) {
    return request({
        url: '/badge/' + id,
        method: 'POST',
        data: data,
    })
}

export function badgeDelete(id) {
    return request({
        url: '/badge/' + id,
        method: 'DELETE',
    })
}