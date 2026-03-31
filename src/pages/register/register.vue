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
            <view class="form__title">注册新账号</view>

            <view class="field">
                <u-input
                    v-model="formData.account"
                    :border="false"
                    placeholder="请输入账号"
                    class="field__input"
                />
            </view>

            <view class="field">
                <u-input
                    type="password"
                    v-model="formData.password"
                    placeholder="请输入密码"
                    :border="false"
                    class="field__input"
                />
            </view>

            <view class="field">
                <u-input
                    type="password"
                    v-model="formData.password_confirm"
                    placeholder="请再次输入密码"
                    :border="false"
                    class="field__input"
                />
            </view>

            <view class="agreement" v-if="isOpenAgreement">
                <u-checkbox v-model="isCheckAgreement" shape="circle">
                    <view class="agreement__text">
                        已阅读并同意
                        <view @click.stop>
                            <router-navigate class="agreement__link" hover-class="none" to="/pages/agreement/agreement?type=service">《服务协议》</router-navigate>
                        </view>
                        和
                        <view @click.stop>
                            <router-navigate class="agreement__link" hover-class="none" to="/pages/agreement/agreement?type=privacy">《隐私协议》</router-navigate>
                        </view>
                    </view>
                </u-checkbox>
            </view>

            <view
                class="submit"
                :class="{ 'is-disabled': !(formData.account && formData.password && formData.password_confirm) }"
                @click="accountRegister"
            >
                注册
            </view>
        </view>
    </view>
    <!-- 协议弹框 -->
    <u-modal
        v-model="showModel"
        show-cancel-button
        :show-title="false"
        @confirm=";(isCheckAgreement = true), (showModel = false)"
        @cancel="showModel = false"
        confirm-color="var(--md-primary)"
    >
        <view class="modal-body">
            <view>请先阅读并同意</view>
            <view class="modal-links">
                <router-navigate to="/pages/agreement/agreement?type=service">
                    <view class="modal-link">《服务协议》</view>
                </router-navigate>
                和
                <router-navigate to="/pages/agreement/agreement?type=privacy">
                    <view class="modal-link">《隐私协议》</view>
                </router-navigate>
            </view>
        </view>
    </u-modal>
</template>

<script setup lang="ts">
import {register} from '@/api/account'
import {useAppStore} from '@/stores/app'
import {computed, reactive, ref} from 'vue'

const isCheckAgreement = ref(false)
const appStore = useAppStore()
const isOpenAgreement = computed(() => appStore.getLoginConfig.login_agreement == 1)
const formData = reactive({
    account: '',
    password: '',
    password_confirm: ''
})
const showModel = ref(false)
const accountRegister = async () => {
    if (!formData.account) return uni.$u.toast('请输入账号')
    if (!formData.password) return uni.$u.toast('请输入密码')
    if (!formData.password_confirm) return uni.$u.toast('请输入确认密码')
    if (!isCheckAgreement.value && isOpenAgreement.value) return (showModel.value = true)
    if (formData.password != formData.password_confirm) return uni.$u.toast('两次输入的密码不一致')
    await register(formData)
    // uni.navigateBack()
    setTimeout(function () {
        uni.navigateBack()
    }, 1000)
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
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 20px 0;
    box-sizing: border-box;
}

.form {
    width: 100%;
}

.form__title {
    font-size: 22px;
    font-weight: 500;
    color: var(--md-on-surface);
    margin-bottom: 28px;
}

.field {
    padding: 0 12px;
    border: 1px solid var(--md-outline-variant);
    border-radius: var(--md-radius-sm);
    height: 48px;
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    background: var(--md-background);
}

.agreement {
    margin-bottom: 20px;
}

.agreement__text {
    font-size: 12px;
    display: flex;
    align-items: center;
    color: var(--md-on-surface-variant);
}

.agreement__link {
    color: var(--md-primary);
}

.submit {
    height: 48px;
    line-height: 48px;
    text-align: center;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 8px;
}

.submit.is-disabled {
    opacity: 0.5;
}

.modal-body {
    text-align: center;
    padding: 24px 20px;
    font-size: 14px;
    color: var(--md-on-surface);
}

.modal-links {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 4px;
}

.modal-link {
    color: var(--md-primary);
}
</style>
