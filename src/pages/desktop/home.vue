<template>
    <view class="desktop-page">
        <view class="desktop-shell">
            <view v-if="pageState.error" class="banner banner--error">
                <text>{{ pageState.error }}</text>
                <view class="banner__action" @click="reloadData">重试</view>
            </view>

            <view v-if="!isLogin" class="hero-card">
                <view class="hero-card__icon" v-html="iconCloud" />
                <view class="hero-card__content">
                    <view class="hero-card__title">云电脑助手</view>
                    <view class="hero-card__desc">登录后管理云电脑资源、查看到期提醒</view>
                </view>
                <view class="btn btn--filled" @click="go('/pages/login/login')">登录</view>
            </view>

            <template v-else>
                <!-- Quick Actions -->
                <view class="quick-actions">
                    <view class="quick-action" @click="go('/pages/cloud/purchase', true)">
                        <view class="quick-action__icon" v-html="iconAdd" />
                        <text class="quick-action__label">新增云电脑</text>
                    </view>
                    <view class="quick-action" @click="go('/pages/cloud/resources', true)">
                        <view class="quick-action__icon" v-html="iconCloud" />
                        <text class="quick-action__label">云资源</text>
                    </view>
                    <view class="quick-action" @click="go('/pages/customer_service/customer_service')">
                        <view class="quick-action__icon" v-html="iconChat" />
                        <text class="quick-action__label">在线客服</text>
                    </view>
                    <view class="quick-action" @click="openReminderWindow">
                        <view class="quick-action__icon" v-html="iconPip" />
                        <text class="quick-action__label">悬窗提醒</text>
                    </view>
                </view>

                <!-- Expiry Alert -->
                <view v-if="expiringResource" class="alert-card">
                    <view class="alert-card__header">
                        <view class="alert-card__icon" v-html="iconAlarm" />
                        <view class="alert-card__title">到期提醒</view>
                    </view>
                    <view class="alert-card__body">
                        <view class="alert-card__name">
                            {{ expiringResource.name || expiringResource.resource_name || expiringResource.desktop_oid || '云电脑实例' }}
                        </view>
                        <view class="alert-card__countdown">{{ expiringCountdownText }}</view>
                        <view class="alert-card__meta">到期时间：{{ expiringResource.expired_at_text || '-' }}</view>
                    </view>
                    <view class="alert-card__actions">
                        <view class="btn btn--tonal" @click="go(`/pages/cloud/detail?id=${expiringResource.id}`, true)">详情</view>
                        <view
                            v-if="canQuickRenew(expiringResource)"
                            class="btn btn--filled"
                            @click="go(`/pages/cloud/renew?id=${expiringResource.id}`, true)"
                        >续期</view>
                    </view>
                </view>

                <!-- My Cloud PCs -->
                <view class="section-card">
                    <view class="section-card__header">
                        <view class="section-card__title">我的云电脑</view>
                        <view class="section-card__link" @click="go('/pages/cloud/resources', true)">全部</view>
                    </view>

                    <view v-if="pageState.loading" class="section-card__empty">正在加载...</view>
                    <view v-else-if="!latestResources.length" class="section-card__empty">暂无云电脑资源</view>
                    <view v-else class="resource-list">
                        <view
                            v-for="item in latestResources"
                            :key="item.id"
                            class="resource-item"
                            @click="go(`/pages/cloud/detail?id=${item.id}`, true)"
                        >
                            <view class="resource-item__main">
                                <view class="resource-item__name">
                                    {{ item.name || item.resource_name || item.desktop_oid || '云电脑实例' }}
                                </view>
                                <view class="resource-item__expire">{{ item.expired_at_text || '-' }}</view>
                            </view>
                            <view class="status-chip" :class="`status-chip--${getStatusClass(item)}`">
                                {{ item.status_text || '未知' }}
                            </view>
                        </view>
                    </view>
                </view>

                <!-- Support -->
                <view class="section-card section-card--support">
                    <view class="section-card__header">
                        <view class="section-card__title">专属客服</view>
                    </view>
                    <view class="support-row">
                        <view class="support-row__info">
                            <view class="support-row__name">{{ supportTitle }}</view>
                            <view v-if="supportMobile" class="support-row__meta">{{ supportMobile }}</view>
                            <view v-if="supportTime" class="support-row__meta">{{ supportTime }}</view>
                        </view>
                        <view class="btn btn--tonal btn--sm" @click="go('/pages/customer_service/customer_service')">联系</view>
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

const iconCloud = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>`
const iconAdd = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`
const iconChat = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`
const iconPip = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>`
const iconAlarm = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm1-11h-2v5l4.28 2.54.72-1.21-3-1.78V9z"/></svg>`

const appStore = useAppStore()
const userStore = useUserStore()

const pageState = reactive({ loading: false, error: '' })
const homeState = reactive({ latestResources: [] as CloudResourceItem[] })
const supportState = reactive({ content: {} as SupportContent })

const isLogin = computed(() => userStore.isLogin)
const latestResources = computed(() => homeState.latestResources)
const supportTitle = computed(() => String(supportState.content.title || '联系专属客服'))
const supportMobile = computed(() => String(supportState.content.mobile || ''))
const supportTime = computed(() => String(supportState.content.time || ''))

const expiringResource = computed(() => {
    return homeState.latestResources
        .filter((item) => Number(item?.expired_at || 0) > 0)
        .sort((a, b) => Number(a.expired_at || 0) - Number(b.expired_at || 0))[0] || null
})

const nowSeconds = ref(Math.floor(Date.now() / 1000))
let tickTimer: ReturnType<typeof setInterval> | null = null

const expiringCountdownText = computed(() => {
    const item = expiringResource.value
    if (!item) return ''
    const expiredAt = Number(item.expired_at || 0)
    if (!expiredAt) return ''
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
    if (url.startsWith('/pages/desktop/')) {
        uni.reLaunch({ url })
        return
    }
    uni.navigateTo({ url })
}

const canQuickRenew = (item: CloudResourceItem | null) => {
    const expiredAt = Number(item?.expired_at || 0)
    if (!expiredAt) return false
    return (expiredAt - Date.now() / 1000) / 86400 <= 15
}

const getStatusClass = (item: CloudResourceItem) => String(item?.status_class || 'plain')

const openReminderWindow = async () => { await showDesktopReminderWindow() }

const loadHomeData = async () => {
    const data = await getCloudHomeData()
    homeState.latestResources = Array.isArray(data?.latest_resources) ? data.latest_resources.slice(0, 3) : []
}

const loadSupportData = async () => {
    const data = await getDecorate({ id: 3 })
    try {
        const pages = JSON.parse(String(data?.data || '[]'))
        const page = Array.isArray(pages) ? pages.find((item: any) => item?.name === 'customer-service') : null
        supportState.content = page?.content || {}
    } catch { /* ignore */ }
}

const reloadData = async () => {
    pageState.loading = true
    pageState.error = ''
    try {
        await appStore.getConfig()
        loadSupportData().catch(() => {})
        if (!userStore.isLogin) {
            homeState.latestResources = []
            return
        }
        await loadHomeData()
    } catch (error) {
        homeState.latestResources = []
        pageState.error = typeof error === 'string' ? error : '加载失败，请重试'
    } finally {
        pageState.loading = false
    }
}

onShow(() => {
    reloadData()
    tickTimer = setInterval(() => { nowSeconds.value = Math.floor(Date.now() / 1000) }, 1000)
})

onHide(() => { if (tickTimer) { clearInterval(tickTimer); tickTimer = null } })
onUnload(() => { if (tickTimer) { clearInterval(tickTimer); tickTimer = null } })
</script>

<style scoped lang="scss">
.desktop-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--md-background);
    overflow: hidden;
}

.desktop-shell {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* Buttons */
.btn {
    height: 36px;
    padding: 0 16px;
    border-radius: var(--md-radius-full);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    flex-shrink: 0;
    transition: opacity 0.15s;
    &:active { opacity: 0.85; }
}

.btn--filled {
    background: var(--md-primary);
    color: var(--md-on-primary);
}

.btn--tonal {
    background: var(--md-primary-container);
    color: var(--md-primary);
}

.btn--sm {
    height: 32px;
    padding: 0 14px;
    font-size: 12px;
}

/* Error Banner */
.banner {
    padding: 10px 14px;
    border-radius: var(--md-radius-md);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    font-size: 13px;
}

.banner--error {
    background: var(--md-error-container);
    color: var(--md-error);
}

.banner__action {
    color: var(--md-error);
    font-weight: 600;
    cursor: pointer;
}

/* Hero Card (Login) */
.hero-card {
    padding: 20px;
    border-radius: var(--md-radius-lg);
    background: var(--md-primary);
    color: var(--md-on-primary);
    display: flex;
    align-items: center;
    gap: 14px;
}

.hero-card__icon {
    width: 48px;
    height: 48px;
    border-radius: var(--md-radius-md);
    background: rgba(255,255,255,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    :deep(svg) { fill: currentColor; }
}

.hero-card__content {
    flex: 1;
    min-width: 0;
}

.hero-card__title {
    font-size: 18px;
    font-weight: 600;
}

.hero-card__desc {
    margin-top: 4px;
    font-size: 12px;
    opacity: 0.82;
}

/* Quick Actions */
.quick-actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
}

.quick-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px 4px 10px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    cursor: pointer;
    transition: background 0.15s;
    &:active { background: var(--md-surface-variant); }
}

.quick-action__icon {
    width: 40px;
    height: 40px;
    border-radius: var(--md-radius-full);
    background: var(--md-primary-container);
    color: var(--md-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    :deep(svg) { fill: currentColor; }
}

.quick-action__label {
    font-size: 11px;
    font-weight: 500;
    color: var(--md-on-surface);
}

/* Alert Card */
.alert-card {
    padding: 14px;
    border-radius: var(--md-radius-md);
    background: var(--md-error-container);
    border: 1px solid rgba(0,0,0,0.06);
}

.alert-card__header {
    display: flex;
    align-items: center;
    gap: 6px;
}

.alert-card__icon {
    color: var(--md-error);
    display: flex;
    :deep(svg) { fill: currentColor; }
}

.alert-card__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--md-error);
}

.alert-card__body {
    margin-top: 8px;
}

.alert-card__name {
    font-size: 14px;
    font-weight: 600;
    color: var(--md-on-surface);
}

.alert-card__countdown {
    margin-top: 4px;
    font-size: 20px;
    font-weight: 700;
    color: var(--md-error);
    line-height: 1.2;
}

.alert-card__meta {
    margin-top: 2px;
    font-size: 12px;
    color: var(--md-on-surface-variant);
}

.alert-card__actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
}

/* Section Card */
.section-card {
    padding: 14px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
}

.section-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.section-card__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--md-on-surface);
}

.section-card__link {
    font-size: 12px;
    font-weight: 600;
    color: var(--md-primary);
    cursor: pointer;
}

.section-card__empty {
    padding: 16px 0 8px;
    text-align: center;
    font-size: 13px;
    color: var(--md-on-surface-variant);
}

/* Resource List */
.resource-list {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.resource-item {
    padding: 10px 12px;
    border-radius: var(--md-radius-sm);
    border: 1px solid var(--md-outline-variant);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    cursor: pointer;
    &:active { background: var(--md-surface-variant); }
}

.resource-item__main {
    min-width: 0;
    flex: 1;
}

.resource-item__name {
    font-size: 14px;
    font-weight: 500;
    color: var(--md-on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.resource-item__expire {
    margin-top: 2px;
    font-size: 12px;
    color: var(--md-on-surface-variant);
}

.status-chip {
    flex-shrink: 0;
    padding: 3px 10px;
    border-radius: var(--md-radius-full);
    font-size: 11px;
    font-weight: 600;
    background: var(--md-secondary-container);
    color: var(--md-on-secondary-container);
}

.status-chip--running  { background: var(--status-running-bg);  color: var(--status-running-fg); }
.status-chip--pending,
.status-chip--warning  { background: var(--status-warning-bg);  color: var(--status-warning-fg); }
.status-chip--expired,
.status-chip--failed   { background: var(--status-expired-bg);  color: var(--status-expired-fg); }

/* Support */
.section-card--support {
    background: var(--md-primary-container);
    border-color: transparent;
}

.section-card--support .section-card__title {
    color: var(--md-on-primary-container);
}

.support-row {
    margin-top: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.support-row__info {
    min-width: 0;
    flex: 1;
}

.support-row__name {
    font-size: 14px;
    font-weight: 500;
    color: var(--md-on-primary-container);
}

.support-row__meta {
    margin-top: 2px;
    font-size: 12px;
    color: var(--md-on-primary-container);
    opacity: 0.75;
}
</style>
