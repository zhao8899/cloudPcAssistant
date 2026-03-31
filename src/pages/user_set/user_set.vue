<template>
    <view class="user-set">
        <navigator url="/pages/user_data/user_data">
            <view class="item flex bg-white mt-[20rpx]">
                <u-avatar :src="userInfo.avatar" shape="square" :size="100"></u-avatar>
                <view class="ml-[20rpx] flex flex-1 justify-between items-center">
                    <view>
                        <view class="mb-[15rpx] text-xl font-medium">{{ userInfo.nickname }}</view>
                        <view class="text-content text-xs">账号：{{ userInfo.account }}</view>
                    </view>
                    <u-icon name="arrow-right" color="#666"></u-icon>
                </view>
            </view>
        </navigator>

        <view
            class="item bg-white mt-[20rpx] btn-border flex flex-1 justify-between"
            @click="handlePwd"
        >
            <view>登录密码</view>
            <u-icon name="arrow-right" color="#666"></u-icon>
        </view>

        <navigator url="/pages/attribution/attribution?type=recommend">
            <view class="item bg-white flex flex-1 justify-between">
                <view>推荐人</view>
                <view class="flex justify-between">
                    <view class="text-muted mr-[20rpx]">
                        {{ recommendDisplayName }}
                    </view>
                    <u-icon name="arrow-right" color="#666"></u-icon>
                </view>
            </view>
        </navigator>

        <navigator url="/pages/attribution/attribution?type=agent">
            <view class="item bg-white mt-[20rpx] btn-border flex flex-1 justify-between">
                <view>代理商</view>
                <view class="flex justify-between">
                    <view class="text-muted mr-[20rpx]">
                        {{ agentDisplayName }}
                    </view>
                    <u-icon name="arrow-right" color="#666"></u-icon>
                </view>
            </view>
        </navigator>

        <navigator :url="`/pages/agreement/agreement?type=${AgreementEnum.PRIVACY}`">
            <view class="item bg-white mt-[20rpx] btn-border flex flex-1 justify-between">
                <view>隐私政策</view>
                <u-icon name="arrow-right" color="#666"></u-icon>
            </view>
        </navigator>

        <navigator :url="`/pages/agreement/agreement?type=${AgreementEnum.SERVICE}`">
            <view class="item bg-white btn-border flex flex-1 justify-between">
                <view>服务协议</view>
                <u-icon name="arrow-right" color="#666"></u-icon>
            </view>
        </navigator>

        <navigator url="/pages/as_us/as_us">
            <view class="item bg-white flex flex-1 justify-between">
                <view>关于我们</view>
                <view class="flex justify-between">
                    <view class="text-muted mr-[20rpx]">
                        {{ appStore.config.version }}
                    </view>
                    <u-icon name="arrow-right" color="#666"></u-icon>
                </view>
            </view>
        </navigator>

        <view class="mt-[60rpx] mx-[26rpx]">
            <u-button type="primary" shape="circle" @click="showLogout = true">退出登录</u-button>
        </view>

        <u-action-sheet
            :list="list"
            v-model="show"
            @click="handleClick"
            :safe-area-inset-bottom="true"
        ></u-action-sheet>

        <u-popup
            class="pay-popup"
            v-model="showLogout"
            round
            mode="center"
            borderRadius="10"
            :maskCloseAble="false"
        >
            <view class="content bg-white w-[560rpx] p-[40rpx]">
                <view class="text-2xl font-medium text-center">温馨提示</view>
                <view class="pt-[30rpx] pb-[40rpx]">
                    <view>是否清除当前登录信息并退出登录？</view>
                </view>
                <view class="flex">
                    <view class="flex-1 mr-[20rpx]">
                        <u-button
                            shape="circle"
                            type="primary"
                            plain
                            size="medium"
                            hover-class="none"
                            :customStyle="{ width: '100%' }"
                            @click="showLogout = false"
                        >
                            取消
                        </u-button>
                    </view>
                    <view class="flex-1">
                        <u-button
                            shape="circle"
                            type="primary"
                            size="medium"
                            hover-class="none"
                            :customStyle="{ width: '100%' }"
                            @click="logoutHandle"
                        >
                            确认
                        </u-button>
                    </view>
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
.user-set {
    .item {
        padding: 30rpx;
    }

    .btn-border {
        border-bottom: 2rpx solid #f8f8f8;
    }
}
</style>
