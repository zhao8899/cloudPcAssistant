import { AGENT_ID_KEY, RECOMMEND_ID_KEY } from '@/enums/constantEnums'
import cache from '@/utils/cache'
import { defineStore } from 'pinia'

interface AffiliateState {
    recommendId: number | null
    agentId: number | null
}

const toValidId = (value: unknown): number | null => {
    if (value === '' || value === undefined || value === null) return null
    const id = Number(value)
    if (!Number.isInteger(id) || id <= 0) return null
    return id
}

export const useAffiliateStore = defineStore({
    id: 'affiliateStore',
    state: (): AffiliateState => ({
        recommendId: toValidId(cache.get(RECOMMEND_ID_KEY)),
        agentId: toValidId(cache.get(AGENT_ID_KEY))
    }),
    getters: {
        payload: (state) => ({
            recommend_id: state.recommendId || undefined,
            agent_id: state.agentId || undefined
        })
    },
    actions: {
        setRecommendId(value: unknown) {
            const id = toValidId(value)
            if (!id) return
            this.recommendId = id
            cache.set(RECOMMEND_ID_KEY, id)
        },
        setAgentId(value: unknown) {
            const id = toValidId(value)
            if (!id) return
            this.agentId = id
            cache.set(AGENT_ID_KEY, id)
        },
        capture(params: Record<string, any> = {}) {
            this.setRecommendId(params.pid ?? params.recommend_id ?? params.recommendId)
            this.setAgentId(params.agent_id ?? params.agentId)
        }
    }
})
