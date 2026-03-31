<template>
    <view class="desktop-page">
        <view class="desktop-shell">
            <view class="action-row">
                <view class="action-button action-button--primary" @click="go('/pages/cloud/purchase', true)">
                    新增云电脑
                </view>
                <view class="action-button" @click="go('/pages/news/news')">资讯</view>
                <view class="floating-entry" @click="openReminderWindow">
                    <image class="floating-entry__image" src="/static/images/icon/icon_visit.png" mode="aspectFit" />
                    <view class="floating-entry__tooltip">悬窗</view>
                </view>
            </view>

            <view v-if="pageState.error" class="state-banner state-banner--error">
                <text>{{ pageState.error }}</text>
                <view class="state-banner__action" @click="reloadData">重新加载</view>
            </view>

            <view v-if="!isLogin" class="login-panel">
                <view>
                    <view class="login-panel__title">登录后使用桌面工作台</view>
                    <view class="login-panel__desc">登录后同步云电脑资源、客服信息和悬窗提醒。</view>
                </view>
                <view class="filled-button" @click="go('/pages/login/login')">去登录</view>
            </view>

            <template v-else>
                <view class="workspace">
                    <view class="panel">
                        <view class="panel__head">
                            <view class="panel__title">我的云电脑</view>
                            <view class="panel__link" @click="go('/pages/cloud/resources', true)">查看全部</view>
                        </view>

                        <view v-if="pageState.loading" class="panel__empty">正在同步桌面数据...</view>
                        <view v-else-if="!latestResources.length" class="panel__empty">当前暂无云电脑资源</view>
                        <view v-else class="resource-list">
                            <view
                                v-for="item in latestResources"
                                :key="item.id"
                                class="resource-row"
                                @click="go(`/pages/cloud/detail?id=${item.id}`, true)"
                            >
                                <view class="resource-row__top">
                                    <view class="resource-row__title">
                                        {{ item.name || item.resource_name || item.desktop_oid || '云电脑实例' }}
                                    </view>
                                    <view class="status-pill" :class="`status-pill--${getStatusClass(item)}`">
                                        {{ item.status_text || '未知状态' }}
                                    </view>
                                </view>
                                <view class="resource-row__meta">
                                    <text>到期时间：{{ item.expired_at_text || '-' }}</text>
                                    <view
                                        v-if="canQuickRenew(item)"
                                        class="resource-row__link"
                                        @click.stop="go(`/pages/cloud/renew?id=${item.id}`, true)"
                                    >
                                        立即续期
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>

                    <view class="panel panel--support">
                        <view class="panel__head">
                            <view class="panel__title">专属客服</view>
                            <view class="panel__link" @click="go('/pages/customer_service/customer_service')">
                                打开客服
                            </view>
                        </view>

                        <view class="support-card">
                            <view class="support-card__title">{{ supportTitle }}</view>
                            <view class="support-card__meta">
                                <view v-if="supportMobile">电话：{{ supportMobile }}</view>
                                <view v-if="supportTime">服务时间：{{ supportTime }}</view>
                            </view>
                        </view>

                        <view class="support-actions">
                            <view
                                class="support-actions__button support-actions__button--primary"
                                @click="go('/pages/customer_service/customer_service')"
                            >
                                在线沟通
                            </view>
                            <view
                                v-if="supportMobile"
                                class="support-actions__button"
                                @click="showSupportPhone"
                            >
                                电话咨询
                            </view>
                        </view>

                        <view class="reminder-card">
                            <view class="reminder-card__head">
                                <view class="panel__title">到期提醒</view>
                            </view>

                            <view v-if="!expiringResource" class="panel__empty panel__empty--small">
                                当前没有即将到期的云电脑
                            </view>
                            <view v-else class="expiry-card">
                                <view class="expiry-card__title">
                                    {{ expiringResource.name || expiringResource.resource_name || expiringResource.desktop_oid || '云电脑实例' }}
                                </view>
                                <view class="expiry-card__meta">到期时间：{{ expiringResource.expired_at_text || '-' }}</view>
                                <view class="expiry-card__countdown">{{ expiringCountdownText }}</view>
                                <view class="expiry-card__actions">
                                    <view class="expiry-card__button" @click="go(`/pages/cloud/detail?id=${expiringResource.id}`, true)">
                                        详情
                                    </view>
                                    <view
                                        v-if="canQuickRenew(expiringResource)"
                                        class="expiry-card__button expiry-card__button--primary"
                                        @click="go(`/pages/cloud/renew?id=${expiringResource.id}`, true)"
                                    >
                                        续期
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </template>
        </view>

        <desktop-bottom-nav />
    </view>
</template>

<script setup lang="ts">
import DesktopBottomNav from '@/components/desktop-bottom-nav/desktop-bottom-nav.vue'
import { getCloudHomeData } from '@/api/cloud'
import { getDecorate } from '@/api/shop'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { showDesktopReminderWindow } from '@/utils/desktop'
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'
import { computed, reactive, ref } from 'vue'

type CloudResourceItem = {
    id?: number | string
    name?: string
    resource_name?: string
    desktop_oid?: string
    status_text?: string
    status_class?: string
    expired_at?: number | string
    expired_at_text?: string
}

type SupportContent = {
    title?: string
    mobile?: string
    time?: string
}

const appStore = useAppStore()
const userStore = useUserStore()

const pageState = reactive({
    loading: false,
    error: ''
})

const homeState = reactive({
    latestResources: [] as CloudResourceItem[]
})

const supportState = reactive({
    content: {} as SupportContent
})

const isLogin = computed(() => userStore.isLogin)
const latestResources = computed(() => homeState.latestResources)
const supportTitle = computed(() => String(supportState.content.title || '联系专属客服'))
const supportMobile = computed(() => String(supportState.content.mobile || ''))
const supportTime = computed(() => String(supportState.content.time || ''))
const expiringResource = computed(() => {
    const expiringItems = homeState.latestResources
        .filter((item) => Number(item?.expired_at || 0) > 0)
        .sort((left, right) => Number(left.expired_at || 0) - Number(right.expired_at || 0))
    return expiringItems[0] || null
})
const nowSeconds = ref(Math.floor(Date.now() / 1000))
let tickTimer: ReturnType<typeof setInterval> | null = null

const expiringCountdownText = computed(() => {
    const item = expiringResource.value
    if (!item) return '暂无到期提醒'

    const expiredAt = Number(item.expired_at || 0)
    if (!expiredAt) return '暂无到期提醒'

    const diff = expiredAt - nowSeconds.value
    if (diff <= 0) return '已到期'

    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)

    if (days > 0) return `${days}天${hours}小时后到期`
    if (hours > 0) return `${hours}小时${minutes}分钟后到期`
    return `${Math.max(minutes, 1)}分钟后到期`
})

const ensureLogin = () => {
    if (userStore.isLogin) return true
    uni.navigateTo({ url: '/pages/login/login' })
    return false
}

const go = (url: string, needLogin = false) => {
    if (needLogin && !ensureLogin()) return
    if (url === '/pages/desktop/home' || url.startsWith('/pages/desktop/')) {
        uni.reLaunch({ url })
        return
    }
    uni.navigateTo({ url })
}

const resetData = () => {
    pageState.error = ''
    homeState.latestResources = []
}

const loadHomeData = async () => {
    const data = await getCloudHomeData()
    homeState.latestResources = Array.isArray(data?.latest_resources) ? data.latest_resources.slice(0, 2) : []
}

const loadSupportData = async () => {
    const data = await getDecorate({ id: 3 })
    try {
        const pages = JSON.parse(String(data?.data || '[]'))
        const customerServicePage = Array.isArray(pages)
            ? pages.find((item: any) => item?.name === 'customer-service')
            : null
        supportState.content = customerServicePage?.content || {}
    } catch {
        // Malformed decoration data — leave support content as default empty state
    }
}

const reloadData = async () => {
    pageState.loading = true
    pageState.error = ''

    try {
        await appStore.getConfig()

        // Support data failure is non-fatal — run independently so it doesn't block home data
        loadSupportData().catch(() => {})

        if (!userStore.isLogin) {
            resetData()
            return
        }

        await loadHomeData()
    } catch (error) {
        resetData()
        pageState.error = typeof error === 'string' ? error : '桌面数据加载失败，请稍后重试'
    } finally {
        pageState.loading = false
    }
}

const canQuickRenew = (item: CloudResourceItem | null) => {
    const expiredAt = Number(item?.expired_at || 0)
    if (!expiredAt) return false
    const diffDays = (expiredAt - Date.now() / 1000) / 86400
    return diffDays <= 15
}

const getStatusClass = (item: CloudResourceItem) => {
    return String(item?.status_class || 'plain')
}

const showSupportPhone = async () => {
    const phone = supportMobile.value
    if (!phone) return
    await uni.showModal({
        title: '客服电话',
        content: phone,
        showCancel: false,
        confirmText: '知道了'
    })
}

const openReminderWindow = async () => {
    await showDesktopReminderWindow()
}

onShow(() => {
    reloadData()
    tickTimer = setInterval(() => {
        nowSeconds.value = Math.floor(Date.now() / 1000)
    }, 1000)
})

onHide(() => {
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null }
})

onUnload(() => {
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null }
})
</script>

<style scoped lang="scss">
.desktop-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--md-background);
}

.desktop-shell {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
}

.action-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 44px;
    gap: 8px;
}

.action-button,
.filled-button,
.floating-entry,
.state-banner__action,
.panel__link,
.resource-row__link,
.expiry-card__button,
.support-actions__button {
    transition: background-color 0.15s, color 0.15s;
}

.action-button {
    height: 42px;
    padding: 0 12px;
    border-radius: var(--md-radius-md);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    box-shadow: var(--md-elevation-1);
    color: var(--md-primary);
    font-size: 13px;
    font-weight: 600;
    &:active { background: var(--md-surface-variant); }
}

.action-button--primary,
.filled-button,
.expiry-card__button--primary,
.support-actions__button--primary {
    background: var(--md-primary);
    color: var(--md-on-primary);
    border-color: transparent;
    box-shadow: none;
    &:active { opacity: 0.88; }
}

.floating-entry {
    position: relative;
    height: 42px;
    border-radius: var(--md-radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    box-shadow: var(--md-elevation-1);
    &:active { background: var(--md-surface-variant); }
}

.floating-entry__image {
    width: 18px;
    height: 18px;
}

.floating-entry__tooltip {
    position: absolute;
    left: 0;
    top: -32px;
    padding: 5px 8px;
    border-radius: var(--md-radius-sm);
    background: var(--md-on-surface);
    color: var(--md-surface);
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transform: translateY(4px);
    transition: opacity 0.18s, transform 0.18s;
}

.floating-entry:hover .floating-entry__tooltip {
    opacity: 1;
    transform: translateY(0);
}

.state-banner,
.login-panel,
.workspace {
    margin-top: 8px;
}

.state-banner {
    padding: 12px 14px;
    border-radius: var(--md-radius-md);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    background: var(--md-error-container);
    color: var(--md-error);
}

.state-banner__action,
.panel__link,
.resource-row__link {
    color: var(--md-primary);
    font-size: 12px;
    font-weight: 600;
}

.login-panel {
    padding: 14px;
    border-radius: var(--md-radius-md);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: var(--md-surface);
    box-shadow: var(--md-elevation-1);
}

.login-panel__title {
    color: var(--md-on-surface);
    font-size: 16px;
    font-weight: 600;
}

.login-panel__desc {
    margin-top: 6px;
    color: var(--md-on-surface-variant);
    font-size: 12px;
    line-height: 1.5;
}

.filled-button {
    min-width: 88px;
    height: 38px;
    padding: 0 16px;
    border-radius: var(--md-radius-full);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    flex-shrink: 0;
}

.workspace {
    display: grid;
    gap: 8px;
}

.panel {
    padding: 12px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    box-shadow: var(--md-elevation-1);
}

.panel__head,
.reminder-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.panel__title {
    color: var(--md-on-surface);
    font-size: 15px;
    font-weight: 600;
}

.panel__empty {
    padding: 18px 10px 10px;
    text-align: center;
    color: var(--md-on-surface-variant);
    font-size: 12px;
}

.panel__empty--small {
    padding: 12px 10px 6px;
}

.resource-list {
    display: grid;
    gap: 8px;
    margin-top: 10px;
}

.resource-row,
.support-card,
.expiry-card {
    border-radius: var(--md-radius-sm);
    background: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
}

.resource-row {
    padding: 12px;
    cursor: pointer;
    &:active { background: var(--md-surface-variant); }
}

.resource-row__top,
.resource-row__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.resource-row__title,
.support-card__title,
.expiry-card__title {
    color: var(--md-on-surface);
    font-size: 14px;
    font-weight: 600;
}

.resource-row__meta,
.support-card__meta,
.expiry-card__meta {
    margin-top: 6px;
    color: var(--md-on-surface-variant);
    font-size: 12px;
    line-height: 1.5;
}

.status-pill {
    flex-shrink: 0;
    padding: 3px 10px;
    border-radius: var(--md-radius-full);
    font-size: 11px;
    font-weight: 600;
    background: var(--md-secondary-container);
    color: var(--md-on-secondary-container);
}

.status-pill--running  { background: var(--status-running-bg);  color: var(--status-running-fg); }
.status-pill--pending,
.status-pill--warning  { background: var(--status-warning-bg);  color: var(--status-warning-fg); }
.status-pill--expired,
.status-pill--failed   { background: var(--status-expired-bg);  color: var(--status-expired-fg); }
.status-pill--plain    { background: var(--md-secondary-container); color: var(--md-on-secondary-container); }

.support-card {
    margin-top: 10px;
    padding: 12px;
    background: var(--md-primary-container);
    border-color: transparent;
}

.support-card__title { color: var(--md-on-primary-container); }
.support-card__meta  { color: var(--md-on-primary-container); opacity: 0.78; }

.support-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 10px;
}

.support-actions__button {
    height: 36px;
    border-radius: var(--md-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--md-surface);
    color: var(--md-primary);
    border: 1px solid var(--md-outline-variant);
    font-size: 12px;
    font-weight: 600;
    &:active { background: var(--md-surface-variant); }
}

.reminder-card {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--md-outline-variant);
}

.expiry-card {
    padding: 12px;
    margin-top: 10px;
    background: var(--md-error-container);
    border-color: transparent;
}

.expiry-card__title { color: var(--md-on-surface); }
.expiry-card__meta  { color: var(--md-on-surface-variant); }

.expiry-card__countdown {
    margin-top: 10px;
    color: var(--md-error);
    font-size: 18px;
    line-height: 1.1;
    font-weight: 700;
}

.expiry-card__actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
}

.expiry-card__button {
    min-width: 72px;
    height: 34px;
    padding: 0 12px;
    border-radius: var(--md-radius-full);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--md-surface);
    color: var(--md-primary);
    border: 1px solid var(--md-outline-variant);
    font-size: 12px;
    font-weight: 600;
}

@media (max-width: 560px) {
    .login-panel { display: block; }
    .filled-button { margin-top: 10px; }
}
</style>
