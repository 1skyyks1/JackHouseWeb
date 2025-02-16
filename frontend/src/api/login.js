import request from "@/utils/request";

export function userRegister(data){
    return request({
        url: '/auth/register',
        method: 'POST',
        data: data
    })
}

export function userLogin(identifier, password){
    const data = {
        identifier: identifier,
        password: password
    }
    return request({
        url: '/auth/login',
        method: 'POST',
        data: data
    })
}