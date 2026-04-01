<template>
    <view class="page">
        <view class="nav">
            <view class="nav__back" @click="back">←</view>
            <view class="nav__title">云电脑详情</view>
        </view>

        <view v-if="pageState.loading" class="loading-card">
            <view class="loading-card__text">详情加载中...</view>
        </view>

        <template v-else-if="detailState.data.id">
            <view class="hero">
                <view class="hero__head">
                    <view class="hero__main">
                        <view class="hero__name">{{ detailState.data.resource_name || detailState.data.desktop_oid || detailState.data.cloud_resource_id || '云电脑实例' }}</view>
                        <view class="hero__id">桌面ID：{{ detailState.data.desktop_oid || '-' }}</view>
                    </view>
                    <view class="hero__tags">
                        <view class="hero__tag" :class="statusClass">{{ statusText }}</view>
                        <view class="hero__tag hero__tag--sub" :class="provisionClass">{{ provisionText }}</view>
                    </view>
                </view>

                <view class="hero__spec">
                    {{ Number(detailState.data.bandwidth_mbps || 0) > 0 ? `${detailState.data.flavor_name || '-'} / ${detailState.data.os_type || '-'} / ${detailState.data.bandwidth_mbps}M` : `${detailState.data.flavor_name || '-'} / ${detailState.data.os_type || '-'}`
                    }}
                </view>

                <view class="action-row">
                    <view v-if="detailState.data.can_renew" class="action-btn action-btn--primary" @click="goRenew">续期</view>
                    <view
                        v-if="canStart"
                        class="action-btn"
                        :class="{ 'is-disabled': actionState.loading }"
                        @click="handleInstanceAction('start')"
                    >
                        开机
                    </view>
                    <view
                        v-if="canStop"
                        class="action-btn"
                        :class="{ 'is-disabled': actionState.loading }"
                        @click="handleInstanceAction('stop')"
                    >
                        关机
                    </view>
                    <view
                        v-if="canReboot"
                        class="action-btn"
                        :class="{ 'is-disabled': actionState.loading }"
                        @click="handleInstanceAction('reboot')"
                    >
                        重启
                    </view>
                    <view v-if="canRename" class="action-btn" @click="goRename">改名</view>
                    <view class="action-btn" @click="goOrders">订单</view>
                    <view
                        v-if="canDelete"
                        class="action-btn action-btn--danger"
                        :class="{ 'is-disabled': actionState.loading }"
                        @click="handleDelete"
                    >
                        删除
                    </view>
                </view>
            </view>

            <view class="panel">
                <view class="section-title">基础信息</view>
                <view class="info-row"><text>订单号</text><text>{{ detailState.data.order_no || '-' }}</text></view>
                <view class="info-row"><text>规格名称</text><text>{{ detailState.data.flavor_name || '-' }}</text></view>
                <view class="info-row"><text>CPU / 内存</text><text>{{ detailState.data.cpu || '-' }}C / {{ detailState.data.memory_gb || '-' }}G</text></view>
                <view class="info-row"><text>镜像名称</text><text>{{ detailState.data.image_name || '-' }}</text></view>
                <view class="info-row"><text>操作系统</text><text>{{ detailState.data.os_type || '-' }}</text></view>
                <view class="info-row"><text>磁盘类型</text><text>{{ detailState.data.disk_type || '-' }}</text></view>
                <view class="info-row"><text>GPU</text><text>{{ detailState.data.gpu_desc || '-' }}</text></view>
                <view class="info-row"><text>带宽</text><text>{{ detailState.data.bandwidth_mbps || '-' }}M</text></view>
                <view class="info-row"><text>系统盘</text><text>{{ detailState.data.system_disk_gb || '-' }}GB</text></view>
                <view v-if="detailState.data.is_agent_view" class="info-row"><text>资源包</text><text>{{ detailState.data.resource_pack_name || '-' }}</text></view>
                <view v-if="detailState.data.is_agent_view" class="info-row"><text>资源包OID</text><text>{{ detailState.data.resource_pack_oid || '-' }}</text></view>
                <view v-if="detailState.data.is_agent_view" class="info-row"><text>资源包地域</text><text>{{ detailState.data.resource_pack_region || '-' }}</text></view>
            </view>

            <view class="panel">
                <view class="section-title">实例信息</view>
                <view class="info-row"><text>桌面ID</text><text>{{ detailState.data.desktop_oid || detailState.data.cloud_resource_id || '-' }}</text></view>
                <view class="info-row"><text>产品实例ID</text><text>{{ detailState.data.prod_inst_id || '-' }}</text></view>
                <view class="info-row"><text>操作ID</text><text>{{ detailState.data.operation_id || '-' }}</text></view>
                <view v-if="detailState.data.is_agent_view" class="info-row"><text>云账户</text><text>{{ detailState.data.cloud_account_name || '-' }}</text></view>
                <view v-if="detailState.data.is_agent_view" class="info-row"><text>云账户ID</text><text>{{ detailState.data.cloud_account_id || '-' }}</text></view>
                <view v-if="detailState.data.is_agent_view" class="info-row"><text>地域ID</text><text>{{ detailState.data.region_id || '-' }}</text></view>
                <view class="info-row"><text>到期时间</text><text>{{ detailState.data.expired_at_text || '-' }}</text></view>
                <view class="info-row"><text>创建时间</text><text>{{ detailState.data.create_time || '-' }}</text></view>
                <view class="info-row"><text>运行状态</text><text>{{ statusText }}</text></view>
                <view class="info-row"><text>开通状态</text><text>{{ provisionText }}</text></view>
            </view>

            <view class="panel">
                <view class="section-title">账号信息</view>
                <view class="info-row"><text>邮箱</text><text>{{ detailState.data.user_email || '-' }}</text></view>
                <view class="info-row"><text>手机号</text><text>{{ detailState.data.user_mobile || '-' }}</text></view>
                <view class="info-row">
                    <text>天翼账号</text>
                    <view class="copy-value">
                        <text>{{ detailState.data.pub_user_account || '-' }}</text>
                        <view v-if="detailState.data.pub_user_account" class="copy-btn" @click.stop="copyText(detailState.data.pub_user_account, '账号已复制')">复制</view>
                    </view>
                </view>
                <view class="info-row">
                    <text>初始密码</text>
                    <view class="copy-value">
                        <text>{{ detailState.data.pub_user_password || '-' }}</text>
                        <view v-if="detailState.data.pub_user_password" class="copy-btn" @click.stop="copyText(detailState.data.pub_user_password, '密码已复制')">复制</view>
                    </view>
                </view>
            </view>
        </template>

        <view v-else class="loading-card">
            <view class="loading-card__text">暂无详情数据</view>
        </view>
        <desktop-bottom-nav />
    </view>
</template>

<script setup lang="ts">
import DesktopBottomNav from '@/components/desktop-bottom-nav/desktop-bottom-nav.vue'
import { deleteCloudInstance, getCloudInstanceDetail, rebootCloudInstance, startCloudInstance, stopCloudInstance } from '@/api/cloud'
import { useUserStore } from '@/stores/user'
import { navigateDesktopBack } from '@/utils/desktop'
import { onLoad } from '@dcloudio/uni-app'
import { computed, reactive } from 'vue'

const userStore = useUserStore()
const pageState = reactive({
    loading: false
})
const detailState = reactive({
    data: {} as any
})
const actionState = reactive({
    loading: false
})

const statusTextMap: Record<string, string> = {
    creating: '创建中',
    stopped: '已关机',
    starting: '启动中',
    running: '运行中',
    rebooting: '重启中',
    rebuilding: '重装中',
    stopping: '关闭中',
    deleting: '删除中',
    error: '异常',
    rolling_back: '回滚中',
    resizing: '变更中',
    evacuating: '迁移中',
    rescuing: '救援中',
    backing_up: '备份中',
    deleting_backup: '删除备份中',
    regaining: '恢复中',
    hibernating: '休眠中',
    hibernated: '已休眠',
    waking_up: '唤醒中',
    expired: '已到期锁定',
    deleted: '已删除'
}

const statusClassMap: Record<string, string> = {
    running: 'is-running',
    stopped: 'is-warning',
    creating: 'is-pending',
    starting: 'is-pending',
    rebooting: 'is-pending',
    rebuilding: 'is-pending',
    stopping: 'is-warning',
    deleting: 'is-failed',
    error: 'is-failed',
    rolling_back: 'is-pending',
    resizing: 'is-pending',
    evacuating: 'is-pending',
    rescuing: 'is-warning',
    backing_up: 'is-pending',
    deleting_backup: 'is-warning',
    regaining: 'is-pending',
    hibernating: 'is-warning',
    hibernated: 'is-warning',
    waking_up: 'is-pending',
    expired: 'is-warning',
    deleted: 'is-plain'
}

const loadDetail = async (id: number) => {
    pageState.loading = true
    try {
        detailState.data = (await getCloudInstanceDetail({ id })) || {}
    } catch (error) {
        if (typeof error !== 'string') {
            uni.$u.toast('加载详情失败')
        }
    } finally {
        pageState.loading = false
    }
}

const statusText = computed(() => {
    const status = String(detailState.data.status || '')
    return statusTextMap[status] || status || '未知'
})

const statusClass = computed(() => {
    const status = String(detailState.data.status || '')
    return statusClassMap[status] || 'is-plain'
})

const provisionText = computed(() => {
    const status = String(detailState.data.provision_status || '')
    if (status === 'succeeded') return '已开通'
    if (status === 'pending') return '开通中'
    if (status === 'failed') return '开通失败'
    return status || '待同步'
})

const provisionClass = computed(() => {
    const status = String(detailState.data.provision_status || '')
    if (status === 'succeeded') return 'is-success'
    if (status === 'pending') return 'is-pending'
    if (status === 'failed') return 'is-failed'
    return 'is-plain'
})
const canStart = computed(() => {
    const status = String(detailState.data.status || '')
    return status === 'stopped'
})
const canStop = computed(() => {
    const status = String(detailState.data.status || '')
    return status === 'running'
})
const canReboot = computed(() => {
    const status = String(detailState.data.status || '')
    return status === 'running'
})
const canRename = computed(() => {
    const status = String(detailState.data.status || '')
    return ['running', 'stopped'].includes(status)
})
const canDelete = computed(() => {
    const userInfo = userStore.userInfo || {}
    const isSubAgent = Number(userInfo.is_sub_agent || 0) === 1
    const status = String(detailState.data.status || '')
    return !isSubAgent && ['running', 'stopped'].includes(status)
})

const back = () => navigateDesktopBack()

const goRenew = () => {
    uni.navigateTo({ url: `/pages/cloud/renew?id=${detailState.data.id}` })
}

const goRename = () => {
    uni.navigateTo({ url: `/pages/cloud/rename?id=${detailState.data.id}` })
}

const goOrders = () => {
    const orderId = Number(detailState.data.order_id || 0)
    if (orderId > 0) {
        uni.navigateTo({ url: `/pages/cloud/order-detail?id=${orderId}` })
        return
    }
    uni.navigateTo({ url: '/pages/cloud/orders' })
}

const handleInstanceAction = async (action: 'start' | 'stop' | 'reboot') => {
    if (actionState.loading) return

    const id = Number(detailState.data.id || 0)
    if (!id) {
        uni.$u.toast('缺少实例ID')
        return
    }

    const actionTextMap = {
        start: '开机',
        stop: '关机',
        reboot: '重启'
    }
    const actionText = actionTextMap[action]
    const modalRes = await uni.showModal({
        title: `确认${actionText}`,
        content: `是否确认对当前云电脑执行${actionText}？`,
        confirmText: '确认',
        cancelText: '取消'
    })
    if (!modalRes.confirm) return

    actionState.loading = true
    uni.showLoading({
        title: `${actionText}中...`,
        mask: true
    })
    try {
        if (action === 'start') {
            await startCloudInstance({ instance_id: id })
        } else if (action === 'stop') {
            await stopCloudInstance({ instance_id: id })
        } else {
            await rebootCloudInstance({ instance_id: id })
        }
        uni.$u.toast(`${actionText}指令已提交`)
        await loadDetail(id)
    } catch (error) {
        if (typeof error !== 'string') {
            uni.$u.toast(`${actionText}失败`)
        }
    } finally {
        uni.hideLoading()
        actionState.loading = false
    }
}

const handleDelete = async () => {
    if (actionState.loading || !canDelete.value) return

    const id = Number(detailState.data.id || 0)
    if (!id) {
        uni.$u.toast('缺少实例ID')
        return
    }

    // Set loading before the modal to prevent duplicate taps during the confirmation dialog
    actionState.loading = true
    const targetName =
        detailState.data.resource_name || detailState.data.cloud_resource_id || detailState.data.desktop_oid || id
    const modalRes = await uni.showModal({
        title: '确认删除',
        content: `确定要删除云电脑【${targetName}】吗？此操作会调用云端删除接口。`,
        confirmText: '确定',
        cancelText: '取消'
    })
    if (!modalRes.confirm) {
        actionState.loading = false
        return
    }
    uni.showLoading({
        title: '删除中...',
        mask: true
    })
    try {
        await deleteCloudInstance({ instance_id: id })
        uni.$u.toast('删除指令已提交')
        setTimeout(() => {
            navigateDesktopBack()
        }, 500)
    } catch (error) {
        if (typeof error !== 'string') {
            uni.$u.toast('删除失败')
        }
    } finally {
        uni.hideLoading()
        actionState.loading = false
    }
}

onLoad((options) => {
    const id = Number(options?.id || 0)
    if (!id) {
        uni.$u.toast('缺少实例ID')
        return
    }
    loadDetail(id)
})

const copyText = (value: string, message = '已复制') => {
    uni.setClipboardData({
        data: String(value || ''),
        success: () => uni.$u.toast(message)
    })
}
</script>

<style scoped lang="scss">
.page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--md-background);
}

.nav {
    display: flex;
    align-items: center;
    height: 56px;
    padding: 0 16px;
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
}

.nav__title {
    flex: 1;
    text-align: center;
    margin-right: 40px;
    font-size: 20px;
    font-weight: 500;
    color: var(--md-primary);
}

.loading-card {
    margin: 14px;
    padding: 48px 16px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    box-shadow: var(--md-elevation-1);
}

.loading-card__text {
    text-align: center;
    color: var(--md-on-surface-variant);
    font-size: 14px;
}

/* Hero — MD3 Filled Card */
.hero {
    margin: 14px 14px 0;
    padding: 16px;
    border-radius: var(--md-radius-md);
    background: var(--md-primary-container);
    color: var(--md-on-primary-container);
}

.hero__head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
}

.hero__main { flex: 1; min-width: 0; }

.hero__name {
    font-size: 18px;
    font-weight: 600;
    color: var(--md-on-primary-container);
}

.hero__id {
    margin-top: 4px;
    font-size: 12px;
    color: var(--md-on-primary-container);
    opacity: 0.78;
    word-break: break-all;
}

.hero__tags {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.hero__tag {
    padding: 3px 10px;
    border-radius: var(--md-radius-full);
    font-size: 11px;
    font-weight: 500;
    background: var(--md-secondary-container);
    color: var(--md-on-secondary-container);
}

.hero__tag.is-running  { background: var(--status-running-bg);  color: var(--status-running-fg); }
.hero__tag.is-pending  { background: var(--status-warning-bg);  color: var(--status-warning-fg); }
.hero__tag.is-warning  { background: var(--status-warning-bg);  color: var(--status-warning-fg); }
.hero__tag.is-failed   { background: var(--status-expired-bg);  color: var(--status-expired-fg); }
.hero__tag.is-success  { background: var(--status-running-bg);  color: var(--status-running-fg); }
.hero__tag.is-plain    { background: var(--status-stopped-bg);  color: var(--status-stopped-fg); }

.hero__spec {
    margin-top: 10px;
    padding: 8px 12px;
    border-radius: var(--md-radius-sm);
    background: rgba(255, 255, 255, 0.35);
    font-size: 13px;
    font-weight: 500;
    color: var(--md-on-primary-container);
}

.action-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
}

.action-btn {
    flex: 1 1 72px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--md-radius-full);
    background: var(--md-surface);
    color: var(--md-primary);
    border: 1px solid var(--md-outline-variant);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    &:active { background: var(--md-surface-variant); }
}

.action-btn.is-disabled { opacity: 0.38; pointer-events: none; }

.action-btn--primary {
    background: var(--md-primary);
    color: var(--md-on-primary);
    border-color: transparent;
    &:active { opacity: 0.88; }
}

.action-btn--danger {
    background: var(--md-error-container);
    color: var(--md-error);
    border-color: transparent;
}

/* Info panels — MD3 Elevated Card */
.panel {
    margin: 10px 14px 0;
    padding: 16px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    box-shadow: var(--md-elevation-1);
    &:last-of-type { margin-bottom: 14px; }
}

.section-title {
    margin-bottom: 8px;
    font-size: 15px;
    font-weight: 600;
    color: var(--md-on-surface);
}

.info-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 0;
    border-bottom: 1px solid var(--md-outline-variant);
    font-size: 13px;
    color: var(--md-on-surface);

    &:last-child { border-bottom: none; }

    text:first-child {
        color: var(--md-on-surface-variant);
        white-space: nowrap;
        flex-shrink: 0;
    }

    text:last-child {
        text-align: right;
        word-break: break-all;
    }
}

.copy-value {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    text-align: right;
    word-break: break-all;
    min-width: 0;
}

.copy-btn {
    flex-shrink: 0;
    padding: 3px 10px;
    border-radius: var(--md-radius-full);
    background: var(--md-primary-container);
    color: var(--md-primary);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
}
</style>
