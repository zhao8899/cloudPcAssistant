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
        <view class="header">
            <view class="header__title">{{ newsData.title }}</view>
            <view class="header__meta">
                <view v-if="newsData.author">作者: {{ newsData.author }}</view>
                <view class="header__time">{{ newsData.create_time }}</view>
                <view class="header__views">
                    <image src="/static/images/icon/icon_visit.png" class="header__views-icon" />
                    <view>{{ newsData.click }}</view>
                </view>
            </view>
        </view>

        <view class="content">
            <view class="summary" v-if="newsData.abstract">
                <text class="summary__label">摘要: </text>{{ newsData.abstract }}
            </view>
            <view class="body">
                <u-parse :html="newsData.content"></u-parse>
            </view>
        </view>

        <view class="collect-btn" @click="handleAddCollect(newsData.id)">
            <u-icon
                :name="newsData.collect ? 'star-fill' : 'star'"
                size="20"
                :color="newsData.collect ? '#F7BA47' : 'var(--md-on-surface-variant)'"
            ></u-icon>
            <text>收藏</text>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getArticleDetail, addCollect, cancelCollect } from '@/api/news'

const newsData = ref<any>({})
let newsId = ''

const getData = async (id) => {
    newsData.value = await getArticleDetail({ id })
}

const handleAddCollect = async (id: number) => {
    try {
        if (newsData.value.collect) {
            await cancelCollect({ id })
            uni.$u.toast('已取消收藏')
        } else {
            await addCollect({ id })
            uni.$u.toast('收藏成功')
        }
        getData(newsId)
    } catch (e) {
        //TODO handle the exception
    }
}

onLoad((options: any) => {
    newsId = options.id
    getData(newsId)
})
</script>

<style lang="scss">
.page {
    min-height: 100vh;
    background: var(--md-surface);
}

.header {
    padding: 16px;
    border-bottom: 1px solid var(--md-outline-variant);
}

.header__title {
    font-size: 20px;
    font-weight: 500;
    color: var(--md-on-surface);
    line-height: 1.4;
}

.header__meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
    font-size: 12px;
    color: var(--md-on-surface-variant);
}

.header__time {
    flex: 1;
}

.header__views {
    display: flex;
    align-items: center;
    gap: 4px;
}

.header__views-icon {
    width: 14px;
    height: 14px;
    opacity: 0.6;
}

.content {
    padding: 16px;
}

.summary {
    padding: 12px;
    border-radius: var(--md-radius-sm);
    background: var(--md-primary-container);
    color: var(--md-on-primary-container);
    font-size: 13px;
    line-height: 1.7;
    margin-bottom: 16px;
}

.summary__label {
    font-weight: 500;
}

.body {
    font-size: 14px;
    color: var(--md-on-surface);
    line-height: 1.8;
}

.collect-btn {
    position: fixed;
    right: 16px;
    bottom: 60px;
    height: 40px;
    padding: 0 14px;
    border-radius: var(--md-radius-full);
    background: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    box-shadow: var(--md-elevation-1);
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--md-on-surface-variant);
    cursor: pointer;
}
</style>
