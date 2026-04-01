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
            <view class="nav__title">个人资料</view>
        </view>

        <view class="avatar-section">
            <avatar-upload
                :modelValue="userInfo?.avatar"
                file-key="url"
                :round="true"
                @update:modelValue="handleAvatarChange"
            />
        </view>

        <view class="menu-group">
            <view class="menu-item">
                <view class="menu-item__label">账号</view>
                <view class="menu-item__value">{{ userInfo?.account }}</view>
            </view>

            <view class="menu-item" @click=";(showNickName = true), (newNickname = userInfo?.nickname)">
                <view class="menu-item__label">昵称</view>
                <view class="menu-item__right">
                    <view class="menu-item__value">{{ userInfo?.nickname }}</view>
                    <u-icon name="arrow-right" :color="'var(--md-on-surface-variant)'"></u-icon>
                </view>
            </view>

            <view class="menu-item" @click="changeSex">
                <view class="menu-item__label">性别</view>
                <view class="menu-item__right">
                    <view class="menu-item__value">{{ userInfo?.sex }}</view>
                    <u-icon name="arrow-right" :color="'var(--md-on-surface-variant)'"></u-icon>
                </view>
            </view>

            <view class="menu-item" @click=";(showRealName = true), (newRealName = userInfo?.real_name || '')">
                <view class="menu-item__label">姓名</view>
                <view class="menu-item__right">
                    <view class="menu-item__value">{{ userInfo?.real_name || '未填写' }}</view>
                    <u-icon name="arrow-right" :color="'var(--md-on-surface-variant)'"></u-icon>
                </view>
            </view>

            <view class="menu-item" @click=";(showIdCard = true), (newIdCard = userInfo?.id_card || '')">
                <view class="menu-item__label">身份证号</view>
                <view class="menu-item__right">
                    <view class="menu-item__value">{{ maskedIdCard }}</view>
                    <u-icon name="arrow-right" :color="'var(--md-on-surface-variant)'"></u-icon>
                </view>
            </view>

            <view class="menu-item">
                <view class="menu-item__label">实名状态</view>
                <view class="menu-item__value">{{ authStatusText }}</view>
            </view>

            <view class="menu-item">
                <view class="menu-item__label">手机号</view>
                <view class="menu-item__right">
                    <view class="menu-item__value">{{ userInfo?.mobile == '' ? '未绑定手机号' : userInfo?.mobile }}</view>
                    <!-- #ifdef MP-WEIXIN -->
                    <u-button open-type="getPhoneNumber" @getphonenumber="getPhoneNumber" type="primary" shape="circle" size="mini" :plain="true">
                        {{ userInfo?.mobile == '' ? '绑定' : '更换' }}
                    </u-button>
                    <!-- #endif -->
                    <!-- #ifndef MP-WEIXIN -->
                    <view class="menu-item__action" @click="showMobilePop = true">
                        {{ userInfo?.mobile == '' ? '绑定' : '更换' }}
                    </view>
                    <!-- #endif -->
                </view>
            </view>

            <view class="menu-item">
                <view class="menu-item__label">注册时间</view>
                <view class="menu-item__value">{{ userInfo?.create_time }}</view>
            </view>
        </view>
    </view>

    <!-- 昵称修改弹窗 -->
    <u-popup v-model="showNickName" :closeable="true" mode="center" :maskCloseAble="false" border-radius="20">
        <view class="popup-card">
            <form @submit="changeNameConfirm">
                <view class="popup-card__title">修改昵称</view>
                <view class="popup-field">
                    <input class="popup-input" :value="userInfo.nickname" name="nickname" type="nickname" placeholder="请输入昵称" />
                </view>
                <button class="popup-submit" form-type="submit" hover-class="none">确定</button>
            </form>
        </view>
    </u-popup>

    <u-popup v-model="showRealName" :closeable="true" mode="center" border-radius="20">
        <view class="popup-card">
            <view class="popup-card__title">实名认证姓名</view>
            <view class="popup-field">
                <input class="popup-native-input" v-model="newRealName" placeholder="请输入真实姓名" />
            </view>
            <view class="popup-submit" @click="changeRealNameConfirm">确定</view>
        </view>
    </u-popup>

    <u-popup v-model="showIdCard" :closeable="true" mode="center" border-radius="20">
        <view class="popup-card">
            <view class="popup-card__title">实名认证身份证号</view>
            <view class="popup-field">
                <input class="popup-native-input" v-model="newIdCard" placeholder="请输入身份证号码" />
            </view>
            <view class="popup-hint">填写姓名和身份证号后，实名状态会自动更新为已实名。</view>
            <view class="popup-submit" @click="changeIdCardConfirm">确定</view>
        </view>
    </u-popup>

    <u-picker mode="selector" v-model="showPicker" :confirm-color="'var(--md-primary)'" :default-selector="[0]" :range="sexList" @confirm="changeSexConfirm" />

    <u-popup v-model="showMobilePop" :closeable="true" mode="center" border-radius="20">
        <view class="popup-card">
            <view class="popup-card__title">{{ userInfo?.mobile == '' ? '绑定手机号' : '更换手机号' }}</view>
            <view class="popup-field">
                <input class="popup-native-input" v-model="newMobile" placeholder="请输入新的手机号码" />
            </view>
            <view class="popup-field popup-field--row">
                <input class="popup-native-input" v-model="mobileCode" placeholder="请输入验证码" style="flex:1" />
                <view class="popup-sms-btn" @click="sendSms">
                    <u-verification-code ref="uCodeRef" :seconds="60" @change="codeChange" change-text="x秒" />
                    <text>{{ codeTips }}</text>
                </view>
            </view>
            <view class="popup-submit" @click="changeCodeMobile">确定</view>
        </view>
    </u-popup>
</template>

<script lang="ts" setup>
import { computed, ref, shallowRef } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUserInfo, userEdit, userBindMobile, userMnpMobile } from '@/api/user'
import { navigateDesktopBack } from '@/utils/desktop'
import { smsSend } from '@/api/app'
import { FieldType, SMSEnum } from '@/enums/appEnums'

// 用户信息
const userInfo = ref<any>({})
// 用户信息的枚举
const fieldType = ref(FieldType.NONE)
//选择性别数据
const sexList = ref<Array<string> | null>(['男', '女'])

//显示昵称弹窗
const showNickName = ref<boolean | null>(false)
//显示性别选择弹窗
const showPicker = ref<boolean | null>(false)
// 显示手机号验证码调整弹窗 非小程序才需要
const showMobilePop = ref<boolean | null>(false)
// 显示实名认证姓名弹窗
const showRealName = ref<boolean | null>(false)
// 显示身份证号弹窗
const showIdCard = ref<boolean | null>(false)

//新昵称
const newNickname = ref<string>('')
// 真实姓名
const newRealName = ref<string>('')
// 身份证号
const newIdCard = ref<string>('')
//新的手机号码
const newMobile = ref<string>('')

//修改手机验证码
const mobileCode = ref<string>('')
const codeTips = ref('')
const uCodeRef = shallowRef()

const authStatusText = computed(() => (Number(userInfo.value?.auth_status || 0) === 1 ? '已实名' : '未实名'))

const maskedIdCard = computed(() => {
    const idCard = userInfo.value?.id_card || ''
    if (!idCard) return '未填写'
    if (idCard.length <= 8) return idCard
    return `${idCard.slice(0, 4)}********${idCard.slice(-4)}`
})

// 获取用户信息
const getUser = async (): Promise<void> => {
    userInfo.value = await getUserInfo()
}

// 获取验证码显示字段
const codeChange = (text: string) => {
    codeTips.value = text
}

// 发送验证码
const sendSms = async () => {
    if (!newMobile.value) return uni.$u.toast('请输入新的手机号码')
    if (uCodeRef.value?.canGetCode) {
        await smsSend({
            scene: userInfo.value.mobile ? SMSEnum.CHANGE_MOBILE : SMSEnum.BIND_MOBILE,
            mobile: newMobile.value
        })
        uni.$u.toast('发送成功')
        uCodeRef.value?.start()
    }
}

const handleAvatarChange = (value: string) => {
    fieldType.value = FieldType.AVATAR
    setUserInfoFun(value)
}

// 验证码修改手机号-非微信小程序
const changeCodeMobile = async () => {
    await userBindMobile({
        type: userInfo.value.mobile ? 'change' : 'bind',
        mobile: newMobile.value,
        code: mobileCode.value
    })
    uni.$u.toast('操作成功')
    showMobilePop.value = false
    getUser()
}

// 修改用户信息
const setUserInfoFun = async (value: string): Promise<void> => {
    await userEdit({
        field: fieldType.value,
        value: value
    })
    uni.$u.toast('操作成功')
    getUser()
}

// 显示修改用户性别弹窗
const changeSex = () => {
    showPicker.value = true
    fieldType.value = FieldType.SEX
}

// 修改用户性别
const changeSexConfirm = (value: number[]) => {
    setUserInfoFun(String(value[0] + 1))
    showPicker.value = false
}

const changeRealNameConfirm = async () => {
    newRealName.value = (newRealName.value || '').trim()
    if (!newRealName.value) return uni.$u.toast('姓名不能为空')
    if (newRealName.value.length > 32) return uni.$u.toast('姓名长度不能超过32位')

    fieldType.value = FieldType.REAL_NAME
    await setUserInfoFun(newRealName.value)
    showRealName.value = false
}

const changeIdCardConfirm = async () => {
    newIdCard.value = (newIdCard.value || '').trim().toUpperCase()
    if (!newIdCard.value) return uni.$u.toast('身份证号码不能为空')
    if (!/^(\d{15}|\d{17}[\dX])$/.test(newIdCard.value)) {
        return uni.$u.toast('身份证号码格式错误')
    }

    fieldType.value = FieldType.ID_CARD
    await setUserInfoFun(newIdCard.value)
    showIdCard.value = false
}

// 修改用户昵称
const changeNameConfirm = async (e: any) => {
    newNickname.value = e.detail.value.nickname
    if (newNickname.value == '') return uni.$u.toast('昵称不能为空')
    if (newNickname.value.length > 10) return uni.$u.toast('昵称长度不得超过十位数')
    fieldType.value = FieldType.NICKNAME
    await setUserInfoFun(newNickname.value)

    showNickName.value = false
}

// 微信小程序 绑定｜｜修改用户手机号
const getPhoneNumber = async (e): Promise<void> => {
    const { encryptedData, iv, code } = e.detail
    const data = {
        code,
        encrypted_data: encryptedData,
        iv
    }
    if (encryptedData) {
        await userMnpMobile({
            ...data
        })
        uni.$u.toast('操作成功')
        getUser()
    }
}

onShow(async () => {
    getUser()
})
</script>

<style lang="scss">
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
    flex-shrink: 0;
    &:hover { background: var(--md-surface-variant); }
    &:active { background: var(--md-outline-variant); }
}

.nav__title {
    font-size: 18px;
    color: var(--md-on-surface);
    font-weight: 500;
}

.avatar-section {
    display: flex;
    justify-content: center;
    padding: 12px 0 8px;
    background: var(--md-surface);
    border-bottom: 1px solid var(--md-outline-variant);
    flex-shrink: 0;
}

.menu-group {
    margin: 8px 12px 0;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    box-shadow: var(--md-elevation-1);
    overflow: auto;
    flex: 1;
}

.menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid var(--md-outline-variant);
    &:last-child { border-bottom: none; }
}

.menu-item__label {
    width: 80px;
    font-size: 14px;
    color: var(--md-on-surface-variant);
    flex-shrink: 0;
}

.menu-item__right {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    justify-content: flex-end;
}

.menu-item__value {
    font-size: 14px;
    color: var(--md-on-surface);
    text-align: right;
}

.menu-item__action {
    margin-left: 8px;
    padding: 4px 10px;
    border-radius: var(--md-radius-full);
    border: 1px solid var(--md-primary);
    color: var(--md-primary);
    font-size: 12px;
    cursor: pointer;
}

.popup-card {
    padding: 24px 20px;
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    width: 85vw;
    box-sizing: border-box;
}

.popup-card__title {
    font-size: 18px;
    font-weight: 500;
    color: var(--md-on-surface);
    text-align: center;
    margin-bottom: 20px;
}

.popup-field {
    margin-bottom: 12px;
    height: 44px;
    padding: 0 12px;
    border: 1px solid var(--md-outline-variant);
    border-radius: var(--md-radius-sm);
    background: var(--md-background);
    display: flex;
    align-items: center;
}

.popup-field--row {
    display: flex;
    align-items: center;
}

.popup-input,
.popup-native-input {
    height: 100%;
    width: 100%;
    font-size: 14px;
    color: var(--md-on-surface);
    border: none;
    outline: none;
    background: transparent;
}

.popup-hint {
    font-size: 12px;
    color: var(--md-on-surface-variant);
    margin-bottom: 12px;
}

.popup-sms-btn {
    border-left: 1px solid var(--md-outline-variant);
    padding-left: 10px;
    margin-left: 8px;
    white-space: nowrap;
    font-size: 12px;
    color: var(--md-primary);
    cursor: pointer;
}

.popup-submit {
    margin-top: 16px;
    height: 44px;
    line-height: 44px;
    text-align: center;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    width: 100%;
    display: block;
}
</style>
