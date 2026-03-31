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
            <view class="form__title">{{ type == 'set' ? '设置登录密码' : '修改登录密码' }}</view>

            <view class="field" v-if="type != 'set'">
                <view class="field__label">原密码</view>
                <view class="field__row">
                    <u-input type="password" v-model="formData.old_password" :border="false" placeholder="请输入原来的密码" class="field__input" />
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
import { userChangePwd } from '@/api/user'
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'

const type = ref('')
const formData = reactive<any>({
    password: '',
    password_confirm: ''
})

const handleConfirm = async () => {
    if (!formData.old_password && type.value != 'set') return uni.$u.toast('请输入原来的密码')
    if (!formData.password) return uni.$u.toast('请输入密码')
    if (!formData.password_confirm) return uni.$u.toast('请输入确认密码')
    if (formData.password != formData.password_confirm) return uni.$u.toast('两次输入的密码不一致')
    await userChangePwd(formData)
    uni.$u.toast('操作成功')
    setTimeout(() => {
        uni.navigateBack()
    }, 1500)
}

onLoad((options) => {
    type.value = options.type || ''
    if (type.value == 'set') {
        uni.setNavigationBarTitle({
            title: '设置登录密码'
        })
    }
})
</script>

<style lang="scss">
page { height: 100%; }
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
