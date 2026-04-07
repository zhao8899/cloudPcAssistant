import request from '@/utils/request'

export interface UserInfo {
    id?: number | string
    nickname?: string
    avatar?: string
    mobile?: string
    [key: string]: any
}

export function getUserCenter(header?: any) {
    return request.get<UserInfo>({ url: '/user/center', header }, { ignoreCancel: true })
}

export function getUserInfo() {
    return request.get<UserInfo>({ url: '/user/info' }, { isAuth: true })
}

export function userEdit(data: { nickname?: string; avatar?: string; [key: string]: any }) {
    return request.post({ url: '/user/setInfo', data }, { isAuth: true })
}

export function userBindMobile(data: { mobile: string; code: string }, header?: any) {
    return request.post({ url: '/user/bindMobile', data, header }, { isAuth: true })
}

export function userMnpMobile(data: { code: string }) {
    return request.post({ url: '/user/getMobileByMnp', data }, { isAuth: true })
}

export function userChangePwd(data: { old_password: string; password: string; password_confirm: string }) {
    return request.post({ url: '/user/changePassword', data }, { isAuth: true })
}

export function forgotPassword(data: { mobile: string; code: string; password: string; password_confirm: string }) {
    return request.post({ url: '/user/resetPassword', data })
}

export function setRecommendUser(data: { user_id: number | string }) {
    return request.post({ url: '/user/setRecommendUser', data }, { isAuth: true })
}

export function setSourceAgentUser(data: { agent_id: number | string }) {
    return request.post({ url: '/user/setSourceAgentUser', data }, { isAuth: true })
}

export function accountLog(data: { page?: number; [key: string]: any }) {
    return request.get({ url: '/account_log/lists', data })
}
