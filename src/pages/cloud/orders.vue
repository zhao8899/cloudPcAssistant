<template>
    <view class="page" :class="{ 'page--desktop': isDesktop }">
        <view class="nav">
            <view class="nav__title">订单中心</view>
        </view>

        <view class="tabs">
            <view
                v-for="item in tabs"
                :key="item.value"
                class="tabs__item"
                :class="{ 'is-active': currentTab === item.value }"
                @click="changeTab(item.value)"
            >
                {{ item.label }}
            </view>
        </view>

        <view class="toolbar">
            <view class="toolbar__count">共 {{ workbenchState.lists.length }} 条订单</view>
            <view class="toolbar__toggle" @click="toggleSearch">
                {{ searchVisible ? '收起筛选' : '展开筛选' }}
            </view>
        </view>

        <view v-if="searchVisible" class="search-card">
            <view class="search-grid">
                <view class="search-field">
                    <view class="search-field__label">订单编号</view>
                    <input
                        v-model.trim="searchForm.order_no"
                        class="search-field__input"
                        placeholder="请输入订单编号"
                        confirm-type="search"
                        @confirm="handleSearch"
                    />
                </view>
                <view class="search-field">
                    <view class="search-field__label">桌面ID</view>
                    <input
                        v-model.trim="searchForm.desktop_id"
                        class="search-field__input"
                        placeholder="请输入桌面ID"
                        confirm-type="search"
                        @confirm="handleSearch"
                    />
                </view>
            </view>
            <view class="search-actions">
                <view class="search-btn search-btn--primary" @click="handleSearch">查询</view>
                <view class="search-btn search-btn--muted" @click="handleReset">重置</view>
            </view>
        </view>

        <view class="list" v-if="workbenchState.lists.length">
            <view v-for="order in workbenchState.lists" :key="order.id" class="order-card">
                <view class="order-card__head" @click="goDetail(order.id)">
                    <view class="order-card__main">
                        <view class="order-card__name">{{ order.flavor_name || '云实例订单' }}</view>
                        <view class="order-card__id">订单号：{{ order.order_no }}</view>
                    </view>
                    <view class="order-card__status-wrap">
                        <view class="order-card__status" :class="`is-${order.display_status}`">
                            {{ order.display_status_text }}
                        </view>
                        <view v-if="order.instance_badge_text" class="order-card__badge" :class="`is-${order.instance_badge_class}`">
                            {{ order.instance_badge_text }}
                        </view>
                    </view>
                </view>

                <view class="order-card__meta" @click="goDetail(order.id)">
                    <view>系统：{{ order.os_type || '-' }}</view>
                    <view>镜像：{{ order.image_name || '-' }}</view>
                    <view>时长：{{ order.duration_text || '-' }}</view>
                    <view v-if="order.is_renew_apply">原订单：{{ order.target_order_no || '-' }}</view>
                    <view v-if="order.is_renew_apply">续前到期：{{ order.before_expire_time_text || '-' }}</view>
                    <view v-if="order.is_renew_apply">续后到期：{{ order.after_expire_time_text || '-' }}</view>
                    <view>数量：{{ order.quantity || 1 }}台</view>
                    <view>带宽：{{ order.bandwidth_mbps || 0 }}M</view>
                    <view>创建：{{ order.create_time_text || '-' }}</view>
                    <view v-if="workbenchState.viewRole === 'agent'">提交人：{{ order.submit_user_name || '-' }}</view>
                    <view>来源：{{ order.order_source_text || '-' }}</view>
                    <view v-if="order.audit_remark">备注：{{ order.audit_remark }}</view>
                </view>

            </view>
        </view>

        <view v-else class="empty">暂无订单</view>

        <desktop-bottom-nav />
    </view>
</template>

<script setup lang="ts">
import DesktopBottomNav from '@/components/desktop-bottom-nav/desktop-bottom-nav.vue'
import { getCloudOrderWorkbench } from '@/api/cloud'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { isDesktopClient } from '@/utils/desktop'
import { computed, reactive, ref } from 'vue'

const currentTab = ref('all')
const userStore = useUserStore()
const bindingPromptShown = ref(false)
const isDesktop = isDesktopClient()

const tabs = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待审核' },
    { value: 'approved', label: '待开通' },
    { value: 'completed', label: '已开通' },
    { value: 'rejected', label: '已拒绝' }
]

const workbenchState = reactive({
    loading: false,
    viewRole: 'user',
    lists: [] as any[]
})
const searchVisible = ref(false)
const searchForm = reactive({
    order_no: '',
    desktop_id: ''
})
const isNeedBindAgent = computed(() => {
    const userInfo = userStore.userInfo || {}
    return Number(userInfo.is_agent || 0) !== 1
        && Number(userInfo.is_sub_agent || 0) !== 1
        && Number(userInfo.source_agent_user_id || 0) <= 0
})

const getLists = async () => {
    if (isNeedBindAgent.value) {
        workbenchState.lists = []
        return
    }

    workbenchState.loading = true
    try {
        const data = await getCloudOrderWorkbench({
            page_no: 1,
            page_size: 100,
            tab: currentTab.value,
            order_no: searchForm.order_no,
            desktop_id: searchForm.desktop_id
        })
        workbenchState.viewRole = data?.view_role || 'user'
        workbenchState.lists = data?.lists || []
    } catch (error) {
        if (typeof error !== 'string') {
            uni.$u.toast('加载订单失败')
        }
    } finally {
        workbenchState.loading = false
    }
}

const changeTab = (tab: string) => {
    if (currentTab.value === tab) return
    currentTab.value = tab
    getLists()
}

const handleSearch = () => {
    getLists()
}

const handleReset = () => {
    searchForm.order_no = ''
    searchForm.desktop_id = ''
    getLists()
}

const toggleSearch = () => {
    searchVisible.value = !searchVisible.value
}

const goDetail = (id: number | string) => {
    uni.navigateTo({ url: `/pages/cloud/order-detail?id=${id}` })
}

const promptBindAgent = async () => {
    if (bindingPromptShown.value || !isNeedBindAgent.value) {
        return
    }

    bindingPromptShown.value = true
    const modalRes = await uni.showModal({
        title: '请先绑定代理商',
        content: '当前账号尚未绑定代理商，绑定后才可查看和申请云业务订单。',
        confirmText: '去绑定',
        cancelText: '稍后再说'
    })

    if (modalRes.confirm) {
        uni.navigateTo({ url: '/pages/attribution/attribution?type=agent' })
    }
}

const handlePageShow = async () => {
    await userStore.getUser()
    if (isNeedBindAgent.value) {
        await promptBindAgent()
        return
    }
    bindingPromptShown.value = false
    getLists()
}

onShow(() => {
    handlePageShow()
})
</script>

<style scoped lang="scss">
.page {
    min-height: 100vh;
    background: #f8f9ff;
    padding-bottom: 150rpx;
}

.page--desktop {
    padding-bottom: 118rpx;
}

.nav {
    padding: 72rpx 28rpx 24rpx;
    background: linear-gradient(180deg, #eef3ff 0%, rgba(238, 243, 255, 0) 100%);
}

.nav__title {
    font-size: 40rpx;
    color: #0f172a;
    font-weight: 900;
}

.tabs {
    display: flex;
    gap: 16rpx;
    padding: 0 28rpx;
    flex-wrap: wrap;
}

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    margin: 20rpx 28rpx 0;
}

.toolbar__count {
    color: #64748b;
    font-size: 22rpx;
    font-weight: 700;
}

.toolbar__toggle {
    color: #2563eb;
    font-size: 22rpx;
    font-weight: 800;
}

.search-card {
    margin: 16rpx 28rpx 0;
    padding: 24rpx;
    border-radius: 28rpx;
    background: #fff;
    box-shadow: 0 16rpx 44rpx rgba(59, 130, 246, 0.08);
}

.search-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16rpx;
}

.search-field {
    min-width: 0;
}

.search-field__label {
    margin-bottom: 10rpx;
    color: #64748b;
    font-size: 20rpx;
    font-weight: 700;
}

.search-field__input {
    height: 76rpx;
    padding: 0 22rpx;
    border-radius: 20rpx;
    background: #f8fafc;
    color: #0f172a;
    font-size: 22rpx;
    border: 2rpx solid #e2e8f0;
    box-sizing: border-box;
}

.search-actions {
    display: flex;
    gap: 16rpx;
    margin-top: 18rpx;
}

.search-btn {
    flex: 1;
    height: 76rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 800;
}

.search-btn--primary {
    background: #2563eb;
    color: #fff;
}

.search-btn--muted {
    background: #f1f5f9;
    color: #475569;
}

.tabs__item {
    padding: 14rpx 24rpx;
    border-radius: 999rpx;
    background: #fff;
    color: #64748b;
    font-size: 22rpx;
    font-weight: 800;
}

.tabs__item.is-active {
    background: #2563eb;
    color: #fff;
}

.list {
    padding: 24rpx 28rpx 0;
}

.order-card {
    padding: 28rpx;
    margin-bottom: 20rpx;
    border-radius: 30rpx;
    background: #fff;
    box-shadow: 0 16rpx 44rpx rgba(59, 130, 246, 0.08);
}

.order-card__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20rpx;
}

.order-card__main {
    min-width: 0;
    flex: 1;
}

.order-card__name {
    font-size: 28rpx;
    color: #0f172a;
    font-weight: 900;
}

.order-card__id {
    margin-top: 8rpx;
    color: #94a3b8;
    font-size: 18rpx;
}

.order-card__status-wrap {
    display: flex;
    align-items: center;
    gap: 10rpx;
    flex-shrink: 0;
}

.order-card__badge {
    padding: 6rpx 16rpx;
    border-radius: 999rpx;
    font-size: 18rpx;
    font-weight: 900;
    line-height: 1.4;
}

.order-card__badge.is-deleted {
    background: #f1f5f9;
    color: #64748b;
}

.order-card__badge.is-expired {
    background: #fee2e2;
    color: #dc2626;
}

.order-card__badge.is-expiring {
    background: #fef3c7;
    color: #d97706;
}

.order-card__status {
    padding: 12rpx 18rpx;
    border-radius: 999rpx;
    font-size: 18rpx;
    font-weight: 900;
}

.order-card__status.is-approved {
    background: #eff6ff;
    color: #2563eb;
}

.order-card__status.is-pending {
    background: #fff7ed;
    color: #ea580c;
}

.order-card__status.is-completed {
    background: #ecfdf5;
    color: #059669;
}

.order-card__status.is-provisioning {
    background: #eef2ff;
    color: #4f46e5;
}

.order-card__status.is-rejected,
.order-card__status.is-failed {
    background: #fff1f2;
    color: #e11d48;
}

.order-card__meta {
    margin-top: 20rpx;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12rpx;
    color: #475569;
    font-size: 20rpx;
}

.empty {
    padding: 120rpx 40rpx;
    text-align: center;
    color: #94a3b8;
    font-size: 24rpx;
}

@media (max-width: 680rpx) {
    .search-grid {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
