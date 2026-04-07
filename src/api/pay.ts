import request from '@/utils/request'

export interface PayWay {
    id: number | string
    name?: string
    icon?: string
    [key: string]: any
}

export interface PrepayParams {
    order_id: number | string
    pay_way: number | string
    [key: string]: any
}

export interface PrepayResult {
    order_id?: number | string
    pay_url?: string
    [key: string]: any
}

export function getPayWay(data: { from?: string; [key: string]: any }) {
    return request.get<PayWay[]>({ url: '/pay/payWay', data }, { isAuth: true })
}

export function prepay(data: PrepayParams) {
    return request.post<PrepayResult>({ url: '/pay/prepay', data }, { isAuth: true })
}

export function getPayResult(data: { order_id: number | string }) {
    return request.get<{ pay_status: number; pay_way?: string }>({ url: '/pay/payStatus', data }, { isAuth: true })
}
