import { client } from '@/utils/client'
import request from '@/utils/request'
import { useAffiliateStore } from '@/stores/affiliate'

function withAffiliatePayload(data: Record<string, any>) {
    const affiliateStore = useAffiliateStore()
    return {
        ...data,
        ...affiliateStore.payload
    }
}

// 登录
export function login(data: Record<string, any>) {
    return request.post({ url: '/login/account', data: { ...withAffiliatePayload(data), terminal: client } })
}

//注册
export function register(data: Record<string, any>) {
    return request.post({ url: '/login/register', data: { ...withAffiliatePayload(data), channel: client } })
}

