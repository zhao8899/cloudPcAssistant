<template>
    <view class="page">
        <view class="nav">
            <view class="nav__back" @click="back">←</view>
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

.list {
    padding: 12px 14px 0;
}

.empty {
    padding: 60px 20px;
    text-align: center;
    color: var(--md-on-surface-variant);
    font-size: 14px;
}

.notice-card {
    padding: 14px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    box-shadow: var(--md-elevation-1);
    margin-bottom: 10px;
    cursor: pointer;
}

.notice-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.notice-card__title {
    font-size: 15px;
    color: var(--md-on-surface);
    font-weight: 500;
}

.notice-card__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--md-primary);
    flex-shrink: 0;
}

.notice-card__content {
    margin-top: 6px;
    color: var(--md-on-surface-variant);
    font-size: 13px;
    line-height: 1.7;
}

.notice-card__date {
    margin-top: 8px;
    color: var(--md-on-surface-variant);
    font-size: 11px;
}
</style>
