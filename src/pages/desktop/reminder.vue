<template>
    <view class="reminder-mini">
        <view class="reminder-mini__drag-handle"></view>
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
        <view class="reminder-mini__cta" @click.stop="openWorkbench('/pages/desktop/home')">
            返回主界面
        </view>
    </view>
</template>

<script setup lang="ts">
import { getCloudHomeData } from '@/api/cloud'
import { useUserStore } from '@/stores/user'
import { useCountdown, formatCountdown } from '@/hooks/useCountdown'
import { hideDesktopReminderWindow, isDesktopClient, openDesktopRoute } from '@/utils/desktop'
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'
import { computed, reactive } from 'vue'
import type { CloudResourceItem } from '@/types/cloud'

const userStore = useUserStore()

const state = reactive({
    items: [] as CloudResourceItem[]
})

const currentResource = computed(() => state.items[0] || null)
const { nowSeconds, startTick, stopTick } = useCountdown()

const isExpired = computed(() => {
    const expiredAt = Number(currentResource.value?.expired_at || 0)
    if (!expiredAt) return false
    return expiredAt - nowSeconds.value <= 0
})

const countdownText = computed(() => {
    const item = currentResource.value
    if (!item) return ''
    return formatCountdown(Number(item.expired_at || 0), nowSeconds.value)
})

let refreshTimer: ReturnType<typeof setInterval> | null = null

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
    if (refreshTimer) {
        clearInterval(refreshTimer)
        refreshTimer = null
    }
    stopTick()
}

const startTimers = () => {
    clearTimers()
    refreshTimer = setInterval(() => loadData(), 60000)
    startTick()
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
    -webkit-app-region: no-drag;
}

.reminder-mini__drag-handle {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 24px;
    -webkit-app-region: drag;
    cursor: move;
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
    &:hover {
        background: var(--md-surface-variant);
    }
}

.reminder-mini__body {
    text-align: center;
    -webkit-app-region: no-drag;
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

.reminder-mini__cta {
    margin-top: 6px;
    padding: 6px 16px;
    border-radius: var(--md-radius-sm);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    -webkit-app-region: no-drag;
}
</style>
