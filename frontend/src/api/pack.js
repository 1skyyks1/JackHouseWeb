import request from "@/utils/request";

// 获取所有包
export function packList(page, pageSize, searchKeys, tags) {
    return request({
        url: '/pack',
        method: "GET",
        params: {
            page,
            pageSize,
            searchKeys,
            tags,
        }
    })
}

// 获取指定包信息
export function packById(pack_id) {
    return request({
        url: `/pack/${pack_id}`,
        method: "GET",
    })
}

// 创建图包
export function packCreate(data) {
    return request({
        url: '/pack',
        method: "POST",
        data: data,
    })
}