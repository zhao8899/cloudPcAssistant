<template>
    <page-meta :page-style="$theme.pageStyle">
        <!-- #ifndef H5 -->
        <navigation-bar
            :front-color="$theme.navColor"
            :background-color="$theme.navBgColor"
        />
        <!-- #endif -->
    </page-meta>

    <view class="user-page" :class="{ 'user-page--desktop': isDesktop }">
        <view class="hero-card">
            <view class="hero-card__top">
                <view class="hero-card__profile">
                    <view class="hero-card__avatar-wrap">
                        <u-avatar :src="avatarSrc" :size="112"></u-avatar>
                        <view class="hero-card__verified">✓</view>
                    </view>

                    <view class="hero-card__meta">
                        <view class="hero-card__title-row">
                            <text class="hero-card__name">{{ displayName }}</text>
                            <view
                                v-if="!isLogin"
                                class="hero-card__login-btn"
                                @click="handleGo('/pages/login/login')"
                            >
                                去登录
                            </view>
                            <text v-if="isLogin" class="hero-card__badge">{{ authLabel }}</text>
                            <text v-if="agentLabel" class="hero-card__agent-badge">{{ agentLabel }}</text>
                        </view>
                        <view class="hero-card__id-row">
                            <text>ID: {{ profile.sn || '--' }}</text>
                        </view>
                        <view class="hero-card__desc">{{ displayDesc }}</view>
                    </view>
                </view>
            </view>

            <view class="hero-card__stats">
                <view class="hero-card__stat">
                    <view class="hero-card__stat-value">{{ openedCount }}</view>
                    <view class="hero-card__stat-label">已开通云电脑</view>
                </view>
                <view class="hero-card__divider"></view>
                <view class="hero-card__stat">
                    <view class="hero-card__stat-value">{{ pendingCount }}</view>
                    <view class="hero-card__stat-label">待审核订单</view>
                </view>
            </view>
        </view>

        <view class="service-card">
            <view class="section-title">常用服务</view>
            <view class="service-grid">
                <view class="service-item" @click="handleGo('/pages/user_data/user_data', true)">
                    <view class="service-item__icon service-item__icon--green" v-html="iconVerified" />
                    <view class="service-item__label">实名认证</view>
                </view>
                <view class="service-item" @click="handleGo('/pages/customer_service/customer_service')">
                    <view class="service-item__icon service-item__icon--blue" v-html="iconSupport" />
                    <view class="service-item__label">在线客服</view>
                </view>
                <view class="service-item" @click="handleGo('/pages/user_set/user_set', true)">
                    <view class="service-item__icon service-item__icon--orange" v-html="iconSecurity" />
                    <view class="service-item__label">安全中心</view>
                </view>
            </view>
        </view>

        <view class="menu-card">
            <view class="menu-item" @click="handleGo('/pages/cloud/resources', true)">
                <view class="menu-item__left">
                    <view class="menu-item__icon menu-item__icon--indigo" v-html="iconCloud" />
                    <text class="menu-item__text">云电脑</text>
                </view>
                <text class="menu-item__arrow">›</text>
            </view>

            <view class="menu-item" @click="handleGo('/pages/cloud/orders', true)">
                <view class="menu-item__left">
                    <view class="menu-item__icon menu-item__icon--gold" v-html="iconReceipt" />
                    <text class="menu-item__text">订单中心</text>
                </view>
                <text class="menu-item__arrow">›</text>
            </view>

            <view
                v-if="!isSelfAgent"
                class="menu-item"
                @click="handleContactAgent"
            >
                <view class="menu-item__left">
                    <view class="menu-item__icon menu-item__icon--blue" v-html="iconAgent" />
                    <text class="menu-item__text">联系代理商</text>
                </view>
                <text class="menu-item__arrow">›</text>
            </view>
        </view>

        <view v-if="isLogin" class="menu-card">
            <view class="menu-item" @click="handleOpenShare">
                <view class="menu-item__left">
                    <view class="menu-item__icon menu-item__icon--sky" v-html="iconShare" />
                    <text class="menu-item__text">我要分享</text>
                </view>
                <text class="menu-item__arrow">›</text>
            </view>

            <view class="menu-item menu-item--danger" @click="handleLogout">
                <view class="menu-item__left">
                    <text class="menu-item__text menu-item__text--danger">退出登录</text>
                </view>
            </view>
        </view>

        <view v-if="showSharePopup" class="share-overlay" @click="showSharePopup = false">
            <view class="share-popup" @click.stop>
                <view class="share-popup__title">我要分享</view>
                <view class="share-popup__card">
                    <view class="share-popup__qr-wrap">
                        <u-image
                            width="420rpx"
                            height="420rpx"
                            border-radius="24rpx"
                            :show-loading="true"
                            :src="shareQrCodeUrl"
                        />
                    </view>
                    <view class="share-popup__name">{{ shareDisplayName }}</view>
                    <view class="share-popup__tip">可截图保存图片，或复制链接后分享</view>
                </view>
                <view class="share-popup__link">{{ shareLink }}</view>
                <u-button type="primary" shape="circle" @click="handleCopyShareLink">复制链接分享</u-button>
            </view>
        </view>

        <desktop-bottom-nav />
    </view>
</template>

<script setup lang="ts">
import DesktopBottomNav from '@/components/desktop-bottom-nav/desktop-bottom-nav.vue'

// MD3 SVG icons (20px, fill=currentColor)
const svgIcon = (d: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="${d}"/></svg>`
const iconVerified = svgIcon('M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z')
const iconSupport = svgIcon('M21 12.22C21 6.73 16.74 3 12 3c-4.69 0-9 3.65-9 9.28-.6.34-1 .98-1 1.72v2c0 1.1.9 2 2 2h1v-6.1c0-3.87 3.13-7 7-7s7 3.13 7 7V19h-8v2h8c1.1 0 2-.9 2-2v-1.22c.59-.31 1-.92 1-1.64v-2.3c0-.7-.41-1.31-1-1.62z')
const iconSecurity = svgIcon('M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z')
const iconCloud = svgIcon('M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z')
const iconReceipt = svgIcon('M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z')
const iconAgent = svgIcon('M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z')
const iconShare = svgIcon('M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z')
import { getCloudHomeData } from '@/api/cloud'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { getDesktopHomeRoute, isDesktopClient } from '@/utils/desktop'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref } from 'vue'

const appStore = useAppStore()
const userStore = useUserStore()
const { userInfo, isLogin } = storeToRefs(userStore)
const isDesktop = isDesktopClient()

const profile = computed(() => userInfo.value || {})
const bindPrompting = ref(false)
const refreshingUser = ref(false)
const showSharePopup = ref(false)
const cloudStats = reactive({
    openedCount: 0,
    pendingCount: 0
})

const avatarSrc = computed(() => profile.value.avatar || '/static/images/user/default_avatar.png')

const displayName = computed(() => {
    return profile.value.nickname || profile.value.real_name || profile.value.account || '未登录用户'
})

const displayDesc = computed(() => {
    return profile.value.mobile || profile.value.account || '登录后查看完整账户信息'
})
const shareDisplayName = computed(() => {
    if (Number(profile.value.is_agent || 0) === 1) {
        return profile.value.agent_company_name || displayName.value
    }
    return displayName.value
})

const authLabel = computed(() => {
    if (!isLogin.value) return '未登录'
    return Number(profile.value.auth_status || 0) === 1 ? '已实名' : '待实名'
})
const agentLabel = computed(() => {
    if (Number(profile.value.is_sub_agent || 0) === 1) return '子代理'
    if (Number(profile.value.is_agent || 0) === 1) return '代理商'
    return ''
})

const isSelfAgent = computed(() => {
    return Number(profile.value.is_agent || 0) === 1 && Number(profile.value.is_sub_agent || 0) !== 1
})
const agentMobile = computed(() => String(profile.value.source_agent_user?.mobile || ''))
const needBindAgent = computed(() => {
    return Number(profile.value.is_agent || 0) !== 1
        && Number(profile.value.is_sub_agent || 0) !== 1
        && Number(profile.value.source_agent_user_id || 0) <= 0
})

const openedCount = computed(() => cloudStats.openedCount)

const pendingCount = computed(() => cloudStats.pendingCount)
const shareQueryString = computed(() => {
    const sn = String(profile.value.sn || '').trim()
    if (!sn) return ''
    if (Number(profile.value.is_agent || 0) === 1) {
        return `agent_id=${encodeURIComponent(sn)}&pid=${encodeURIComponent(sn)}`
    }
    return `pid=${encodeURIComponent(sn)}`
})
const shareBaseUrl = computed(() => {
    const domain = String(appStore.config?.domain || '').trim().replace(/\/$/, '')
    return domain
})
const shareLink = computed(() => {
    const baseUrl = shareBaseUrl.value
    const queryString = shareQueryString.value
    if (!baseUrl || !queryString) return ''
    const joiner = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${joiner}${queryString}`
})
const shareQrCodeUrl = computed(() => {
    if (!shareLink.value) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=16&data=${encodeURIComponent(shareLink.value)}`
})

const ensureLogin = () => {
    if (isLogin.value) return true
    uni.navigateTo({
        url: '/pages/login/login'
    })
    return false
}

const ensureAgentBound = (onPassed: () => void) => {
    if (!isLogin.value) return
    if (refreshingUser.value) return
    if (!needBindAgent.value) {
        onPassed()
        return
    }
    if (bindPrompting.value) return

    bindPrompting.value = true
    uni.showModal({
        title: '请先绑定代理商',
        content: '当前账号尚未绑定代理商，绑定后才可进入云业务。',
        confirmText: '去绑定',
        cancelText: '取消',
        success: (res) => {
            if (res.confirm) {
                uni.navigateTo({ url: '/pages/attribution/attribution?type=agent' })
            }
        },
        complete: () => {
            bindPrompting.value = false
        }
    })
}

const go = (url: string, needLogin = false) => {
    if (needLogin && !ensureLogin()) return
    if (!url.startsWith('/pages/cloud/')) {
        uni.navigateTo({ url })
        return
    }
    ensureAgentBound(() => {
        uni.navigateTo({ url })
    })
}

const handleGo = (url: string, needLogin = false) => {
    go(url, needLogin)
}

const handleContactAgent = () => {
    if (!ensureLogin()) return
    uni.navigateTo({ url: '/pages/attribution/attribution?type=agent' })
}

const handleOpenShare = async () => {
    if (!ensureLogin()) return
    if (!shareBaseUrl.value) {
        await appStore.getConfig()
    }
    if (!shareLink.value) {
        uni.$u.toast('分享链接获取失败')
        return
    }
    showSharePopup.value = true
}

const handleCopyShareLink = () => {
    if (!shareLink.value) {
        uni.$u.toast('分享链接获取失败')
        return
    }
    uni.setClipboardData({
        data: shareLink.value,
        success: () => {
            uni.$u.toast('链接已复制')
        }
    })
}

const handleLogout = async () => {
    const modalRes = await uni.showModal({
        title: '退出登录',
        content: '是否清除当前登录信息并退出？',
        confirmText: '退出',
        cancelText: '取消'
    })

    if (!modalRes.confirm) return

    userStore.logout()
    uni.reLaunch({
        url: getDesktopHomeRoute()
    })
}

const refreshCloudStats = async () => {
    if (!isLogin.value) {
        cloudStats.openedCount = 0
        cloudStats.pendingCount = 0
        return
    }

    try {
        const data = await getCloudHomeData()
        cloudStats.openedCount = Number(data?.quick_stats?.opened_count || 0)
        cloudStats.pendingCount = Number(data?.quick_stats?.pending_audit_count || 0)
    } catch (error) {
        cloudStats.openedCount = 0
        cloudStats.pendingCount = 0
        if (typeof error !== 'string') {
            uni.$u.toast('加载统计失败')
        }
    }
}

const refreshUserInfo = async () => {
    if (!isLogin.value) return
    refreshingUser.value = true
    try {
        await userStore.getUser()
    } finally {
        refreshingUser.value = false
    }
}

onShow(async () => {
    if (isLogin.value) {
        await refreshUserInfo()
    }
    await refreshCloudStats()
})
</script>

<style scoped lang="scss">
.user-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--md-background);
}

.user-page--desktop {
    // layout handled by flex column + desktop-bottom-nav inline
}

/* ── Hero card (Filled Card) ─────────────────────────── */
.hero-card {
    padding: 20px 16px 16px;
    background: var(--md-primary-container);
    color: var(--md-on-primary-container);
}

.hero-card__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.hero-card__profile {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
}

.hero-card__avatar-wrap {
    position: relative;
    flex-shrink: 0;
    padding: 3px;
    border-radius: var(--md-radius-lg);
    background: rgba(255, 255, 255, 0.3);
}

.hero-card__verified {
    position: absolute;
    right: -2px;
    bottom: -2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #22c55e;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--md-primary-container);
}

.hero-card__meta {
    min-width: 0;
}

.hero-card__title-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.hero-card__name {
    font-size: 20px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--md-on-primary-container);
}

.hero-card__badge {
    padding: 2px 8px;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.4;
}

.hero-card__login-btn {
    padding: 4px 12px;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}

.hero-card__id-row {
    margin-top: 4px;
    font-size: 12px;
    color: var(--md-on-primary-container);
    opacity: 0.78;
}

.hero-card__desc {
    margin-top: 2px;
    font-size: 12px;
    color: var(--md-on-primary-container);
    opacity: 0.78;
    word-break: break-all;
}

.hero-card__agent-badge {
    padding: 2px 8px;
    border-radius: var(--md-radius-full);
    background: rgba(255, 255, 255, 0.25);
    color: var(--md-on-primary-container);
    font-size: 11px;
    font-weight: 600;
}

.hero-card__stats {
    display: flex;
    align-items: center;
    margin-top: 14px;
    padding: 12px;
    border-radius: var(--md-radius-md);
    background: rgba(255, 255, 255, 0.25);
}

.hero-card__stat {
    flex: 1;
    text-align: center;
}

.hero-card__stat-value {
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
    color: var(--md-on-primary-container);
}

.hero-card__stat-label {
    margin-top: 4px;
    font-size: 12px;
    color: var(--md-on-primary-container);
    opacity: 0.78;
}

.hero-card__divider {
    width: 1px;
    height: 36px;
    background: rgba(0, 0, 0, 0.15);
}

/* ── Service card ─────────────────────────────────────── */
.service-card,
.menu-card {
    margin: var(--md-space-md) var(--md-space-lg) 0;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    box-shadow: var(--md-elevation-1);
    overflow: hidden;
}

.service-card {
    padding: 16px;
}

.section-title {
    font-size: 13px;
    color: var(--md-on-surface-variant);
    font-weight: 500;
    margin-bottom: 12px;
}

.service-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
}

.service-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    cursor: pointer;
    &:active { opacity: 0.72; }
}

.service-item__icon {
    width: 44px;
    height: 44px;
    border-radius: var(--md-radius-md);
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(svg) { fill: currentColor; }
}

.service-item__icon--green  { background: rgba(16, 185, 129, 0.12); color: #059669; }
.service-item__icon--blue   { background: var(--status-running-bg); color: var(--status-running-fg); }
.service-item__icon--orange { background: rgba(249, 115, 22, 0.12);  color: #ea580c; }

.service-item__label {
    font-size: 13px;
    color: var(--md-on-surface);
    font-weight: 500;
}

/* ── Menu card ────────────────────────────────────────── */
.menu-card {
    padding: 0 var(--md-space-lg);
}

.menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 52px;
    border-bottom: 1px solid var(--md-outline-variant);
    cursor: pointer;
    &:last-child { border-bottom: none; }
    &:active { background: var(--md-surface-variant); margin: 0 -16px; padding: 0 16px; }
}

.menu-item__left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.menu-item__right { display: flex; align-items: center; gap: 6px; }

.menu-item__icon {
    width: 32px;
    height: 32px;
    border-radius: var(--md-radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    :deep(svg) { fill: currentColor; }
}

.menu-item__icon--blue   { background: var(--status-running-bg); color: var(--status-running-fg); }
.menu-item__icon--indigo { background: var(--md-secondary-container); color: var(--md-on-secondary-container); }
.menu-item__icon--gold   { background: var(--status-warning-bg); color: var(--status-warning-fg); }
.menu-item__icon--sky    { background: var(--status-running-bg); color: var(--status-running-fg); }

.menu-item__text {
    font-size: 15px;
    color: var(--md-on-surface);
    font-weight: 500;
}

.menu-item__text--danger { color: var(--md-error); }
.menu-item__extra { font-size: 13px; color: var(--md-on-surface-variant); }
.menu-item__arrow { font-size: 16px; color: var(--md-outline); }
.menu-item--danger { justify-content: center; }

/* ── Share overlay ────────────────────────────────────── */
.share-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--md-space-lg);
    background: rgba(0, 0, 0, 0.32);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-sizing: border-box;
}

.share-popup {
    width: 100%;
    max-width: 320px;
    padding: 24px;
    border-radius: var(--md-radius-lg);
    background: var(--md-surface);
    box-shadow: var(--md-elevation-3);
    box-sizing: border-box;
}

.share-popup__title {
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    color: var(--md-on-surface);
    margin-bottom: var(--md-space-lg);
}

.share-popup__card {
    padding: 16px;
    border-radius: var(--md-radius-md);
    background: var(--md-primary-container);
    margin-bottom: var(--md-space-md);
}

.share-popup__qr-wrap {
    display: flex;
    justify-content: center;
}

.share-popup__name {
    margin-top: 12px;
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    color: var(--md-on-primary-container);
    word-break: break-all;
}

.share-popup__tip {
    margin-top: 6px;
    text-align: center;
    font-size: 13px;
    color: var(--md-on-primary-container);
    opacity: 0.78;
}

.share-popup__link {
    margin: var(--md-space-md) 0;
    padding: 10px 12px;
    border-radius: var(--md-radius-sm);
    background: var(--md-surface-variant);
    color: var(--md-on-surface-variant);
    font-size: 12px;
    line-height: 1.6;
    word-break: break-all;
}
</style>
