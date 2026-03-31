<template>
    <view class="page" v-if="pageReady">
        <view class="nav">
            <view class="nav__back" @click="back">&lt;</view>
            <view class="nav__title">{{ isDirectRenew ? '立即续期' : '续期申请' }}</view>
        </view>

        <view class="card">
            <view class="row"><text>云电脑名称</text><text>{{ instanceData.resource_name || instanceData.desktop_oid || instanceData.cloud_resource_id || '-' }}</text></view>
            <view class="row"><text>原订单号</text><text>{{ instanceData.order_no || '-' }}</text></view>
            <view class="row"><text>当前到期时间</text><text>{{ previewData?.before_expire_time_text || instanceData.expired_at_text || '-' }}</text></view>
            <view class="row"><text>实例状态</text><text>{{ previewData?.instance_status_text || '-' }}</text></view>
        </view>

        <view class="card">
            <view class="picker-section">
                <view class="picker-title">续期单位</view>
                <view class="switch-group">
                    <view
                        v-for="item in unitOptions"
                        :key="item.value"
                        class="switch-item"
                        :class="{ 'is-active': form.duration_unit === item.value }"
                        @click="changeDurationUnit(item.value)"
                    >
                        <view class="switch-item__label">{{ item.label }}</view>
                        <view class="switch-item__desc">{{ item.value === 'year' ? '最长 5 年' : '最长 12 个月' }}</view>
                    </view>
                </view>
            </view>

            <view class="picker-section picker-section--divider">
                <view class="picker-head">
                    <view class="picker-title">续期时长</view>
                    <view class="picker-value">{{ previewData?.duration_text || `${form.duration_value}${form.duration_unit === 'year' ? '年' : '个月'}` }}</view>
                </view>
                <view class="count-group">
                    <view class="count-btn" :class="{ 'is-disabled': form.duration_value <= 1 }" @click="changeDurationValue(-1)">-</view>
                    <view class="count-value">
                        <view class="count-value__num">{{ form.duration_value }}</view>
                        <view class="count-value__unit">{{ form.duration_unit === 'year' ? '年' : '个月' }}</view>
                    </view>
                    <view class="count-btn" :class="{ 'is-disabled': form.duration_value >= maxDurationValue }" @click="changeDurationValue(1)">+</view>
                </view>
                <view class="count-hint">可选范围：1 - {{ maxDurationValue }}{{ form.duration_unit === 'year' ? '年' : '个月' }}</view>
            </view>
        </view>

        <view class="card" v-if="previewData">
            <view class="row"><text>续后到期</text><text class="highlight">{{ previewData.after_expire_time_text || '-' }}</text></view>
            <view class="row"><text>当前资源包</text><text>{{ previewData.current_pack_name || '-' }}</text></view>
            <view class="row"><text>资源包到期</text><text>{{ previewData.current_pack_end_time_text || '-' }}</text></view>
            <view class="row"><text>续期资源包</text><text>{{ previewData.target_pack_name || previewData.current_pack_name || '-' }}</text></view>
            <view class="row"><text>恢复配额</text><text>{{ previewData.resource_reoccupy ? '需要' : '不需要' }}</text></view>
        </view>

        <view class="tip">
            <view class="tip__title">{{ isDirectRenew ? '直接续期说明' : '申请说明' }}</view>
            <view class="tip__text">{{ isDirectRenew ? '当前账号为代理身份，确认后会直接执行续期。' : '提交后进入代理商工作台，审核通过后才会正式续期。' }}</view>
            <view class="tip__text">资源包到期日期与续后到期日期同一天时，仍视为可覆盖。</view>
            <view v-if="previewData?.need_unlock" class="tip__warn">实例当前已过期锁定，续期成功后系统会尝试自动解锁。</view>
            <view v-if="previewData && !previewData.renewable" class="tip__error">{{ previewData.renew_block_reason }}</view>
        </view>

        <view class="footer">
            <view class="footer__ghost" @click="back">取消</view>
            <view class="footer__primary" :class="{ 'is-disabled': submitDisabled }" @click="submit">
                {{ submitText }}
            </view>
        </view>
        <desktop-bottom-nav />
    </view>
</template>

<script setup lang="ts">
import DesktopBottomNav from '@/components/desktop-bottom-nav/desktop-bottom-nav.vue'
import { applyRenewCloudOrder, getCloudInstanceDetail, getCloudOrderRenewPreview, renewCloudOrder } from '@/api/cloud'
import { useUserStore } from '@/stores/user'
import { navigateDesktopBack } from '@/utils/desktop'
import { onLoad } from '@dcloudio/uni-app'
import { computed, reactive, ref } from 'vue'

const userStore = useUserStore()
const pageReady = ref(false)
const loadingPreview = ref(false)
const submitting = ref(false)
const instanceData = reactive<any>({})
const previewData = ref<any>(null)
const form = reactive({
    instance_id: 0,
    order_id: 0,
    duration_unit: 'month',
    duration_value: 1
})

const unitOptions = [
    { label: '按月', value: 'month' },
    { label: '按年', value: 'year' }
]

const isDirectRenew = computed(() => {
    const userInfo = userStore.userInfo || {}
    return Number(userInfo.is_agent || 0) === 1 || Number(userInfo.is_sub_agent || 0) === 1
})

const submitDisabled = computed(() => submitting.value || loadingPreview.value || !previewData.value?.renewable)
const submitText = computed(() => {
    if (submitting.value) {
        return isDirectRenew.value ? '续期中...' : '提交中...'
    }
    return isDirectRenew.value ? '立即续期' : '提交续期申请'
})

const maxDurationValue = computed(() => (form.duration_unit === 'year' ? 5 : 12))

const loadPreview = async () => {
    if (!form.order_id) {
        return
    }
    try {
        loadingPreview.value = true
        previewData.value = await getCloudOrderRenewPreview({
            order_id: form.order_id,
            duration_unit: form.duration_unit,
            duration_value: form.duration_value
        })
    } catch (error) {
        previewData.value = null
        if (typeof error !== 'string') {
            uni.$u.toast('加载续期预览失败')
        }
    } finally {
        loadingPreview.value = false
    }
}

const loadInstance = async (id: number) => {
    const data = (await getCloudInstanceDetail({ id })) || {}
    Object.keys(instanceData).forEach((key) => delete instanceData[key])
    Object.assign(instanceData, data)
    form.instance_id = id
    form.order_id = Number(data.order_id || 0)
    if (!form.order_id) {
        throw new Error('未找到关联订单')
    }
}

const changeDurationUnit = async (value: string) => {
    if (form.duration_unit === value || loadingPreview.value) {
        return
    }
    form.duration_unit = value
    if (form.duration_value > maxDurationValue.value) {
        form.duration_value = maxDurationValue.value
    }
    await loadPreview()
}

const changeDurationValue = async (step: number) => {
    if (loadingPreview.value) {
        return
    }
    const nextValue = Math.min(maxDurationValue.value, Math.max(1, form.duration_value + step))
    if (nextValue === form.duration_value) {
        return
    }
    form.duration_value = nextValue
    await loadPreview()
}

const submit = async () => {
    if (submitDisabled.value || !form.order_id) {
        return
    }

    const actionText = isDirectRenew.value ? '立即续期' : '提交续期申请'
    const modalRes = await uni.showModal({
        title: `确认${actionText}`,
        content: isDirectRenew.value
            ? '确认后会直接执行续期，请核对续期时长。'
            : '确认后将提交给代理商审核，审核通过后才会正式续期。',
        confirmText: '确认',
        cancelText: '取消'
    })
    if (!modalRes.confirm) {
        return
    }

    try {
        submitting.value = true
        uni.showLoading({ title: isDirectRenew.value ? '续期中...' : '提交中...', mask: true })
        const requestData = {
            order_id: form.order_id,
            duration_unit: form.duration_unit,
            duration_value: form.duration_value
        }
        const result = isDirectRenew.value
            ? await renewCloudOrder(requestData)
            : await applyRenewCloudOrder(requestData)

        uni.$u.toast(isDirectRenew.value ? '续期成功' : '续期申请已提交')
        if (isDirectRenew.value) {
            await loadPreview()
            setTimeout(() => {
                uni.redirectTo({ url: `/pages/cloud/order-detail?id=${form.order_id}` })
            }, 500)
            return
        }

        const applyOrderId = Number(result?.apply_order_id || 0)
        setTimeout(() => {
            uni.redirectTo({
                url: applyOrderId > 0 ? `/pages/cloud/order-detail?id=${applyOrderId}` : '/pages/cloud/orders'
            })
        }, 500)
    } catch (error) {
        if (typeof error !== 'string') {
            uni.$u.toast(isDirectRenew.value ? '续期失败，请重试' : '提交失败，请重试')
        }
    } finally {
        submitting.value = false
        uni.hideLoading()
    }
}

const back = () => navigateDesktopBack()

onLoad(async (options) => {
    const id = Number(options?.id || 0)
    if (!id) {
        uni.$u.toast('缺少实例ID')
        return
    }

    try {
        await loadInstance(id)
        await loadPreview()
        pageReady.value = true
    } catch (error: any) {
        uni.$u.toast(error?.message || '加载续期信息失败')
    }
})
</script>

<style scoped lang="scss">
.page {
    min-height: 100vh;
    background: #f8fafc;
    padding-bottom: 150rpx;
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

.row {
    display: flex;
    justify-content: space-between;
    gap: 24rpx;
    padding: 18rpx 0;
    border-bottom: 1rpx solid #f1f5f9;
    font-size: 22rpx;
    color: #334155;
}

.row:last-child {
    border-bottom: none;
}

.highlight {
    color: #2563eb;
    font-weight: 900;
}

.picker-title {
    color: #475569;
    font-size: 22rpx;
    font-weight: 800;
}

.picker-section + .picker-section {
    margin-top: 28rpx;
}

.picker-section--divider {
    padding-top: 28rpx;
    border-top: 1rpx solid #eef2f7;
}

.picker-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
}

.picker-value {
    padding: 10rpx 18rpx;
    border-radius: 999rpx;
    background: #eff6ff;
    color: #2563eb;
    font-size: 20rpx;
    font-weight: 800;
}

.switch-group {
    display: flex;
    gap: 16rpx;
    margin-top: 16rpx;
}

.switch-item {
    flex: 1;
    min-height: 108rpx;
    padding: 18rpx 20rpx;
    border-radius: 20rpx;
    background: #f1f5f9;
    color: #64748b;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    box-sizing: border-box;
    border: 2rpx solid transparent;
}

.switch-item.is-active {
    background: #eff6ff;
    color: #2563eb;
    border-color: #93c5fd;
}

.switch-item__label {
    font-size: 24rpx;
    font-weight: 800;
}

.switch-item__desc {
    margin-top: 8rpx;
    font-size: 18rpx;
    color: #94a3b8;
}

.switch-item.is-active .switch-item__desc {
    color: #3b82f6;
}

.count-group {
    display: grid;
    grid-template-columns: 96rpx minmax(0, 1fr) 96rpx;
    align-items: center;
    gap: 18rpx;
    margin-top: 18rpx;
}

.count-btn,
.count-value {
    height: 76rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
}

.count-btn {
    background: #f1f5f9;
    color: #334155;
    font-size: 34rpx;
}

.count-btn.is-disabled {
    opacity: 0.4;
}

.count-value {
    min-height: 92rpx;
    padding: 0 24rpx;
    background: #eff6ff;
    color: #2563eb;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
}

.count-value__num {
    font-size: 34rpx;
    line-height: 1;
    font-weight: 900;
}

.count-value__unit {
    font-size: 18rpx;
    color: #3b82f6;
}

.count-hint {
    margin-top: 16rpx;
    text-align: center;
    color: #64748b;
    font-size: 20rpx;
}

.tip {
    margin: 0 28rpx;
    padding: 24rpx;
    border-radius: 22rpx;
    background: #fffbeb;
    border: 1rpx solid #fde68a;
}

.tip__title {
    color: #92400e;
    font-size: 22rpx;
    font-weight: 900;
}

.tip__text,
.tip__warn,
.tip__error {
    margin-top: 10rpx;
    font-size: 20rpx;
    line-height: 1.7;
}

.tip__text {
    color: #b45309;
}

.tip__warn {
    color: #d97706;
}

.tip__error {
    color: #dc2626;
}

.footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    gap: 16rpx;
    padding: 20rpx 28rpx calc(20rpx + env(safe-area-inset-bottom));
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 -12rpx 30rpx rgba(15, 23, 42, 0.06);
}

.footer__ghost,
.footer__primary {
    flex: 1;
    height: 84rpx;
    line-height: 84rpx;
    text-align: center;
    border-radius: 22rpx;
    font-size: 24rpx;
    font-weight: 900;
}

.footer__ghost {
    background: #f1f5f9;
    color: #475569;
}

.footer__primary {
    background: #2563eb;
    color: #fff;
}

.footer__primary.is-disabled {
    opacity: 0.45;
}
</style>
