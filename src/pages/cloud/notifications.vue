<template>
    <view class="page">
        <view class="nav">
            <view class="nav__back" @click="back">&lt;</view>
            <view class="nav__title">通知中心</view>
        </view>

        <view v-if="!noticeState.lists.length" class="empty">暂无消息</view>

        <view v-else class="list">
            <view
                v-for="item in noticeState.lists"
                :key="item.id"
                class="notice-card"
                @click="openNotice(item)"
            >
                <view class="notice-card__head">
                    <view class="notice-card__title">{{ item.title }}</view>
                    <view class="notice-card__dot" v-if="Number(item.is_read || 0) !== 1"></view>
                </view>
                <view class="notice-card__content">{{ item.content }}</view>
                <view class="notice-card__date">{{ item.create_time_text || '-' }}</view>
            </view>
        </view>
        <desktop-bottom-nav />
    </view>
</template>

<script setup lang="ts">
import DesktopBottomNav from '@/components/desktop-bottom-nav/desktop-bottom-nav.vue'
import { getCloudNotificationLists, readCloudNotification } from '@/api/cloud'
import { navigateDesktopBack } from '@/utils/desktop'
import { onShow } from '@dcloudio/uni-app'
import { reactive } from 'vue'

const noticeState = reactive({
    lists: [] as any[]
})

const loadNotices = async () => {
    try {
        const data = await getCloudNotificationLists({ page_no: 1, page_size: 50 })
        noticeState.lists = Array.isArray(data?.lists) ? data.lists : []
    } catch (error) {
        noticeState.lists = []
        if (typeof error !== 'string') {
            uni.$u.toast('加载消息失败')
        }
    }
}

const openNotice = async (item: any) => {
    if (Number(item?.id || 0) <= 0) return

    if (Number(item.is_read || 0) !== 1) {
        try {
            await readCloudNotification({ id: item.id })
            item.is_read = 1
        } catch (error) {}
    }

    await uni.showModal({
        title: String(item.title || '消息详情'),
        content: String(item.content || '-'),
        showCancel: false,
        confirmText: '知道了'
    })
}

const back = () => navigateDesktopBack()

onShow(() => {
    loadNotices()
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

.list {
    padding: 28rpx;
}

.empty {
    padding: 140rpx 40rpx;
    text-align: center;
    color: #94a3b8;
    font-size: 24rpx;
}

.notice-card {
    padding: 28rpx;
    border-radius: 28rpx;
    background: #fff;
    box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.05);
    margin-bottom: 18rpx;
}

.notice-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.notice-card__title {
    font-size: 28rpx;
    color: #0f172a;
    font-weight: 900;
}

.notice-card__dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: #2563eb;
}

.notice-card__content {
    margin-top: 14rpx;
    color: #475569;
    font-size: 22rpx;
    line-height: 1.7;
}

.notice-card__date {
    margin-top: 16rpx;
    color: #94a3b8;
    font-size: 18rpx;
}
</style>
