<template>
    <page-meta :page-style="$theme.pageStyle">
        <!-- #ifndef H5 -->
        <navigation-bar
            :front-color="$theme.navColor"
            :background-color="$theme.navBgColor"
        />
        <!-- #endif -->
    </page-meta>
    <!-- 页面状态 -->
    <page-status :status="status">
        <template #error>
            <u-empty text="订单不存在" mode="order"></u-empty>
        </template>
        <template #default>
            <view class="page">
                <view class="result-card">
                    <view class="result-card__status">
                        <u-image :src="paymentStatus['image']" width="80" height="80" shape="circle" />
                        <text class="result-card__text">{{ paymentStatus['text'] }}</text>
                        <view class="result-card__amount">¥ {{ orderInfo.order.order_amount }}</view>
                    </view>

                    <view class="result-info">
                        <view class="result-info__item">
                            <text>订单编号</text>
                            <text>{{ orderInfo.order.order_sn }}</text>
                        </view>
                        <view class="result-info__item">
                            <text>付款时间</text>
                            <text>{{ orderInfo.order.pay_time }}</text>
                        </view>
                        <view class="result-info__item">
                            <text>支付方式</text>
                            <text v-if="orderInfo.pay_status">{{ orderInfo.order.pay_way || '-' }}</text>
                            <text v-else>未支付</text>
                        </view>
                    </view>
                </view>

                <view class="actions">
                    <view v-if="pageOptions.from == 'recharge'" class="action-btn action-btn--outline" @click="goOrder">继续充值</view>
                    <view class="action-btn action-btn--primary" @click="goHome">返回首页</view>
                </view>
            </view>
        </template>
    </page-status>
</template>

<script lang="ts" setup>
import {getPayResult} from '@/api/pay'
import {PageStatusEnum} from '@/enums/appEnums'
import { getDesktopHomeRoute, isDesktopClient } from '@/utils/desktop'
import {onLoad} from '@dcloudio/uni-app'
import {computed, reactive, ref} from 'vue'
import {useRouter} from "uniapp-router-next";

const router = useRouter()
const isDesktop = isDesktopClient()

const mapStatus = {
    succeed: {
        text: '支付成功',
        image: '/static/images/payment/icon_succeed.png'
    },
    waiting: {
        text: '等待支付',
        image: '/static/images/payment/icon_waiting.png'
    }
}
const status = ref(PageStatusEnum['LOADING'])
const pageOptions = ref({
    id: '',
    from: ''
})
const orderInfo = reactive<any>({
    order: {}
})
const paymentStatus = computed(() => {
    const status = !!orderInfo.pay_status
    return mapStatus[status ? 'succeed' : 'waiting']
})

const initPageData = () => {
    return new Promise((resolve, reject) => {
        getPayResult({
            order_id: pageOptions.value.id,
            from: pageOptions.value.from
        })
            .then((data) => {
                Object.assign(orderInfo, data)
                resolve(data)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

const goHome = () => {
    router.reLaunch(isDesktop ? getDesktopHomeRoute() : '/pages/index/index')
}

const goOrder = () => {
    switch (pageOptions.value.from) {
        case 'recharge':
            router.navigateBack()
            break
    }
}

onLoad(async (options: any) => {
    try {
        if (!options.id) throw new Error('订单不存在')
        pageOptions.value = options
        await initPageData()
        status.value = PageStatusEnum['NORMAL']
    } catch (err) {
        console.log(err)
        status.value = PageStatusEnum['ERROR']
    }
})
</script>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    background: var(--md-background);
    padding: 14px;
    box-sizing: border-box;
}

.result-card {
    padding: 20px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    box-shadow: var(--md-elevation-1);
}

.result-card__status {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 0;
}

.result-card__text {
    font-size: 20px;
    font-weight: 500;
    color: var(--md-on-surface);
    margin-top: 10px;
}

.result-card__amount {
    font-size: 28px;
    font-weight: 500;
    color: var(--md-primary);
    margin-top: 8px;
}

.result-info {
    margin-top: 16px;
    border-top: 1px solid var(--md-outline-variant);
    padding-top: 12px;
}

.result-info__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 13px;
    color: var(--md-on-surface);
    border-bottom: 1px solid var(--md-outline-variant);
    &:last-child { border-bottom: none; }
}

.actions {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.action-btn {
    height: 44px;
    line-height: 44px;
    text-align: center;
    border-radius: var(--md-radius-full);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
}

.action-btn--primary {
    background: var(--md-primary);
    color: var(--md-on-primary);
}

.action-btn--outline {
    border: 1px solid var(--md-primary);
    color: var(--md-primary);
}
</style>
