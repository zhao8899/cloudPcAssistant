<template>
    <page-meta :page-style="$theme.pageStyle">
        <!-- #ifndef H5 -->
        <navigation-bar
            :front-color="$theme.navColor"
            :background-color="$theme.navBgColor"
        />
        <!-- #endif -->
    </page-meta>
    <z-paging ref="paging" v-model="dataList" @query="queryList" :show-loading-more-when-reload="true">
        <view class="record-list">
            <view v-for="item in dataList" :key="item.id" class="record-item">
                <view class="record-item__row">
                    <view class="record-item__desc">{{ item.tips }}</view>
                    <view class="record-item__amount">+{{ item.order_amount }}</view>
                </view>
                <view class="record-item__time">{{ item.create_time }}</view>
            </view>
        </view>
    </z-paging>
</template>

<script lang="ts" setup>
import { ref, shallowRef } from 'vue'
import { rechargeRecord } from '@/api/recharge'

const paging = shallowRef()
const dataList = ref<any[]>([])

const queryList = async (pageNo: number, pageSize: number) => {
    try {
        const data = await rechargeRecord({
            page_no: pageNo,
            page_size: pageSize
        })
        paging.value.complete(data.lists)
    } catch (error) {
        paging.value.complete(false)
    }
}
</script>

<style lang="scss" scoped>
.record-list {
    background: var(--md-background);
    min-height: 100vh;
}

.record-item {
    padding: 12px 16px;
    background: var(--md-surface);
    border-bottom: 1px solid var(--md-outline-variant);
}

.record-item__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.record-item__desc {
    font-size: 14px;
    color: var(--md-on-surface);
}

.record-item__amount {
    font-size: 15px;
    color: var(--md-primary);
    font-weight: 500;
}

.record-item__time {
    font-size: 12px;
    color: var(--md-on-surface-variant);
    margin-top: 2px;
}
</style>
