import request from '@/utils/request'

export interface RechargeConfig {
    min_amount?: number
    template?: Array<{ amount: number; [key: string]: any }>
    [key: string]: any
}

export function recharge(data: { money: number; pay_way: number | string }) {
    return request.post({ url: '/recharge/recharge', data }, { isAuth: true })
}

export function rechargeRecord(data: { page?: number; [key: string]: any }) {
    return request.get({ url: '/recharge/lists', data }, { isAuth: true })
}

export function rechargeConfig() {
    return request.get<RechargeConfig>({ url: '/recharge/config' }, { isAuth: true })
}
