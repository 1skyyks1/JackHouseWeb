import request from "@/utils/request";

export function homeDashboard(){
    return request({
        url: '/dashboard/home',
        method: "GET",
    })
}