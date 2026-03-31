<template>
    <page-meta :page-style="$theme.pageStyle">
        <!-- #ifndef H5 -->
        <navigation-bar :front-color="$theme.navColor" :background-color="$theme.navBgColor" />
        <!-- #endif -->
    </page-meta>
    <view class="attribution-page">
        <view class="card bg-white">
            <view class="title">{{ pageTitle }}</view>
            <view class="row">
                <view class="label">当前状态</view>
                <view class="value" :class="currentBinding.id ? 'text-main' : 'text-muted'">
                    {{ currentBinding.id ? '已绑定' : '未绑定' }}
                </view>
            </view>
            <view class="row">
                <view class="label">用户编号</view>
                <view class="value">{{ currentBinding.sn || '-' }}</view>
            </view>
            <view class="row">
                <view class="label">{{ type === AttributionType.RECOMMEND ? '昵称' : '名称' }}</view>
                <view class="value">{{ currentBinding.display_name || '-' }}</view>
            </view>
            <view class="row">
                <view class="label">手机号</view>
                <view
                    class="value"
                    :class="{ 'value--action': !!currentBinding.mobile }"
                    @click="handleCallMobile"
                >
                    {{ currentBinding.mobile || '-' }}
                </view>
            </view>
        </view>

        <view class="action">
            <u-button type="primary" shape="circle" @click="openPopup">
                {{ currentBinding.id ? '修改' : '补充' }}
            </u-button>
        </view>

        <u-popup v-model="showPopup" mode="center" border-radius="20" :mask-close-able="false">
            <view class="popup bg-white">
                <view class="popup-title">{{ currentBinding.id ? '修改' : '补充' }}{{ pageTitle }}</view>
                <view class="popup-tip">请输入{{ pageTitle }}编号</view>
                <view class="input-wrap">
                    <u-input
                        v-model="inputValue"
                        type="number"
                        :border="false"
                        placeholder="请输入编号"
                    />
                </view>
                <view class="popup-actions">
                    <view class="btn-item mr-[20rpx]">
                        <u-button plain type="primary" shape="circle" @click="showPopup = false">
                            取消
                        </u-button>
                    </view>
                    <view class="btn-item">
                        <u-button type="primary" shape="circle" @click="submitHandle">
                            提交
                        </u-button>
                    </view>
                </view>
            </view>
        </u-popup>
    </view>
</template>

<script setup lang="ts">
import { getUserInfo, setRecommendUser, setSourceAgentUser } from '@/api/user'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

enum AttributionType {
    RECOMMEND = 'recommend',
    AGENT = 'agent'
}

const type = ref<AttributionType>(AttributionType.RECOMMEND)
const userInfo = ref<Record<string, any>>({})
const showPopup = ref(false)
const inputValue = ref('')

const pageTitle = computed(() =>
    type.value === AttributionType.RECOMMEND ? '推荐人' : '代理商'
)

const currentBinding = computed(() => {
    if (type.value === AttributionType.RECOMMEND) {
        return userInfo.value.recommend_user || {}
    }
    return userInfo.value.source_agent_user || {}
})

const fetchUserInfo = async () => {
    userInfo.value = await getUserInfo()
}

const openPopup = () => {
    inputValue.value = currentBinding.value.sn ? String(currentBinding.value.sn) : ''
    showPopup.value = true
}

const handleCallMobile = () => {
    const mobile = String(currentBinding.value.mobile || '')
    if (!mobile) return
    uni.makePhoneCall({
        phoneNumber: mobile
    })
}

const submitHandle = async () => {
    if (!inputValue.value) return uni.$u.toast(`请输入${pageTitle.value}编号`)

    uni.showLoading({
        title: '请稍后...'
    })
    try {
        if (type.value === AttributionType.RECOMMEND) {
            await setRecommendUser({
                recommend_id: Number(inputValue.value)
            })
        } else {
            await setSourceAgentUser({
                agent_id: Number(inputValue.value)
            })
        }
        showPopup.value = false
        await fetchUserInfo()
        uni.$u.toast('操作成功')
    } catch (error: any) {
        uni.$u.toast(error)
    } finally {
        uni.hideLoading()
    }
}

onLoad((options) => {
    type.value =
        options.type === AttributionType.AGENT ? AttributionType.AGENT : AttributionType.RECOMMEND
})

onShow(() => {
    fetchUserInfo()
})
</script>

<style lang="scss" scoped>
.attribution-page {
    padding: 20rpx 24rpx 0;
}

.card {
    padding: 32rpx 28rpx;
    border-radius: 20rpx;
}

.title {
    font-size: 34rpx;
    font-weight: 600;
    margin-bottom: 28rpx;
}

.row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 2rpx solid #f6f7fb;
}

.row:last-child {
    border-bottom: 0;
}

.label {
    color: #666;
}

.value {
    max-width: 70%;
    text-align: right;
    word-break: break-all;
}

.value--action {
    color: #2563eb;
}

.text-main {
    color: #333;
}

.text-muted {
    color: #999;
}

.action {
    margin-top: 60rpx;
}

.popup {
    width: 560rpx;
    padding: 40rpx;
}

.popup-title {
    text-align: center;
    font-size: 32rpx;
    font-weight: 600;
}

.popup-tip {
    margin-top: 24rpx;
    color: #666;
}

.input-wrap {
    margin-top: 24rpx;
    padding: 0 20rpx;
    border: 2rpx solid #e5e7eb;
    border-radius: 12rpx;
    height: 90rpx;
    display: flex;
    align-items: center;
}

.popup-actions {
    margin-top: 40rpx;
    display: flex;
}

.btn-item {
    flex: 1;
}
</style>
