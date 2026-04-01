<template>
    <view class="page" :class="{ 'page--desktop': isDesktop }">
        <view class="nav">
            <view class="nav__back" @click="navigateDesktopBack()">←</view>
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
import { isDesktopClient, navigateDesktopBack } from '@/utils/desktop'
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
    background: var(--md-background);
    display: flex;
    flex-direction: column;
}

.nav {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 56px;
    padding: 0 4px 0 8px;
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

.nav__title {
    font-size: 20px;
    color: var(--md-on-surface);
    font-weight: 500;
}

.tabs {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    flex-wrap: wrap;
    background: var(--md-surface);
    border-bottom: 1px solid var(--md-outline-variant);
}

.tabs__item {
    padding: 6px 16px;
    border-radius: var(--md-radius-full);
    background: var(--md-surface-variant);
    color: var(--md-on-surface-variant);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
}

.tabs__item.is-active {
    background: var(--md-primary-container);
    color: var(--md-primary);
}

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px 0;
}

.toolbar__count {
    color: var(--md-on-surface-variant);
    font-size: 12px;
}

.toolbar__toggle {
    color: var(--md-primary);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
}

.search-card {
    margin: 8px 14px 0;
    padding: 14px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
}

.search-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.search-field {
    min-width: 0;
}

.search-field__label {
    margin-bottom: 4px;
    color: var(--md-on-surface-variant);
    font-size: 11px;
}

.search-field__input {
    height: 36px;
    padding: 0 10px;
    border-radius: var(--md-radius-sm);
    background: var(--md-background);
    color: var(--md-on-surface);
    font-size: 13px;
    border: 1px solid var(--md-outline-variant);
    box-sizing: border-box;
    width: 100%;
}

.search-actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
}

.search-btn {
    flex: 1;
    height: 36px;
    border-radius: var(--md-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
}

.search-btn--primary {
    background: var(--md-primary);
    color: var(--md-on-primary);
}

.search-btn--muted {
    background: var(--md-surface-variant);
    color: var(--md-on-surface-variant);
}

.list {
    padding: 12px 14px 0;
    flex: 1;
}

.order-card {
    padding: 14px;
    margin-bottom: 10px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    cursor: pointer;
}

.order-card__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}

.order-card__main {
    min-width: 0;
    flex: 1;
}

.order-card__name {
    font-size: 15px;
    color: var(--md-on-surface);
    font-weight: 500;
}

.order-card__id {
    margin-top: 4px;
    color: var(--md-on-surface-variant);
    font-size: 11px;
}

.order-card__status-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}

.order-card__badge {
    padding: 3px 8px;
    border-radius: var(--md-radius-full);
    font-size: 11px;
    font-weight: 500;
    line-height: 1.4;
}

.order-card__badge.is-deleted {
    background: var(--status-stopped-bg);
    color: var(--status-stopped-fg);
}

.order-card__badge.is-expired {
    background: var(--status-expired-bg);
    color: var(--status-expired-fg);
}

.order-card__badge.is-expiring {
    background: var(--status-warning-bg);
    color: var(--status-warning-fg);
}

.order-card__status {
    padding: 4px 10px;
    border-radius: var(--md-radius-full);
    font-size: 11px;
    font-weight: 500;
}

.order-card__status.is-approved {
    background: var(--status-running-bg);
    color: var(--status-running-fg);
}

.order-card__status.is-pending {
    background: var(--status-warning-bg);
    color: var(--status-warning-fg);
}

.order-card__status.is-completed {
    background: rgba(5, 150, 105, 0.12);
    color: #059669;
}

.order-card__status.is-provisioning {
    background: var(--md-primary-container);
    color: var(--md-primary);
}

.order-card__status.is-rejected,
.order-card__status.is-failed {
    background: var(--status-expired-bg);
    color: var(--status-expired-fg);
}

.order-card__meta {
    margin-top: 10px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    color: var(--md-on-surface-variant);
    font-size: 12px;
}

.empty {
    padding: 60px 20px;
    text-align: center;
    color: var(--md-on-surface-variant);
    font-size: 14px;
}
</style>
