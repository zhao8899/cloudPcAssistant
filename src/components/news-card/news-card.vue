<template>
    <navigator :url="`/pages/news_detail/news_detail?id=${newsId}`" hover-class="none">
        <view class="news-card">
            <u-image v-if="item.image" :src="item.image" width="90" height="68" class="news-card__thumb" />
            <view class="news-card__body">
                <view class="news-card__title">{{ item.title }}</view>
                <view class="news-card__desc">{{ item.desc }}</view>
                <view class="news-card__meta">
                    <text>{{ item.create_time }}</text>
                    <view class="news-card__views">
                        <image src="/static/images/icon/icon_visit.png" class="news-card__views-icon" />
                        <text>{{ item.click }}</text>
                    </view>
                </view>
            </view>
        </view>
    </navigator>
</template>

<script lang="ts" setup>
const props = withDefaults(
    defineProps<{
        item: any
        newsId: number
    }>(),
    {
        item: {},
        newsId: 0
    }
)
</script>

<style lang="scss" scoped>
.news-card {
    display: flex;
    gap: 12px;
    padding: 14px 16px;
    background: var(--md-surface);
    border-bottom: 1px solid var(--md-outline-variant);
    cursor: pointer;
    &:active { background: var(--md-surface-variant); }
}

.news-card__thumb {
    flex-shrink: 0;
    border-radius: var(--md-radius-sm);
    overflow: hidden;
}

.news-card__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 4px;
}

.news-card__title {
    font-size: 15px;
    font-weight: 500;
    color: var(--md-on-surface);
    line-height: 1.4;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    word-break: break-all;
}

.news-card__desc {
    font-size: 13px;
    color: var(--md-on-surface-variant);
    line-height: 1.4;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    word-break: break-all;
}

.news-card__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--md-on-surface-variant);
    margin-top: 2px;
}

.news-card__views {
    display: flex;
    align-items: center;
    gap: 4px;
}

.news-card__views-icon {
    width: 14px;
    height: 14px;
    opacity: 0.6;
}
</style>
