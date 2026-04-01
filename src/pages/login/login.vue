<template>
    <view class="desktop-login">
        <view class="desktop-login__shell">
            <view class="desktop-login__brand">
                <image
                    :src="websiteConfig.shop_logo"
                    mode="aspectFit"
                    class="desktop-login__logo"
                />
                <view class="desktop-login__brand-text">
                    <view class="desktop-login__title">{{ websiteConfig.shop_name || '云电脑助手' }}</view>
                    <view class="desktop-login__subtitle">桌面安装版账号登录</view>
                </view>
            </view>

            <view class="desktop-login__panel">
                <view v-if="availableLoginWays.length > 1" class="desktop-login__switch">
                    <view
                        v-for="item in availableLoginWays"
                        :key="item.value"
                        class="desktop-login__switch-item"
                        :class="{ 'is-active': formData.scene === item.value }"
                        @click="changeLoginWay(item.value)"
                    >
                        {{ item.label }}
                    </view>
                </view>

                <template v-if="formData.scene === LoginWayEnum.ACCOUNT">
                    <view class="desktop-field">
                        <image class="desktop-field__icon" src="/static/images/icon/icon_user.png" mode="aspectFit" />
                        <u-input
                            class="desktop-field__input"
                            v-model="formData.account"
                            :border="false"
                            placeholder="输入账号或手机号"
                        />
                    </view>

                    <view class="desktop-field desktop-field--mt">
                        <image class="desktop-field__icon" src="/static/images/icon/icon_password.png" mode="aspectFit" />
                        <u-input
                            class="desktop-field__input"
                            v-model="formData.password"
                            type="password"
                            placeholder="输入密码"
                            :border="false"
                        />
                        <navigator class="desktop-field__link" url="/pages/forget_pwd/forget_pwd" hover-class="none">
                            忘记密码
                        </navigator>
                    </view>
                </template>

                <template v-else>
                    <view class="desktop-field">
                        <image class="desktop-field__icon" src="/static/images/icon/icon_mobile.png" mode="aspectFit" />
                        <u-input
                            class="desktop-field__input"
                            v-model="formData.account"
                            :border="false"
                            placeholder="输入手机号"
                        />
                    </view>

                    <view class="desktop-field desktop-field--mt">
                        <image class="desktop-field__icon" src="/static/images/icon/icon_code.png" mode="aspectFit" />
                        <u-input
                            class="desktop-field__input"
                            v-model="formData.code"
                            placeholder="输入验证码"
                            :border="false"
                        />
                        <view class="desktop-field__link desktop-field__link--code" @click="sendSms">
                            <u-verification-code
                                ref="uCodeRef"
                                :seconds="60"
                                @change="codeChange"
                                change-text="x秒"
                            />
                            <text :class="formData.account ? 'text-primary' : 'text-muted'">
                                {{ codeTips || '发送验证码' }}
                            </text>
                        </view>
                    </view>
                </template>

                <view v-if="isOpenAgreement" class="desktop-agreement">
                    <view class="desktop-agreement__row" @click="isCheckAgreement = !isCheckAgreement">
                        <view class="desktop-agreement__check" :class="{ 'is-checked': isCheckAgreement }">
                            <text v-if="isCheckAgreement" class="desktop-agreement__tick">✓</text>
                        </view>
                        <view class="desktop-agreement__text">已阅读并同意</view>
                    </view>
                    <view class="desktop-agreement__links">
                        <navigator class="text-primary" hover-class="none" url="/pages/agreement/agreement?type=service">
                            《服务协议》
                        </navigator>
                        <text>和</text>
                        <navigator class="text-primary" hover-class="none" url="/pages/agreement/agreement?type=privacy">
                            《隐私协议》
                        </navigator>
                    </view>
                </view>

                <view class="desktop-login__stack">
                    <view
                        class="desktop-login__submit"
                        :class="{ 'is-disabled': !disableStyle }"
                        @click="handleLogin()"
                    >
                        登录
                    </view>
                </view>

                <view class="desktop-login__footer">
                    <view class="desktop-login__footer-text">
                        <text>还没有账号？</text>
                        <navigator url="/pages/register/register" hover-class="none" class="text-primary">
                            注册账号
                        </navigator>
                    </view>
                </view>
            </view>
        </view>

        <u-modal
            v-model="showModel"
            show-cancel-button
            :show-title="false"
            confirm-color="var(--md-primary)"
            @confirm=";(isCheckAgreement = true), (showModel = false)"
            @cancel="showModel = false"
        >
            <view class="desktop-login__modal">
                <view>请先阅读并同意协议</view>
                <view class="desktop-login__modal-links">
                    <navigator url="/pages/agreement/agreement?type=service" class="text-primary">
                        《服务协议》
                    </navigator>
                    <text>和</text>
                    <navigator url="/pages/agreement/agreement?type=privacy" class="text-primary">
                        《隐私协议》
                    </navigator>
                </view>
            </view>
        </u-modal>
    </view>
</template>

<script setup lang="ts">
import { login } from '@/api/account'
import { smsSend } from '@/api/app'
import { SMSEnum } from '@/enums/appEnums'
import { BACK_URL } from '@/enums/constantEnums'
import { useLockFn } from '@/hooks/useLockFn'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { getDesktopHomeRoute } from '@/utils/desktop'
import cache from '@/utils/cache'
import { useRouter } from 'uniapp-router-next'
import { computed, reactive, ref, shallowRef, watch } from 'vue'

enum LoginWayEnum {
    ACCOUNT = 1,
    MOBILE = 2
}

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()
const showModel = ref(false)
const uCodeRef = shallowRef()
const codeTips = ref('')
const isCheckAgreement = ref(false)

const formData = reactive({
    scene: LoginWayEnum.ACCOUNT,
    account: '',
    password: '',
    code: ''
})

const websiteConfig = computed(() => appStore.getWebsiteConfig)

const codeChange = (text: string) => {
    codeTips.value = text
}

const sendSms = async () => {
    if (!formData.account) {
        uni.$u.toast('请输入手机号')
        return
    }

    if (uCodeRef.value?.canGetCode) {
        await smsSend({
            scene: SMSEnum.LOGIN,
            mobile: formData.account
        })
        uni.$u.toast('验证码已发送')
        uCodeRef.value?.start()
    }
}

const includeLoginWay = (way: LoginWayEnum) => {
    return appStore.getLoginConfig.login_way?.includes(String(way))
}

const availableLoginWays = computed(() => {
    const items: Array<{ value: LoginWayEnum; label: string }> = []
    if (includeLoginWay(LoginWayEnum.ACCOUNT)) {
        items.push({ value: LoginWayEnum.ACCOUNT, label: '密码登录' })
    }
    if (includeLoginWay(LoginWayEnum.MOBILE)) {
        items.push({ value: LoginWayEnum.MOBILE, label: '验证码登录' })
    }
    if (!items.length) {
        items.push({ value: LoginWayEnum.ACCOUNT, label: '密码登录' })
    }
    return items
})

const isOpenAgreement = computed(() => appStore.getLoginConfig.login_agreement == 1)
const isForceBindMobile = computed(() => appStore.getLoginConfig.coerce_mobile == 1)

const changeLoginWay = (way: LoginWayEnum) => {
    formData.scene = way
    formData.password = ''
    formData.code = ''
}

const loginHandle = async (data: any) => {
    const { token, mobile } = data
    if (!mobile && isForceBindMobile.value) {
        userStore.temToken = token
        router.navigateTo('/pages/bind_mobile/bind_mobile')
        uni.hideLoading()
        return
    }

    userStore.login(token)
    await userStore.getUser()
    uni.$u.toast('登录成功')
    uni.hideLoading()

    const pages = getCurrentPages()
    if (pages.length > 1) {
        const prevPage = pages[pages.length - 2]
        await router.navigateBack()
        // @ts-ignore
        const { onLoad, options } = prevPage
        onLoad && onLoad(options)
        return
    }

    const backUrl = cache.get(BACK_URL)
    if (backUrl) {
        cache.remove(BACK_URL)
        try {
            await router.redirectTo(backUrl)
            return
        } catch (error) {
            await router.reLaunch(backUrl)
            return
        }
    }

    router.reLaunch(getDesktopHomeRoute())
}

const loginFun = async () => {
    if (!isCheckAgreement.value && isOpenAgreement.value) {
        showModel.value = true
        return
    }

    if (formData.scene === LoginWayEnum.ACCOUNT) {
        if (!formData.account) return uni.$u.toast('请输入账号或手机号')
        if (!formData.password) return uni.$u.toast('请输入密码')
    }

    if (formData.scene === LoginWayEnum.MOBILE) {
        if (!formData.account) return uni.$u.toast('请输入手机号')
        if (!formData.code) return uni.$u.toast('请输入验证码')
    }

    uni.showLoading({
        title: '登录中...'
    })

    try {
        const data = await login(formData)
        await loginHandle(data)
    } catch (error: any) {
        uni.hideLoading()
        uni.$u.toast(error)
    }
}

const { lockFn: handleLogin } = useLockFn(loginFun)

watch(
    () => appStore.getLoginConfig,
    (value) => {
        if (value.login_way?.length) {
            formData.scene = Number(value.login_way[0]) as LoginWayEnum
        }
    },
    {
        immediate: true
    }
)

const disableStyle = computed(() => {
    if (formData.scene === LoginWayEnum.ACCOUNT) {
        return !!formData.account && !!formData.password
    }
    return !!formData.account && !!formData.code
})
</script>

<style lang="scss">
page {
    height: 100%;
}

.desktop-login {
    min-height: 100%;
    padding: 20px 16px;
    box-sizing: border-box;
    background: var(--md-background);
}

.desktop-login__shell {
    max-width: 420px;
    margin: 0 auto;
    display: grid;
    gap: 14px;
}

.desktop-login__brand {
    padding: 18px;
    border-radius: var(--md-radius-lg);
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--md-primary);
    box-shadow: var(--md-elevation-1);
}

.desktop-login__logo {
    width: 72px;
    height: 72px;
    border-radius: var(--md-radius-md);
    background: rgba(255, 255, 255, 0.14);
}

.desktop-login__brand-text {
    min-width: 0;
    color: var(--md-on-primary);
}

.desktop-login__title {
    font-size: 24px;
    font-weight: 500;
}

.desktop-login__subtitle {
    margin-top: 6px;
    font-size: 13px;
    opacity: 0.86;
}

.desktop-login__panel {
    padding: 16px;
    border-radius: var(--md-radius-lg);
    background: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    box-shadow: var(--md-elevation-1);
}

.desktop-login__switch {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 16px;
    padding: 4px;
    border-radius: var(--md-radius-md);
    background: var(--md-primary-container);
}

.desktop-login__switch-item {
    height: 40px;
    border-radius: var(--md-radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--md-on-surface-variant);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
}

.desktop-login__switch-item.is-active {
    background: var(--md-surface);
    color: var(--md-primary);
    box-shadow: var(--md-elevation-1);
}

.desktop-login__stack {
    margin-top: 16px;
}

.desktop-login__submit {
    width: 100%;
    height: 48px;
    border-radius: var(--md-radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: opacity 0.15s, box-shadow 0.15s;
    box-shadow: var(--md-elevation-1);

    &:hover { box-shadow: var(--md-elevation-2); }
    &:active { opacity: 0.88; }

    &.is-disabled {
        opacity: 0.45;
        box-shadow: none;
        pointer-events: none;
    }
}

.desktop-field {
    height: 50px;
    padding: 0 14px;
    border-radius: var(--md-radius-sm);
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--md-background);
    border: 1px solid var(--md-outline-variant);
}

.desktop-field--mt {
    margin-top: 12px;
}

.desktop-field__icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    opacity: 0.7;
}

.desktop-field__input {
    flex: 1;
}

.desktop-field__link {
    color: var(--md-primary);
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
}

.desktop-field__link--code {
    min-width: 92px;
    text-align: right;
}

.desktop-agreement {
    margin-top: 14px;
}

.desktop-agreement__row {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}

.desktop-agreement__check {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--md-outline-variant);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s, border-color 0.15s;

    &.is-checked {
        background: var(--md-primary);
        border-color: var(--md-primary);
    }
}

.desktop-agreement__tick {
    color: var(--md-on-primary);
    font-size: 12px;
    line-height: 1;
}

.desktop-agreement__text {
    font-size: 12px;
    color: var(--md-on-surface-variant);
}

.desktop-agreement__links {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    font-size: 12px;
    color: var(--md-on-surface-variant);
    margin-top: 6px;
    padding-left: 28px;
}

.desktop-login__footer {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: var(--md-on-surface-variant);
}

.desktop-login__footer-text {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.desktop-login__modal {
    padding: 28px 20px;
    text-align: center;
}

.desktop-login__modal-links {
    margin-top: 10px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.text-primary {
    color: var(--md-primary);
}

.text-muted {
    color: var(--md-on-surface-variant);
}

@media (max-width: 720px) {
    .desktop-login {
        padding: 14px 12px;
    }

    .desktop-login__shell {
        max-width: none;
    }

    .desktop-login__brand {
        padding: 16px;
    }

    .desktop-login__title {
        font-size: 21px;
    }
}
</style>
