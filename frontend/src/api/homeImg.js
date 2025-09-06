import request from "@/utils/request";

export function homeImgList(page, pageSize){
    return request({
        url: '/homeImg',
        method: 'GET',
        params: {
            page,
            pageSize,
        }
    })
}

export function homeImg(){
    return request({
        url: '/homeImg/home',
        method: 'GET',
    })
}

export function homeImgCreate(data){
    return request({
        url: '/homeImg',
        method: 'POST',
        data: data,
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })
}

export function homeImgUpdate(imgId, data){
    return request({
        url: '/homeImg/' + imgId,
        method: 'PUT',
        data: data
    })
}

export function homeImgDelete(imgId){
    return request({
        url: '/homeImg/' + imgId,
        method: 'DELETE',
    })
}