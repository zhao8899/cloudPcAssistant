<template>
    <view class="page" v-if="detailState.data.id">
        <view class="nav">
            <view class="nav__back" @click="back">&lt;</view>
            <view class="nav__title">订单详情</view>
        </view>

        <view class="card">
                <view class="card__head">
                <view class="card__main">
                    <view class="card__title-row">
                        <view class="card__title">{{ detailState.data.flavor_name || '云实例订单' }}</view>
                        <view class="card__link-btn" @click.stop="goInstanceDetail">查看云电脑</view>
                    </view>
                    <view class="card__status" :class="`is-${detailState.data.display_status}`">
                        {{ detailState.data.display_status_text }}
                    </view>
                </view>
                <view v-if="detailState.data.can_audit || detailState.data.can_cancel" class="card__actions">
                    <view v-if="detailState.data.can_cancel" class="action-btn action-btn--muted" :class="{ 'is-loading': actionLoading }" @click="cancelOrder">
                        {{ actionLoading ? '提交中...' : '取消订单' }}
                    </view>
                    <view v-if="detailState.data.can_audit" class="action-btn action-btn--danger" :class="{ 'is-loading': actionLoading }" @click="auditOrder('rejected')">
                        {{ actionLoading ? '提交中...' : '拒绝' }}
                    </view>
                    <view v-if="detailState.data.can_audit" class="action-btn action-btn--primary" :class="{ 'is-loading': actionLoading }" @click="auditOrder('approved')">
                        {{ actionLoading ? '提交中...' : approveButtonText }}
                    </view>
                </view>
            </view>
        </view>

        <view class="card">
            <view class="row"><text>订单号</text><text>{{ detailState.data.order_no }}</text></view>
            <view class="row"><text>提交人</text><text>{{ detailState.data.submit_user_name || '-' }}</text></view>
            <view class="row"><text>下单人昵称</text><text>{{ detailState.data.submit_user_nickname || '-' }}</text></view>
            <view class="row"><text>下单人手机号</text><text>{{ detailState.data.submit_user_mobile || '-' }}</text></view>
            <view class="row"><text>来源</text><text>{{ detailState.data.order_source_text || '-' }}</text></view>
            <view v-if="detailState.data.is_renew_apply" class="row"><text>原订单号</text><text>{{ detailState.data.renew_apply?.target_order_no || '-' }}</text></view>
            <view v-if="detailState.data.is_renew_apply" class="row"><text>续前到期</text><text>{{ detailState.data.renew_apply?.before_expire_time_text || '-' }}</text></view>
            <view v-if="detailState.data.is_renew_apply" class="row"><text>续后到期</text><text>{{ detailState.data.renew_apply?.after_expire_time_text || '-' }}</text></view>
            <view class="row"><text>审核状态</text><text>{{ detailState.data.audit_status_text || '-' }}</text></view>
            <view class="row"><text>下单时间</text><text>{{ detailState.data.create_time_text || '-' }}</text></view>
            <view class="row"><text>时长</text><text>{{ detailState.data.duration_text || '-' }}</text></view>
            <view class="row"><text>系统</text><text>{{ detailState.data.os_type || '-' }}</text></view>
            <view class="row"><text>镜像</text><text>{{ detailState.data.image_name || '-' }}</text></view>
            <view class="row"><text>CPU / 内存</text><text>{{ detailState.data.cpu || 0 }}C / {{ detailState.data.memory_gb || 0 }}G</text></view>
            <view class="row"><text>带宽</text><text>{{ detailState.data.bandwidth_mbps || 0 }}M</text></view>
            <view class="row"><text>系统盘</text><text>{{ detailState.data.system_disk_gb || 120 }}GB</text></view>
            <view class="row"><text>数量</text><text>{{ detailState.data.quantity || 1 }}台</text></view>
            <view class="row"><text>联系邮箱</text><text>{{ detailState.data.user_email || '-' }}</text></view>
            <view class="row"><text>联系电话</text><text>{{ detailState.data.user_mobile || '-' }}</text></view>
            <view class="row"><text>桌面编号</text><text>{{ detailState.data.desktop_id || '-' }}</text></view>
            <view class="row"><text>审核备注</text><text>{{ detailState.data.audit_remark || '-' }}</text></view>
            <view class="row"><text>失败原因</text><text>{{ detailState.data.fail_message || '-' }}</text></view>
        </view>

        <view class="card" v-if="detailState.data.status_logs?.length">
            <view class="card__sub-title">状态记录</view>
            <view v-for="log in detailState.data.status_logs" :key="log.id" class="log-item">
                <view class="log-item__time">{{ log.create_time_text }}</view>
                <view class="log-item__text">{{ log.reason || `${log.from_status} -> ${log.to_status}` }}</view>
            </view>
        </view>
        <desktop-bottom-nav />
    </view>
</template>

<script setup lang="ts">
import DesktopBottomNav from '@/components/desktop-bottom-nav/desktop-bottom-nav.vue'
import {
    auditCloudOrderWorkbench,
    cancelCloudOrderWorkbench,
    getCloudOrderWorkbenchDetail
} from '@/api/cloud'
import { navigateDesktopBack } from '@/utils/desktop'
import { onLoad } from '@dcloudio/uni-app'
import { computed, reactive, ref } from 'vue'

const detailState = reactive({
    data: {} as any
})
const actionLoading = ref(false)
const isRenewApply = computed(() => Number(detailState.data?.is_renew_apply || 0) === 1)
const approveButtonText = computed(() => (isRenewApply.value ? '审核并续期' : '审核并开通'))

const loadDetail = async (id: number) => {
    try {
        detailState.data = (await getCloudOrderWorkbenchDetail({ id })) || {}
    } catch (error) {
        if (typeof error !== 'string') {
            uni.$u.toast('加载详情失败')
        }
    }
}

const auditOrder = async (action: 'approved' | 'rejected') => {
    if (actionLoading.value) {
        return
    }

    const isApprove = action === 'approved'
    const modalRes = await uni.showModal({
        title: isApprove ? (isRenewApply.value ? '确认审核并续期' : '确认审核并开通') : '确认拒绝订单',
        content: isApprove
            ? (isRenewApply.value ? '确认后将立即执行续期，请核对续期时长和到期时间。' : '确认后将立即执行开通流程，请核对订单信息。')
            : '确认后该订单将被拒绝，是否继续？',
        confirmText: '确认',
        cancelText: '取消'
    })

    if (!modalRes.confirm) {
        return
    }

    try {
        actionLoading.value = true
        uni.showLoading({ title: isApprove ? (isRenewApply.value ? '续期中...' : '开通中...') : '提交中...', mask: true })
        await auditCloudOrderWorkbench({
            id: Number(detailState.data.id || 0),
            audit_action: action,
            audit_remark: ''
        })
        uni.$u.toast(action === 'approved' ? (isRenewApply.value ? '续期已处理' : '已提交开通') : '已拒绝')
        await loadDetail(Number(detailState.data.id || 0))
    } catch (error) {
        if (typeof error !== 'string') {
            uni.$u.toast('操作失败，请重试')
        }
    } finally {
        actionLoading.value = false
        uni.hideLoading()
    }
}

const cancelOrder = async () => {
    if (actionLoading.value) {
        return
    }

    const modalRes = await uni.showModal({
        title: '确认取消订单',
        content: '取消后该订单将终止，是否继续？',
        confirmText: '确认',
        cancelText: '取消'
    })

    if (!modalRes.confirm) {
        return
    }

    try {
        actionLoading.value = true
        uni.showLoading({ title: '提交中...', mask: true })
        await cancelCloudOrderWorkbench({ id: Number(detailState.data.id || 0) })
        uni.$u.toast('已取消')
        await loadDetail(Number(detailState.data.id || 0))
    } catch (error) {
        if (typeof error !== 'string') {
            uni.$u.toast('取消失败，请重试')
        }
    } finally {
        actionLoading.value = false
        uni.hideLoading()
    }
}

onLoad((options) => {
    const id = Number(options?.id || 0)
    if (!id) {
        uni.$u.toast('缺少订单ID')
        return
    }
    loadDetail(id)
})

const back = () => navigateDesktopBack()

const goInstanceDetail = () => {
    const instanceId = Number(detailState.data?.instance?.id || 0)
    if (!instanceId) {
        uni.$u.toast('暂无关联云电脑')
        return
    }
    uni.navigateTo({ url: `/pages/cloud/detail?id=${instanceId}` })
}
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

.card {
    margin: 28rpx;
    padding: 28rpx;
    border-radius: 28rpx;
    background: #fff;
    box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.05);
}

.card__title {
    font-size: 30rpx;
    color: #0f172a;
    font-weight: 900;
}

.card__title-row {
    display: flex;
    align-items: center;
    gap: 14rpx;
    flex-wrap: wrap;
}

.card__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20rpx;
}

.card__main {
    flex: 1;
    min-width: 0;
}

.card__link-btn {
    padding: 14rpx 24rpx;
    border-radius: 999rpx;
    background: #eff6ff;
    color: #2563eb;
    font-size: 20rpx;
    font-weight: 800;
    line-height: 1;
}

.card__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 12rpx;
}

.card__sub-title {
    font-size: 26rpx;
    color: #0f172a;
    font-weight: 900;
}

.card__status {
    display: inline-flex;
    margin-top: 12rpx;
    padding: 10rpx 18rpx;
    border-radius: 999rpx;
    font-size: 20rpx;
    font-weight: 800;
}

.card__status.is-approved {
    background: #eff6ff;
    color: #2563eb;
}

.card__status.is-pending {
    background: #fff7ed;
    color: #ea580c;
}

.card__status.is-completed {
    background: #ecfdf5;
    color: #059669;
}

.card__status.is-provisioning {
    background: #eef2ff;
    color: #4f46e5;
}

.card__status.is-rejected,
.card__status.is-failed {
    background: #fff1f2;
    color: #e11d48;
}

.row {
    display: flex;
    justify-content: space-between;
    gap: 24rpx;
    padding: 18rpx 0;
    border-bottom: 1rpx solid #f1f5f9;
    color: #334155;
    font-size: 22rpx;
}

.row:last-child {
    border-bottom: none;
}

.log-item {
    padding: 18rpx 0;
    border-bottom: 1rpx solid #f1f5f9;
}

.log-item:last-child {
    border-bottom: none;
}

.log-item__time {
    color: #94a3b8;
    font-size: 18rpx;
}

.log-item__text {
    margin-top: 8rpx;
    color: #334155;
    font-size: 22rpx;
    line-height: 1.6;
}

.action-btn {
    min-width: 132rpx;
    padding: 14rpx 22rpx;
    border-radius: 999rpx;
    text-align: center;
    font-size: 20rpx;
    font-weight: 800;
}

.action-btn.is-loading {
    opacity: 0.7;
    pointer-events: none;
}

.action-btn--primary {
    background: #2563eb;
    color: #fff;
}

.action-btn--danger {
    background: #fff1f2;
    color: #e11d48;
}

.action-btn--muted {
    background: #f1f5f9;
    color: #475569;
}
</style>
