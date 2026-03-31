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
        <view class="amount-card">
            <view class="amount-card__label">充值金额</view>
            <view class="amount-card__input-row">
                <input v-model="money" class="amount-card__input" placeholder="0.00" type="digit" />
            </view>
            <view class="amount-card__hint">
                当前可用余额 <text class="amount-card__balance">{{ wallet.user_money }}</text>
            </view>
        </view>

        <view class="submit" :class="{ 'is-loading': isLock }" @click="rechargeLock">立即充值</view>

        <view class="record-link">
            <navigator url="/packages/pages/recharge_record/recharge_record" hover-class="none">
                <text class="record-link__text">充值记录</text>
            </navigator>
        </view>

        <payment
            v-model:show="payState.showPay"
            v-model:show-check="payState.showCheck"
            :order-id="payState.orderId"
            :from="payState.from"
            :redirect="payState.redirect"
            @success="handlePaySuccess"
            @fail="handlePayFail"
        />
    </view>
</template>
<script lang="ts" setup>
import { recharge, rechargeConfig } from '@/api/recharge'
import { useLockFn } from '@/hooks/useLockFn'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
const money = ref('')

const payState = reactive({
    orderId: '',
    from: '',
    showPay: false,
    showCheck: false,
    redirect: '/packages/pages/recharge/recharge'
})
const wallet = reactive({
    user_money: '',
    min_amount: 0
})

const { isLock, lockFn: rechargeLock } = useLockFn(async () => {
    const minNum = wallet.min_amount
    if (!money.value) return uni.$u.toast('请输入充值金额')
    if (minNum == 0 && Number(money.value) == minNum) {
        return uni.$u.toast(`充值金额必须大于0`)
    }
    if (Number(money.value) < minNum) return uni.$u.toast(`最低充值金额${minNum}`)
    const data = await recharge({
        money: money.value
    })
    payState.orderId = data.order_id
    payState.from = data.from
    payState.showPay = true
})

const handlePaySuccess = async () => {
    payState.showPay = false
    payState.showCheck = false
    uni.navigateTo({
        url: `/pages/payment_result/payment_result?id=${payState.orderId}&from=${payState.from}`
    })
}

const handlePayFail = async () => {
    uni.$u.toast('支付失败')
}

const getWallet = async () => {
    const data = await rechargeConfig()
    Object.assign(wallet, data)
}

onLoad((options: any) => {
    // h5支付用于弹起手动确认支付弹窗
    if (options?.checkPay) {
        payState.orderId = options.id
        payState.from = options.from
        payState.showCheck = true
    }
})
onShow(() => {
    getWallet()
})
</script>

<style scoped lang="scss">
.page {
    min-height: 100vh;
    background: var(--md-background);
    padding: 14px;
    box-sizing: border-box;
}

.amount-card {
    padding: 16px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    box-shadow: var(--md-elevation-1);
}

.amount-card__label {
    font-size: 13px;
    color: var(--md-on-surface-variant);
    margin-bottom: 8px;
}

.amount-card__input-row {
    border-bottom: 1px solid var(--md-outline-variant);
    padding-bottom: 8px;
}

.amount-card__input {
    font-size: 28px;
    height: 44px;
    color: var(--md-on-surface);
    width: 100%;
}

.amount-card__hint {
    margin-top: 8px;
    font-size: 12px;
    color: var(--md-on-surface-variant);
}

.amount-card__balance {
    color: var(--md-primary);
}

.submit {
    margin-top: 20px;
    height: 44px;
    line-height: 44px;
    text-align: center;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    &.is-loading { opacity: 0.7; }
}

.record-link {
    display: flex;
    justify-content: center;
    margin: 28px 0;
}

.record-link__text {
    font-size: 13px;
    color: var(--md-on-surface-variant);
    text-decoration: underline;
}
</style>
