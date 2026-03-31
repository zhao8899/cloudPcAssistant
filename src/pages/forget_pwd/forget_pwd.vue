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
        <view class="form">
            <view class="form__title">忘记登录密码</view>

            <view class="field">
                <view class="field__label">手机号</view>
                <view class="field__row">
                    <u-input v-model="formData.mobile" :border="false" placeholder="请输入手机号码" class="field__input" />
                </view>
            </view>

            <view class="field">
                <view class="field__label">验证码</view>
                <view class="field__row">
                    <u-input v-model="formData.code" :border="false" placeholder="请输入验证码" class="field__input" />
                    <view class="field__sms-btn" :class="{ 'is-active': formData.mobile }" @click="sendSms">
                        <u-verification-code ref="uCodeRef" :seconds="60" @change="codeChange" change-text="x秒" />
                        <text>{{ codeTips }}</text>
                    </view>
                </view>
            </view>

            <view class="field">
                <view class="field__label">新密码</view>
                <view class="field__row">
                    <u-input type="password" v-model="formData.password" :border="false" placeholder="6-20位数字+字母或符号组合" class="field__input" />
                </view>
            </view>

            <view class="field">
                <view class="field__label">确认密码</view>
                <view class="field__row">
                    <u-input type="password" v-model="formData.password_confirm" :border="false" placeholder="再次输入新密码" class="field__input" />
                </view>
            </view>

            <view class="submit" @click="handleConfirm">确定</view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { smsSend } from '@/api/app'
import { forgotPassword } from '@/api/user'
import { SMSEnum } from '@/enums/appEnums'
import { reactive, ref, shallowRef } from 'vue'

const uCodeRef = shallowRef()
const codeTips = ref('')
const formData = reactive({
    mobile: '',
    code: '',
    password: '',
    password_confirm: ''
})

const codeChange = (text: string) => {
    codeTips.value = text
}

const sendSms = async () => {
    if (!formData.mobile) return
    if (uCodeRef.value?.canGetCode) {
        await smsSend({
            scene: SMSEnum.FIND_PASSWORD,
            mobile: formData.mobile
        })
        uni.$u.toast('发送成功')
        uCodeRef.value?.start()
    }
}

const handleConfirm = async () => {
    if (!formData.mobile) return uni.$u.toast('请输入手机号码')
    if (!formData.password) return uni.$u.toast('请输入密码')
    if (!formData.password_confirm) return uni.$u.toast('请输入确认密码')
    if (formData.password != formData.password_confirm) return uni.$u.toast('两次输入的密码不一致')
    await forgotPassword(formData)
    setTimeout(() => {
        uni.navigateBack()
    }, 1500)
}
</script>

<style lang="scss">
page {
    height: 100%;
}
</style>

<style scoped lang="scss">
.page {
    min-height: 100vh;
    background: var(--md-surface);
    padding: 40px 20px 0;
    box-sizing: border-box;
}

.form__title {
    font-size: 22px;
    font-weight: 500;
    color: var(--md-on-surface);
    margin-bottom: 28px;
}

.field {
    margin-bottom: 16px;
}

.field__label {
    font-size: 12px;
    color: var(--md-on-surface-variant);
    margin-bottom: 4px;
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
    &.is-active {
        color: var(--md-primary);
    }
}

.submit {
    margin-top: 28px;
    height: 48px;
    line-height: 48px;
    text-align: center;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
}
</style>
