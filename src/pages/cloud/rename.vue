<template>
    <view class="page">
        <view class="nav">
            <view class="nav__back" @click="back">&lt;</view>
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
    background: #f8fafc;
}

.nav {
    display: flex;
    align-items: center;
    height: 110rpx;
    padding: 0 28rpx;
    color: #fff;
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    border-bottom-left-radius: 28rpx;
    border-bottom-right-radius: 28rpx;
}

.nav__back {
    width: 60rpx;
    font-size: 36rpx;
    font-weight: 700;
}

.nav__title {
    flex: 1;
    text-align: center;
    margin-right: 60rpx;
    font-size: 30rpx;
    font-weight: 900;
}

.card {
    margin: 28rpx;
    padding: 28rpx;
    border-radius: 30rpx;
    background: #fff;
    box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.05);
}

.card__label {
    font-size: 20rpx;
    color: #94a3b8;
    font-weight: 800;
    margin-bottom: 16rpx;
}

.card__input {
    height: 96rpx;
    padding: 0 24rpx;
    border-radius: 22rpx;
    background: #f8fafc;
    border: 2rpx solid #e2e8f0;
    color: #0f172a;
    font-size: 28rpx;
    font-weight: 800;
    box-sizing: border-box;
}

.card__hint {
    margin-top: 18rpx;
    color: #94a3b8;
    font-size: 20rpx;
    line-height: 1.7;
}

.submit {
    margin: 0 28rpx;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    border-radius: 26rpx;
    background: #2563eb;
    color: #fff;
    font-size: 24rpx;
    font-weight: 900;
    box-shadow: 0 16rpx 36rpx rgba(37, 99, 235, 0.22);
}

.submit.is-loading {
    opacity: 0.7;
}
</style>
