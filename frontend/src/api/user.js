import request from "@/utils/request";

// 获取所有用户
export function userList(){
    return request({
        url: '/user',
        method: 'GET'
    })
}

// 创建用户
export function userCreate(data){
    return request({
        url: '/user',
        method: 'POST',
        data: data
    })
}

// 根据userId获取单个用户
export function userById(userId){
    return request({
        url: '/user/' + userId,
        method: 'GET'
    })
}

// 更新用户信息
export function userUpdate(userId, data){
    return request({
        url: '/user/' + userId,
        method: 'PUT',
        data: data
    })
}

// 删除用户（管理系统）
export function userDelete(userId){
    return request({
        url: '/user/' + userId,
        method: 'DELETE'
    })
}