import request from "@/utils/request";

// 获取所有tags
export function tagList(){
    return request({
        url: '/tag',
        method: 'GET',
    })
}