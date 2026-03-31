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
                    <view class="service-item__icon service-item__icon--green">S</view>
                    <view class="service-item__label">实名认证</view>
                </view>
                <view class="service-item" @click="handleGo('/pages/customer_service/customer_service')">
                    <view class="service-item__icon service-item__icon--blue">H</view>
                    <view class="service-item__label">在线客服</view>
                </view>
                <view class="service-item" @click="handleGo('/pages/user_set/user_set', true)">
                    <view class="service-item__icon service-item__icon--orange">i</view>
                    <view class="service-item__label">安全中心</view>
                </view>
            </view>
        </view>

        <view class="menu-card">
            <view class="menu-item" @click="handleGo('/pages/cloud/resources', true)">
                <view class="menu-item__left">
                    <view class="menu-item__icon menu-item__icon--indigo">C</view>
                    <text class="menu-item__text">云电脑</text>
                </view>
                <text class="menu-item__arrow">></text>
            </view>

            <view class="menu-item" @click="handleGo('/pages/cloud/orders', true)">
                <view class="menu-item__left">
                    <view class="menu-item__icon menu-item__icon--gold">O</view>
                    <text class="menu-item__text">订单中心</text>
                </view>
                <text class="menu-item__arrow">></text>
            </view>

            <view
                v-if="!isSelfAgent"
                class="menu-item"
                @click="handleContactAgent"
            >
                <view class="menu-item__left">
                    <view class="menu-item__icon menu-item__icon--blue">A</view>
                    <text class="menu-item__text">联系代理商</text>
                </view>
                <text class="menu-item__arrow">></text>
            </view>
        </view>

        <view v-if="isLogin" class="menu-card">
            <view class="menu-item" @click="handleOpenShare">
                <view class="menu-item__left">
                    <view class="menu-item__icon menu-item__icon--sky">S</view>
                    <text class="menu-item__text">我要分享</text>
                </view>
                <text class="menu-item__arrow">></text>
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
    padding: 32rpx 24rpx 170rpx;
    background: linear-gradient(180deg, #f7f8fb 0%, #f3f5fa 100%);
    box-sizing: border-box;
}

.user-page--desktop {
    padding-bottom: 118rpx;
}

.hero-card {
    padding: 42rpx 32rpx 30rpx;
    border-radius: 36rpx;
    background: linear-gradient(135deg, #2d6df7 0%, #4a63f2 62%, #4c2df3 100%);
    box-shadow: 0 24rpx 56rpx rgba(67, 96, 245, 0.26);
    color: #fff;
}

.hero-card__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.hero-card__profile {
    display: flex;
    align-items: center;
    gap: 24rpx;
    min-width: 0;
}

.hero-card__avatar-wrap {
    position: relative;
    flex-shrink: 0;
    padding: 6rpx;
    border-radius: 34rpx;
    background: rgba(255, 255, 255, 0.18);
    box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.18);
}

.hero-card__verified {
    position: absolute;
    right: -4rpx;
    bottom: -4rpx;
    width: 34rpx;
    height: 34rpx;
    border-radius: 50%;
    background: #22c55e;
    color: #fff;
    font-size: 20rpx;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 4rpx solid #fff;
}

.hero-card__meta {
    min-width: 0;
    padding-top: 6rpx;
}

.hero-card__title-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    flex-wrap: wrap;
}

.hero-card__name {
    font-size: 40rpx;
    font-weight: 900;
    line-height: 1.2;
}

.hero-card__badge {
    padding: 6rpx 14rpx;
    border-radius: 999rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.7);
    background: #ffffff;
    color: #2d6df7;
    font-size: 18rpx;
    font-weight: 800;
    line-height: 1.2;
}

.hero-card__login-btn {
    padding: 8rpx 18rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
    font-size: 20rpx;
    font-weight: 800;
    line-height: 1.2;
    box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.22);
}

.hero-card__id-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-top: 12rpx;
    font-size: 22rpx;
    opacity: 0.92;
}

.hero-card__desc {
    margin-top: 8rpx;
    font-size: 22rpx;
    opacity: 0.9;
    word-break: break-all;
}

.hero-card__agent-badge {
    padding: 6rpx 14rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
    font-size: 18rpx;
    font-weight: 800;
    line-height: 1.2;
}

.hero-card__stats {
    display: flex;
    align-items: center;
    margin-top: 34rpx;
    padding: 28rpx 18rpx;
    border-radius: 30rpx;
    background: rgba(255, 255, 255, 0.12);
    box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.14);
}

.hero-card__stat {
    flex: 1;
    text-align: center;
}

.hero-card__stat-value {
    font-size: 44rpx;
    font-weight: 900;
    line-height: 1;
}

.hero-card__stat-label {
    margin-top: 16rpx;
    font-size: 20rpx;
    opacity: 0.92;
}

.hero-card__divider {
    width: 1rpx;
    height: 66rpx;
    background: rgba(255, 255, 255, 0.18);
}

.service-card,
.menu-card {
    margin-top: 24rpx;
    border-radius: 34rpx;
    background: #fff;
    box-shadow: 0 18rpx 44rpx rgba(15, 23, 42, 0.06);
}

.service-card {
    padding: 34rpx 24rpx 28rpx;
}

.section-title {
    padding: 0 12rpx;
    font-size: 28rpx;
    color: #6b7280;
    font-weight: 700;
}

.service-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12rpx;
    margin-top: 28rpx;
}

.service-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    padding: 8rpx 0;
}

.service-item__icon {
    width: 78rpx;
    height: 78rpx;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    font-weight: 900;
    box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.08);
}

.service-item__icon--green {
    background: #e8fbf2;
    color: #10b981;
}

.service-item__icon--blue {
    background: #edf4ff;
    color: #2563eb;
}

.service-item__icon--orange {
    background: #fff3e8;
    color: #f97316;
}

.service-item__label {
    font-size: 24rpx;
    color: #111827;
    font-weight: 700;
}

.menu-card {
    padding: 0 28rpx;
}

.menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    min-height: 110rpx;
    border-bottom: 1rpx solid #f2f4f8;
}

.menu-item:last-child {
    border-bottom: none;
}

.menu-item__left,
.menu-item__right {
    display: flex;
    align-items: center;
}

.menu-item__left {
    gap: 18rpx;
    min-width: 0;
}

.menu-item__right {
    gap: 12rpx;
}

.menu-item__icon {
    width: 52rpx;
    height: 52rpx;
    border-radius: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
    font-weight: 900;
    flex-shrink: 0;
}

.menu-item__icon--blue {
    background: #edf4ff;
    color: #2563eb;
}

.menu-item__icon--indigo {
    background: #eef2ff;
    color: #4f46e5;
}

.menu-item__icon--gold {
    background: #fff7e8;
    color: #f59e0b;
}

.menu-item__icon--sky {
    background: #eaf6ff;
    color: #0284c7;
}

.menu-item__text {
    font-size: 28rpx;
    color: #111827;
    font-weight: 700;
}

.menu-item__text--danger {
    color: #dc2626;
}

.menu-item__extra {
    font-size: 22rpx;
    color: #6b7280;
}

.menu-item__arrow {
    font-size: 26rpx;
    color: #c0c7d3;
    line-height: 1;
}

.menu-item--danger {
    justify-content: center;
}

.share-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 36rpx;
    background: rgba(241, 245, 249, 0.38);
    backdrop-filter: blur(24rpx);
    -webkit-backdrop-filter: blur(24rpx);
    box-sizing: border-box;
}

.share-popup {
    width: 620rpx;
    padding: 40rpx 36rpx 36rpx;
    border-radius: 28rpx;
    background: linear-gradient(180deg, rgba(248, 251, 255, 0.96) 0%, rgba(255, 255, 255, 0.98) 100%);
    box-shadow: 0 24rpx 70rpx rgba(15, 23, 42, 0.16);
    box-sizing: border-box;
}

.share-popup__title {
    text-align: center;
    font-size: 34rpx;
    font-weight: 800;
    color: #111827;
}

.share-popup__card {
    margin-top: 28rpx;
    padding: 30rpx 28rpx 32rpx;
    border-radius: 28rpx;
    background: linear-gradient(135deg, #eef6ff 0%, #ffffff 100%);
    box-shadow: inset 0 0 0 1rpx rgba(59, 130, 246, 0.1);
}

.share-popup__qr-wrap {
    display: flex;
    justify-content: center;
}

.share-popup__name {
    margin-top: 24rpx;
    text-align: center;
    font-size: 30rpx;
    font-weight: 800;
    color: #111827;
    word-break: break-all;
}

.share-popup__tip {
    margin-top: 14rpx;
    text-align: center;
    font-size: 24rpx;
    color: #6b7280;
}

.share-popup__link {
    margin: 24rpx 0 28rpx;
    padding: 20rpx 24rpx;
    border-radius: 22rpx;
    background: #f3f6fb;
    color: #475569;
    font-size: 22rpx;
    line-height: 1.6;
    word-break: break-all;
}
</style>
