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
        <view class="page">
            <view class="wallet-card">
                <view class="wallet-card__body">
                    <view class="wallet-card__label">钱包余额</view>
                    <view class="wallet-card__amount">{{ wallet.user_money }}</view>
                </view>
                <navigator v-if="wallet.status" url="/packages/pages/recharge/recharge" hover-class="none">
                    <view class="wallet-card__btn">去充值</view>
                </navigator>
            </view>

            <u-tabs :list="tabList" :is-scroll="false" v-model="current" activeColor="var(--md-primary)" @change="changeType"></u-tabs>

            <view class="log-list">
                <view v-for="item in dataList" :key="item.id" class="log-item">
                    <view class="log-item__row">
                        <view class="log-item__desc">{{ item.type_desc }}</view>
                        <view class="log-item__amount" :class="{ 'is-income': item.action == 1 }">{{ item.change_amount_desc }}</view>
                    </view>
                    <view class="log-item__time">{{ item.create_time }}</view>
                </view>
            </view>
        </view>
    </z-paging>
</template>

<script lang="ts" setup>
import { ref, shallowRef } from 'vue'
import { accountLog } from '@/api/user'
import { rechargeConfig } from '@/api/recharge'
import { onShow } from '@dcloudio/uni-app'
const tabList = ref([
    {
        name: '全部',
        type: ''
    },
    {
        name: '收入',
        type: 1
    },
    {
        name: '支出',
        type: 2
    }
])
const paging = shallowRef()
const dataList = ref<any[]>([])
const current = ref(0)

const changeType = (index: number) => {
    current.value = index
    paging.value.reload()
}

const queryList = async (pageNo: number, pageSize: number) => {
    try {
        const action = tabList.value[current.value].type
        const data = await accountLog({
            action,
            type: 'um',
            page_no: pageNo,
            page_size: pageSize
        })
        paging.value.complete(data.lists)
    } catch (error) {
        paging.value.complete(false)
    }
}

const wallet = ref<any>({})
const getWallet = async () => {
    wallet.value = await rechargeConfig()
}
onShow(() => {
    getWallet()
})
</script>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    background: var(--md-background);
}

.wallet-card {
    margin: 14px;
    padding: 20px;
    border-radius: var(--md-radius-md);
    background: var(--md-primary);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.wallet-card__body {
    color: var(--md-on-primary);
}

.wallet-card__label {
    font-size: 13px;
    opacity: 0.85;
}

.wallet-card__amount {
    font-size: 32px;
    font-weight: 500;
    margin-top: 4px;
}

.wallet-card__btn {
    padding: 8px 16px;
    border-radius: var(--md-radius-full);
    background: var(--md-on-primary);
    color: var(--md-primary);
    font-size: 13px;
    font-weight: 500;
}

.log-list {
    margin-top: 4px;
}

.log-item {
    padding: 12px 16px;
    background: var(--md-surface);
    border-bottom: 1px solid var(--md-outline-variant);
}

.log-item__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.log-item__desc {
    font-size: 14px;
    color: var(--md-on-surface);
}

.log-item__amount {
    font-size: 15px;
    color: var(--md-on-surface);
    &.is-income { color: var(--md-primary); }
}

.log-item__time {
    font-size: 12px;
    color: var(--md-on-surface-variant);
    margin-top: 2px;
}
</style>
