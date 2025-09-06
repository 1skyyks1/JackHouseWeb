import request from "@/utils/request";

export function eventList(page, pageSize, isActive, isClosest) {
    return request({
        url: '/event',
        method: 'GET',
        params: {
            page,
            pageSize,
            isActive,
            isClosest
        }
    })
}

export function eventInfo(event_id) {
    return request({
        url: `/event/${event_id}`,
        method: 'GET',
    })
}

export function eventCreate(data) {
    return request({
        url: '/event',
        method: 'POST',
        data: data
    })
}

export function eventUpdate(event_id, data) {
    return request({
        url: `/event/${event_id}`,
        method: 'PUT',
        data: data
    })
}

export function eventDelete(event_id) {
    return request({
        url: `/event/${event_id}`,
        method: 'DELETE'
    })
}

export function eventStages(event_id) {
    return request({
        url: `/event/${event_id}/stage`,
        method: 'GET',
    })
}

export function stageCreate(data) {
    return request({
        url: '/event/stage',
        method: 'POST',
        data: data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export function stageUpdate(stage_id, data) {
    return request({
        url: `/event/stage/${stage_id}`,
        method: 'PUT',
        data: data
    })
}

export function stageDelete(stage_id) {
    return request({
        url: `/event/stage/${stage_id}`,
        method: 'DELETE'
    })
}

export function stageScore(page, pageSize, stage_id) {
    return request({
        url: `/event/rank/stage/${stage_id}`,
        method: 'GET',
        params: {
            page,
            pageSize,
        }
    })
}

export function eventScore(page, pageSize, event_id) {
    return request({
        url: `/event/rank/event/${event_id}`,
        method: 'GET',
        params: {
            page,
            pageSize,
        }
    })
}

export function userScore(event_id) {
    return request({
        url: `/event/userRecord/${event_id}`,
        method: 'GET'
    })
}

export function scoreCreate(event_id) {
    return request({
        url: `/event/${event_id}/score`,
        method: 'POST',
    })
}