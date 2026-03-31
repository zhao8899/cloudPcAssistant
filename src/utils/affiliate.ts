import { useAffiliateStore } from '@/stores/affiliate'

const decodeSceneValue = (scene: string) => {
    try {
        return decodeURIComponent(scene)
    } catch (error) {
        return scene
    }
}

const parseScene = (scene?: string) => {
    if (!scene) return {}
    const decoded = decodeSceneValue(scene)
    const query = decoded.startsWith('?') ? decoded.slice(1) : decoded
    return query.split('&').reduce<Record<string, string>>((result, item) => {
        if (!item) return result
        const [key, ...rest] = item.split('=')
        if (!key) return result
        result[key] = rest.join('=')
        return result
    }, {})
}

export const captureAffiliateParams = (params?: Record<string, any>) => {
    const affiliateStore = useAffiliateStore()
    const query = params || {}
    affiliateStore.capture({
        ...parseScene(query.scene),
        ...query
    })
}
