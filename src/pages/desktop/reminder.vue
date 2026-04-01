<template>
    <view class="reminder-mini" @click="openWorkbench('/pages/desktop/home')">
        <view class="reminder-mini__close" @click.stop="closeReminder">×</view>
        <view v-if="currentResource" class="reminder-mini__body">
            <view class="reminder-mini__name">
                {{ currentResource.name || currentResource.resource_name || '云电脑' }}
            </view>
            <view class="reminder-mini__countdown" :class="{ 'is-expired': isExpired }">
                {{ countdownText }}
            </view>
        </view>
        <view v-else class="reminder-mini__body">
            <view class="reminder-mini__name">暂无到期提醒</view>
            <view class="reminder-mini__countdown reminder-mini__countdown--ok">正常</view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { getCloudHomeData } from '@/api/cloud'
import { useUserStore } from '@/stores/user'
import { hideDesktopReminderWindow, isDesktopClient, openDesktopRoute } from '@/utils/desktop'
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'
import { computed, reactive, ref } from 'vue'

type CloudResourceItem = {
    id?: number | string
    name?: string
    resource_name?: string
    desktop_oid?: string
    expired_at?: number | string
    expired_at_text?: string
    status_text?: string
}

const userStore = useUserStore()

const state = reactive({
    items: [] as CloudResourceItem[]
})

const currentResource = computed(() => state.items[0] || null)
const nowSeconds = ref(Math.floor(Date.now() / 1000))

const isExpired = computed(() => {
    const expiredAt = Number(currentResource.value?.expired_at || 0)
    if (!expiredAt) return false
    return expiredAt - nowSeconds.value <= 0
})

const countdownText = computed(() => {
    const item = currentResource.value
    if (!item) return ''

    const expiredAt = Number(item.expired_at || 0)
    if (!expiredAt) return ''

    const diff = expiredAt - nowSeconds.value
    if (diff <= 0) return '已到期'

    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)

    if (days > 0) return `${days}天${hours}时`
    if (hours > 0) return `${hours}时${minutes}分`
    return `${Math.max(minutes, 1)}分钟`
})

let refreshTimer: ReturnType<typeof setInterval> | null = null
let tickTimer: ReturnType<typeof setInterval> | null = null

const openWorkbench = async (url: string) => {
    if (isDesktopClient()) {
        await openDesktopRoute(url)
        await hideDesktopReminderWindow()
        return
    }
    uni.reLaunch({ url })
}

const normalizeItems = (items: CloudResourceItem[]) => {
    return items
        .filter((item) => Number(item?.expired_at || 0) > 0)
        .sort((left, right) => Number(left.expired_at || 0) - Number(right.expired_at || 0))
        .slice(0, 1)
}

const loadData = async () => {
    try {
        if (!userStore.isLogin) {
            state.items = []
            return
        }
        const homeData = await getCloudHomeData()
        state.items = normalizeItems(
            Array.isArray(homeData?.latest_resources) ? homeData.latest_resources : []
        )
    } catch {
        state.items = []
    }
}

const clearTimers = () => {
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null }
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null }
}

const startTimers = () => {
    clearTimers()
    refreshTimer = setInterval(() => loadData(), 60000)
    tickTimer = setInterval(() => { nowSeconds.value = Math.floor(Date.now() / 1000) }, 1000)
}

const closeReminder = () => {
    hideDesktopReminderWindow()
}

onShow(() => {
    loadData()
    startTimers()
})

onHide(() => clearTimers())
onUnload(() => clearTimers())
</script>

<style scoped lang="scss">
.reminder-mini {
    width: 100%;
    height: 100vh;
    padding: 8px;
    box-sizing: border-box;
    background: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    border-radius: var(--md-radius-md);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.reminder-mini__close {
    position: absolute;
    top: 2px;
    right: 4px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: var(--md-on-surface-variant);
    cursor: pointer;
    border-radius: var(--md-radius-full);
    &:hover { background: var(--md-surface-variant); }
}

.reminder-mini__body {
    text-align: center;
}

.reminder-mini__name {
    font-size: 11px;
    color: var(--md-on-surface-variant);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
}

.reminder-mini__countdown {
    margin-top: 4px;
    font-size: 22px;
    font-weight: 700;
    color: var(--md-error);
    line-height: 1.2;

    &.is-expired {
        color: var(--status-expired-fg);
    }
}

.reminder-mini__countdown--ok {
    color: #059669;
}
</style>
