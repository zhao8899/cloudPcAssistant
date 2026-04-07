import request from '@/utils/request'

export interface AppConfig {
    domain?: string
    website?: Record<string, any>
    login?: Record<string, any>
    style?: Record<string, any>
    [key: string]: any
}

export function smsSend(data: { mobile: string; scene: number | string }) {
    return request.post({ url: '/sms/sendCode', data })
}

export function getConfig() {
    return request.get<AppConfig>({ url: '/index/config' })
}

export function getPolicy(data: { type: string | number }) {
    return request.get<{ title: string; content: string }>({ url: '/index/policy', data })
}

export function uploadImage(file: string) {
    return request.uploadFile({
        url: '/upload/image',
        filePath: file,
        name: 'file',
        fileType: 'image'
    })
}
