<template>
    <view class="reminder-page">
        <view class="float-card">
            <view class="float-card__head">
                <view class="float-card__eyebrow">到期悬窗</view>
                <view class="float-card__close" @click="closeReminder">×</view>
            </view>

            <view class="float-card__title">
                {{ currentResource?.name || currentResource?.resource_name || currentResource?.desktop_oid || '暂无即将到期的云电脑' }}
            </view>

            <template v-if="currentResource">
                <view class="float-card__meta">到期时间：{{ currentResource.expired_at_text || '-' }}</view>
                <view class="float-card__countdown">{{ countdownText }}</view>
                <view class="float-card__status">{{ currentResource.status_text || '到期提醒' }}</view>
            </template>

            <template v-else>
                <view class="float-card__meta">当前没有需要提醒的云电脑资源</view>
                <view class="float-card__countdown float-card__countdown--empty">保持正常</view>
            </template>

            <view class="float-card__actions">
                <view class="float-card__button float-card__button--primary" @click="openWorkbench('/pages/desktop/home')">
                    打开工作台
                </view>
                <view class="float-card__button" @click="manualRefresh">刷新</view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { getCloudHomeData } from '@/api/cloud'
import { useUserStore } from '@/stores/user'
import { hideDesktopReminderWindow, isDesktopClient, openDesktopRoute } from '@/utils/desktop'
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'
import { computed, reactive } from 'vue'

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
    loading: false,
    items: [] as CloudResourceItem[]
})

const isLogin = computed(() => userStore.isLogin)
const currentResource = computed(() => state.items[0] || null)
const countdownText = computed(() => {
    const item = currentResource.value
    if (!item) return '暂无提醒'

    const expiredAt = Number(item.expired_at || 0)
    if (!expiredAt) return '暂无提醒'

    const diff = expiredAt - Math.floor(Date.now() / 1000)
    if (diff <= 0) return '已到期'

    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)

    if (days > 0) return `${days}天${hours}小时`
    if (hours > 0) return `${hours}小时${minutes}分钟`
    return `${Math.max(minutes, 1)}分钟`
})

let refreshTimer: ReturnType<typeof setInterval> | null = null

const go = (url: string, needLogin = false) => {
    if (needLogin && !isLogin.value) {
        uni.navigateTo({ url: '/pages/login/login' })
        return
    }
    if (url.startsWith('/pages/desktop/')) {
        uni.reLaunch({ url })
        return
    }
    uni.navigateTo({ url })
}

const openWorkbench = async (url: string, needLogin = false) => {
    if (needLogin && !isLogin.value) {
        uni.navigateTo({ url: '/pages/login/login' })
        return
    }

    if (isDesktopClient()) {
        await openDesktopRoute(url)
        await hideDesktopReminderWindow()
        return
    }

    go(url, needLogin)
}

const normalizeItems = (items: CloudResourceItem[]) => {
    return items
        .filter((item) => Number(item?.expired_at || 0) > 0)
        .sort((left, right) => Number(left.expired_at || 0) - Number(right.expired_at || 0))
        .slice(0, 1)
}

const loadData = async () => {
    state.loading = true

    try {
        if (!isLogin.value) {
            state.items = []
            return
        }

        const homeData = await getCloudHomeData()
        state.items = normalizeItems(
            Array.isArray(homeData?.latest_resources) ? homeData.latest_resources : []
        )
    } catch (error) {
        state.items = []
        if (typeof error !== 'string') {
            uni.$u.toast('悬窗加载失败')
        }
    } finally {
        state.loading = false
    }
}

const clearRefreshTimer = () => {
    if (refreshTimer) {
        clearInterval(refreshTimer)
        refreshTimer = null
    }
}

const startRefreshTimer = () => {
    clearRefreshTimer()
    refreshTimer = setInterval(() => {
        loadData()
    }, 60000)
}

const manualRefresh = () => {
    loadData()
}

const closeReminder = () => {
    hideDesktopReminderWindow()
}

onShow(() => {
    loadData()
    startRefreshTimer()
})

onHide(() => {
    clearRefreshTimer()
})

onUnload(() => {
    clearRefreshTimer()
})
</script>

<style scoped lang="scss">
.reminder-page {
    min-height: 100vh;
    padding: 10px;
    box-sizing: border-box;
    background: transparent;
}

.float-card {
    min-height: calc(100vh - 20px);
    padding: 16px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.float-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.float-card__eyebrow {
    color: #2563eb;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
}

.float-card__close {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    color: #475569;
    font-size: 18px;
    font-weight: 700;
}

.float-card__title {
    margin-top: 10px;
    color: #0f172a;
    font-size: 18px;
    line-height: 1.35;
    font-weight: 700;
}

.float-card__meta {
    margin-top: 12px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.6;
}

.float-card__countdown {
    margin-top: 18px;
    color: #ef4444;
    font-size: 30px;
    line-height: 1;
    font-weight: 700;
}

.float-card__countdown--empty {
    color: #16a34a;
}

.float-card__status {
    margin-top: 10px;
    display: inline-flex;
    align-self: flex-start;
    padding: 6px 10px;
    border-radius: 999px;
    background: #eff6ff;
    color: #2563eb;
    font-size: 12px;
    font-weight: 700;
}

.float-card__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 18px;
}

.float-card__button {
    height: 38px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eff6ff;
    color: #2563eb;
    font-size: 13px;
    font-weight: 700;
}

.float-card__button--primary {
    background: linear-gradient(135deg, #2563eb 0%, #635bff 100%);
    color: #ffffff;
}
</style>
