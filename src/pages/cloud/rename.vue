<template>
    <view class="page">
        <view class="nav">
            <view class="nav__back" @click="back">←</view>
            <view class="nav__title">修改名称</view>
        </view>

        <view class="card">
            <view class="card__label">云电脑名称</view>
            <input
                v-model.trim="form.nickname"
                class="card__input"
                maxlength="20"
                placeholder="请输入云电脑名称"
            />
            <view class="card__hint">名称支持中文、英文、数字、中划线、下划线，长度不超过 20 个字符。</view>
        </view>

        <view class="submit" :class="{ 'is-loading': submitting }" @click="submitRename">
            {{ submitting ? '保存中...' : '保存修改' }}
        </view>
        <desktop-bottom-nav />
    </view>
</template>

<script setup lang="ts">
import DesktopBottomNav from '@/components/desktop-bottom-nav/desktop-bottom-nav.vue'
import { getCloudInstanceDetail, renameCloudInstance } from '@/api/cloud'
import { navigateDesktopBack } from '@/utils/desktop'
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'

const instanceId = ref(0)
const submitting = ref(false)
const form = reactive({
    nickname: ''
})

const loadDetail = async (id: number) => {
    try {
        const data = (await getCloudInstanceDetail({ id })) || {}
        form.nickname = String(data.resource_name || '')
    } catch (error) {
        if (typeof error !== 'string') {
            uni.$u.toast('加载实例失败')
        }
    }
}

const submitRename = async () => {
    if (submitting.value) {
        return
    }

    const nickname = form.nickname.trim()
    if (!nickname) {
        uni.$u.toast('请输入新名称')
        return
    }

    try {
        submitting.value = true
        uni.showLoading({ title: '保存中...', mask: true })
        await renameCloudInstance({
            instance_id: instanceId.value,
            nickname
        })
        uni.$u.toast('修改成功')
        setTimeout(() => {
            navigateDesktopBack()
        }, 500)
    } catch (error) {
        if (typeof error !== 'string') {
            uni.$u.toast('修改失败，请重试')
        }
    } finally {
        submitting.value = false
        uni.hideLoading()
    }
}

const back = () => navigateDesktopBack()

onLoad((options) => {
    instanceId.value = Number(options?.id || 0)
    if (!instanceId.value) {
        uni.$u.toast('缺少实例ID')
        return
    }
    loadDetail(instanceId.value)
})
</script>

<style scoped lang="scss">
.page {
    min-height: 100vh;
    background: var(--md-background);
    display: flex;
    flex-direction: column;
}

.nav {
    display: flex;
    align-items: center;
    height: 56px;
    padding: 0 4px 0 8px;
    background: var(--md-surface);
    border-bottom: 1px solid var(--md-outline-variant);
    flex-shrink: 0;
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
    flex: 1;
    text-align: center;
    margin-right: 40px;
    font-size: 18px;
    font-weight: 500;
    color: var(--md-on-surface);
}

.card {
    margin: 12px 14px 0;
    padding: 14px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    box-shadow: var(--md-elevation-1);
}

.card__label {
    font-size: 12px;
    color: var(--md-on-surface-variant);
    margin-bottom: 8px;
}

.card__input {
    height: 44px;
    padding: 0 12px;
    border-radius: var(--md-radius-sm);
    background: var(--md-background);
    border: 1px solid var(--md-outline-variant);
    color: var(--md-on-surface);
    font-size: 15px;
    box-sizing: border-box;
    width: 100%;
}

.card__hint {
    margin-top: 8px;
    color: var(--md-on-surface-variant);
    font-size: 12px;
    line-height: 1.7;
}

.submit {
    margin: 12px 14px 0;
    height: 44px;
    line-height: 44px;
    text-align: center;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
}

.submit.is-loading {
    opacity: 0.7;
}
</style>
