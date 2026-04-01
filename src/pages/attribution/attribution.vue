<template>
    <view class="page">
        <view class="nav">
            <view class="nav__back" @click="navigateDesktopBack()">←</view>
            <view class="nav__title">{{ pageTitle }}设置</view>
        </view>

        <view class="body">
            <view class="card">
                <view class="card__title">{{ pageTitle }}信息</view>

                <view class="field">
                    <view class="field__label">当前状态</view>
                    <view class="field__value" :class="currentBinding.id ? 'field__value--active' : ''">
                        {{ currentBinding.id ? '已绑定' : '未绑定' }}
                    </view>
                </view>
                <view class="field">
                    <view class="field__label">用户编号</view>
                    <view class="field__value">{{ currentBinding.sn || '-' }}</view>
                </view>
                <view class="field">
                    <view class="field__label">{{ type === AttributionType.RECOMMEND ? '昵称' : '名称' }}</view>
                    <view class="field__value">{{ currentBinding.display_name || '-' }}</view>
                </view>
                <view class="field">
                    <view class="field__label">手机号</view>
                    <view
                        class="field__value"
                        :class="{ 'field__value--link': !!currentBinding.mobile }"
                        @click="handleCallMobile"
                    >
                        {{ currentBinding.mobile || '-' }}
                    </view>
                </view>
            </view>

            <view class="action">
                <view class="action__btn" @click="openPopup">
                    {{ currentBinding.id ? '修改' : '补充' }}{{ pageTitle }}
                </view>
            </view>
        </view>

        <u-popup v-model="showPopup" mode="center" border-radius="20" :mask-close-able="false">
            <view class="popup">
                <view class="popup__title">{{ currentBinding.id ? '修改' : '补充' }}{{ pageTitle }}</view>
                <view class="popup__tip">请输入{{ pageTitle }}编号</view>
                <view class="popup__input">
                    <u-input
                        v-model="inputValue"
                        :border="false"
                        placeholder="请输入编号"
                    />
                </view>
                <view class="popup__actions">
                    <view class="popup__btn popup__btn--cancel" @click="showPopup = false">取消</view>
                    <view class="popup__btn popup__btn--confirm" @click="submitHandle">提交</view>
                </view>
            </view>
        </u-popup>
    </view>
</template>

<script setup lang="ts">
import { getUserInfo, setRecommendUser, setSourceAgentUser } from '@/api/user'
import { navigateDesktopBack } from '@/utils/desktop'
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

    uni.showLoading({ title: '请稍后...' })
    try {
        if (type.value === AttributionType.RECOMMEND) {
            await setRecommendUser({ recommend_id: Number(inputValue.value) })
        } else {
            await setSourceAgentUser({ agent_id: Number(inputValue.value) })
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

<style scoped lang="scss">
.page {
    height: 100vh;
    background: var(--md-background);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.nav {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 48px;
    padding: 0 4px 0 8px;
    background: var(--md-surface);
    border-bottom: 1px solid var(--md-outline-variant);
}

.nav__back {
    width: 44px;
    height: 44px;
    font-size: 22px;
    color: var(--md-on-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: var(--md-radius-full);
    flex-shrink: 0;
    &:hover { background: var(--md-surface-variant); }
    &:active { background: var(--md-outline-variant); }
}

.nav__title {
    font-size: 20px;
    color: var(--md-on-surface);
    font-weight: 500;
}

.body {
    padding: 12px;
}

.card {
    padding: 16px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    box-shadow: var(--md-elevation-1);
}

.card__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--md-on-surface);
    margin-bottom: 12px;
}

.field {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid var(--md-outline-variant);

    &:last-child { border-bottom: none; }
}

.field__label {
    font-size: 14px;
    color: var(--md-on-surface-variant);
}

.field__value {
    max-width: 65%;
    text-align: right;
    font-size: 14px;
    color: var(--md-on-surface);
    word-break: break-all;
}

.field__value--active {
    color: var(--md-primary);
    font-weight: 500;
}

.field__value--link {
    color: var(--md-primary);
    cursor: pointer;
}

.action {
    margin-top: 16px;
}

.action__btn {
    width: 100%;
    height: 48px;
    border-radius: var(--md-radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: var(--md-elevation-1);
    &:active { opacity: 0.88; }
}

.popup {
    width: 300px;
    padding: 24px;
    background: var(--md-surface);
}

.popup__title {
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    color: var(--md-on-surface);
}

.popup__tip {
    margin-top: 12px;
    font-size: 13px;
    color: var(--md-on-surface-variant);
}

.popup__input {
    margin-top: 12px;
    padding: 0 12px;
    height: 48px;
    display: flex;
    align-items: center;
    border: 1px solid var(--md-outline-variant);
    border-radius: var(--md-radius-sm);
    background: var(--md-background);
}

.popup__actions {
    margin-top: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.popup__btn {
    height: 42px;
    border-radius: var(--md-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.popup__btn--cancel {
    background: var(--md-surface-variant);
    color: var(--md-on-surface-variant);
}

.popup__btn--confirm {
    background: var(--md-primary);
    color: var(--md-on-primary);
}
</style>
