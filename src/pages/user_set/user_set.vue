<template>
    <view class="page">
        <navigator url="/pages/user_data/user_data" hover-class="none">
            <view class="menu-item menu-item--profile">
                <u-avatar :src="userInfo.avatar" shape="square" :size="40"></u-avatar>
                <view class="menu-item__body">
                    <view class="menu-item__title">{{ userInfo.nickname }}</view>
                    <view class="menu-item__sub">账号：{{ userInfo.account }}</view>
                </view>
                <u-icon name="arrow-right" :color="'var(--md-on-surface-variant)'"></u-icon>
            </view>
        </navigator>

        <view class="menu-group">
            <view class="menu-item" @click="handlePwd">
                <view class="menu-item__label">登录密码</view>
                <u-icon name="arrow-right" :color="'var(--md-on-surface-variant)'"></u-icon>
            </view>

            <navigator url="/pages/attribution/attribution?type=recommend" hover-class="none">
                <view class="menu-item">
                    <view class="menu-item__label">推荐人</view>
                    <view class="menu-item__right">
                        <view class="menu-item__value">{{ recommendDisplayName }}</view>
                        <u-icon name="arrow-right" :color="'var(--md-on-surface-variant)'"></u-icon>
                    </view>
                </view>
            </navigator>

            <navigator url="/pages/attribution/attribution?type=agent" hover-class="none">
                <view class="menu-item">
                    <view class="menu-item__label">代理商</view>
                    <view class="menu-item__right">
                        <view class="menu-item__value">{{ agentDisplayName }}</view>
                        <u-icon name="arrow-right" :color="'var(--md-on-surface-variant)'"></u-icon>
                    </view>
                </view>
            </navigator>
        </view>

        <view class="menu-group">
            <navigator :url="`/pages/agreement/agreement?type=${AgreementEnum.PRIVACY}`" hover-class="none">
                <view class="menu-item">
                    <view class="menu-item__label">隐私政策</view>
                    <u-icon name="arrow-right" :color="'var(--md-on-surface-variant)'"></u-icon>
                </view>
            </navigator>

            <navigator :url="`/pages/agreement/agreement?type=${AgreementEnum.SERVICE}`" hover-class="none">
                <view class="menu-item">
                    <view class="menu-item__label">服务协议</view>
                    <u-icon name="arrow-right" :color="'var(--md-on-surface-variant)'"></u-icon>
                </view>
            </navigator>

            <navigator url="/pages/as_us/as_us" hover-class="none">
                <view class="menu-item">
                    <view class="menu-item__label">关于我们</view>
                    <view class="menu-item__right">
                        <view class="menu-item__value">{{ appStore.config.version }}</view>
                        <u-icon name="arrow-right" :color="'var(--md-on-surface-variant)'"></u-icon>
                    </view>
                </view>
            </navigator>
        </view>

        <view class="logout-btn" @click="showLogout = true">退出登录</view>

        <u-action-sheet
            :list="list"
            v-model="show"
            @click="handleClick"
            :safe-area-inset-bottom="true"
        ></u-action-sheet>

        <u-popup v-model="showLogout" round mode="center" borderRadius="10" :maskCloseAble="false">
            <view class="logout-dialog">
                <view class="logout-dialog__title">温馨提示</view>
                <view class="logout-dialog__body">是否清除当前登录信息并退出登录？</view>
                <view class="logout-dialog__actions">
                    <view class="logout-dialog__btn logout-dialog__btn--ghost" @click="showLogout = false">取消</view>
                    <view class="logout-dialog__btn logout-dialog__btn--primary" @click="logoutHandle">确认</view>
                </view>
            </view>
        </u-popup>
    </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { AgreementEnum } from '@/enums/agreementEnums'
import { useRouter } from 'uniapp-router-next'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const resolveDisplayName = (user: any, emptyText = '未设置') => {
    if (!user || Array.isArray(user) || typeof user !== 'object') return emptyText
    return user.display_name
        || user.agent_company_name
        || user.nickname
        || user.real_name
        || user.account
        || user.mobile
        || (user.sn ? `用户${user.sn}` : '')
        || emptyText
}

const recommendDisplayName = computed(() => resolveDisplayName(userInfo.value?.recommend_user))
const agentDisplayName = computed(() => resolveDisplayName(userInfo.value?.source_agent_user))

const list = ref([
    {
        text: '修改密码'
    },
    {
        text: '忘记密码'
    }
])

const show = ref(false)
const showLogout = ref(false)

const handleClick = (index: number) => {
    switch (index) {
        case 0:
            router.navigateTo('/pages/change_password/change_password')
            break
        case 1:
            router.navigateTo('/pages/forget_pwd/forget_pwd')
            break
    }
}

const handlePwd = () => {
    if (!userInfo.value.has_password) {
        router.navigateTo('/pages/change_password/change_password?type=set')
        return
    }
    show.value = true
}

const logoutHandle = () => {
    userStore.logout()
    router.redirectTo('/pages/login/login')
}

onShow(() => {
    userStore.getUser()
})
</script>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    background: var(--md-background);
    display: flex;
    flex-direction: column;
}

.menu-item--profile {
    margin: 12px 14px 0;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    box-shadow: var(--md-elevation-1);
    padding: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

.menu-item__body {
    flex: 1;
    min-width: 0;
}

.menu-item__title {
    font-size: 15px;
    font-weight: 500;
    color: var(--md-on-surface);
}

.menu-item__sub {
    font-size: 12px;
    color: var(--md-on-surface-variant);
    margin-top: 2px;
}

.menu-group {
    margin: 12px 14px 0;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    box-shadow: var(--md-elevation-1);
    overflow: hidden;
}

.menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px;
    border-bottom: 1px solid var(--md-outline-variant);
    cursor: pointer;
    &:last-child { border-bottom: none; }
    &:active { background: var(--md-surface-variant); }
}

.menu-item__label {
    font-size: 14px;
    color: var(--md-on-surface);
}

.menu-item__right {
    display: flex;
    align-items: center;
    gap: 4px;
}

.menu-item__value {
    font-size: 13px;
    color: var(--md-on-surface-variant);
}

.logout-btn {
    margin: 24px 14px 0;
    height: 44px;
    line-height: 44px;
    text-align: center;
    border-radius: var(--md-radius-full);
    background: var(--status-expired-bg);
    color: var(--status-expired-fg);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
}

.logout-dialog {
    padding: 24px 20px;
    min-width: 280px;
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
}

.logout-dialog__title {
    font-size: 18px;
    font-weight: 500;
    color: var(--md-on-surface);
    text-align: center;
    margin-bottom: 12px;
}

.logout-dialog__body {
    font-size: 14px;
    color: var(--md-on-surface-variant);
    text-align: center;
    margin-bottom: 20px;
}

.logout-dialog__actions {
    display: flex;
    gap: 10px;
}

.logout-dialog__btn {
    flex: 1;
    height: 40px;
    line-height: 40px;
    text-align: center;
    border-radius: var(--md-radius-full);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
}

.logout-dialog__btn--ghost {
    background: var(--md-surface-variant);
    color: var(--md-on-surface-variant);
}

.logout-dialog__btn--primary {
    background: var(--md-primary);
    color: var(--md-on-primary);
}
</style>
