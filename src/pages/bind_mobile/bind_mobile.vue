<template>
    <page-meta :page-style="$theme.pageStyle">
        <!-- #ifndef H5 -->
        <navigation-bar
            :front-color="$theme.navColor"
            :background-color="$theme.navBgColor"
        />
        <!-- #endif -->
    </page-meta>
    <view class="page">
        <view class="nav">
            <view class="nav__back" @click="navigateDesktopBack()">←</view>
            <view class="nav__title">绑定手机号</view>
        </view>
        <view class="form">

            <view class="field">
                <view class="field__row">
                    <u-input v-model="formData.mobile" :border="false" placeholder="请输入手机号码" class="field__input" />
                </view>
            </view>

            <view class="field">
                <view class="field__row">
                    <u-input v-model="formData.code" :border="false" placeholder="请输入验证码" class="field__input" />
                    <view class="field__sms-btn" :class="{ 'is-active': formData.mobile }" @click="sendSms">
                        <u-verification-code ref="uCodeRef" :seconds="60" @change="codeChange" change-text="x秒" />
                        <text>{{ codeTips }}</text>
                    </view>
                </view>
            </view>

            <view
                class="submit"
                :class="{ 'is-disabled': !(formData.mobile && formData.code) }"
                @click="handleConfirm"
            >
                确定
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { userBindMobile } from '@/api/user'
import { smsSend } from '@/api/app'
import { SMSEnum } from '@/enums/appEnums'
import { navigateDesktopBack } from '@/utils/desktop'
import { reactive, ref, shallowRef } from 'vue'
import { useUserStore } from '@/stores/user'
const uCodeRef = shallowRef()
const codeTips = ref('')

const userStore = useUserStore()
const codeChange = (text: string) => {
    codeTips.value = text
}

const formData = reactive({
    type: 'bind',
    mobile: '',
    code: ''
})
const sendSms = async () => {
    if (!formData.mobile) return uni.$u.toast('请输入手机号码')
    if (uCodeRef.value?.canGetCode) {
        await smsSend({
            scene: SMSEnum.BIND_MOBILE,
            mobile: formData.mobile
        })
        uni.$u.toast('发送成功')
        uCodeRef.value?.start()
    }
}
const handleConfirm = async () => {
    if (!formData.mobile) return uni.$u.toast('请输入手机号码')
    if (!formData.code) return uni.$u.toast('请输入验证码')
    await userBindMobile(formData, { token: userStore.temToken })
    uni.$u.toast('绑定成功')
    userStore.login(userStore.temToken!)
    navigateDesktopBack()
}
</script>

<style lang="scss">
page { height: 100%; }
</style>

<style scoped lang="scss">
.page {
    height: 100vh;
    background: var(--md-surface);
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
    flex-shrink: 0;
}

.nav__back {
    width: 40px;
    height: 40px;
    font-size: 22px;
    color: var(--md-on-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: var(--md-radius-full);
    &:hover { background: var(--md-surface-variant); }
}

.nav__title {
    font-size: 18px;
    color: var(--md-on-surface);
    font-weight: 500;
}

.form {
    padding: 20px;
}

.field {
    margin-bottom: 14px;
}

.field__row {
    display: flex;
    align-items: center;
    height: 48px;
    padding: 0 12px;
    border: 1px solid var(--md-outline-variant);
    border-radius: var(--md-radius-sm);
    background: var(--md-background);
}

.field__sms-btn {
    border-left: 1px solid var(--md-outline-variant);
    padding-left: 12px;
    margin-left: 8px;
    white-space: nowrap;
    font-size: 13px;
    color: var(--md-on-surface-variant);
    cursor: pointer;
    &.is-active { color: var(--md-primary); }
}

.submit {
    margin-top: 20px;
    height: 48px;
    line-height: 48px;
    text-align: center;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    &.is-disabled { opacity: 0.5; }
}
</style>
