import { ref } from 'vue'

export function useCountdown() {
    const nowSeconds = ref(Math.floor(Date.now() / 1000))
    let tickTimer: ReturnType<typeof setInterval> | null = null

    function startTick() {
        stopTick()
        tickTimer = setInterval(() => {
            nowSeconds.value = Math.floor(Date.now() / 1000)
        }, 1000)
    }

    function stopTick() {
        if (tickTimer) {
            clearInterval(tickTimer)
            tickTimer = null
        }
    }

    return { nowSeconds, startTick, stopTick }
}

export function formatCountdown(expiredAt: number, nowSeconds: number): string {
    if (!expiredAt) return ''
    const diff = expiredAt - nowSeconds
    if (diff <= 0) return '已到期'
    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    if (days > 0) return `${days}天${hours}小时`
    if (hours > 0) return `${hours}小时${minutes}分钟`
    return `${Math.max(minutes, 1)}分钟`
}

export function formatCountdownFull(expiredAt: number, nowSeconds: number): string {
    const base = formatCountdown(expiredAt, nowSeconds)
    if (!base || base === '已到期') return base
    return `${base}后到期`
}
