<template>
    <view class="news">
        <view class="news__header">
            <view class="news__title">资讯</view>
        </view>

        <tabs
            :current="current"
            @change="handleChange"
            height="80"
            bar-width="60"
            :barStyle="{ bottom: '0' }"
        >
            <tab v-for="(item, i) in tabList" :key="i" :name="item.name">
                <view class="news-list">
                    <news-list :cid="item.id" :i="i" :index="current"></news-list>
                </view>
            </tab>
        </tabs>

        <desktop-bottom-nav />
    </view>
</template>

<script lang="ts" setup>
import DesktopBottomNav from '@/components/desktop-bottom-nav/desktop-bottom-nav.vue'
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NewsList from './component/news-list.vue'
import { getArticleCate } from '@/api/news'

const tabList = ref<any>([])
const current = ref<number>(0)

const handleChange = (index: number) => {
    current.value = Number(index)
}

const getData = async () => {
    const data = await getArticleCate()
    tabList.value = [{ name: '全部', id: '' }].concat(data)
}

onLoad(() => {
    getData()
})
</script>

<style lang="scss">
.news {
    min-height: 100vh;
    padding-bottom: 118rpx;
    background: #f6f8fc;

    &__header {
        padding: 64rpx 24rpx 20rpx;
    }

    &__title {
        font-size: 40rpx;
        line-height: 1.2;
        font-weight: 900;
        color: #0f172a;
    }

    &-list {
        height: calc(100vh - 252rpx);
        padding-top: 20rpx;
    }
}
</style>
