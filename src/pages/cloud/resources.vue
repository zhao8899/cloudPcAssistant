<template>
    <view class="page">
        <view class="nav">
            <view class="nav__back" @click="back">←</view>
            <view class="nav__title">云资源</view>
        </view>

        <view class="body">
            <view class="chips">
                <view
                    v-for="item in chips"
                    :key="item.value"
                    class="chips__item"
                    :class="{ 'is-active': activeChip === item.value }"
                    @click="activeChip = item.value"
                >
                    {{ item.label }}
                </view>
            </view>

            <view class="toolbar">
                <view class="toolbar__count">共 {{ filteredResources.length }} 台实例</view>
                <view class="toolbar__toggle" @click="toggleSearch">
                    {{ searchVisible ? '收起筛选' : '展开筛选' }}
                </view>
            </view>

            <view v-if="searchVisible" class="search-card">
                <view class="search-grid">
                    <view class="search-field">
                        <view class="search-field__label">实例ID / 桌面ID</view>
                        <input
                            v-model.trim="searchForm.resourceKeyword"
                            class="search-field__input"
                            placeholder="请输入实例ID或桌面ID"
                            confirm-type="search"
                        />
                    </view>
                    <view class="search-field">
                        <view class="search-field__label">订单ID</view>
                        <input
                            v-model.trim="searchForm.orderId"
                            class="search-field__input"
                            placeholder="请输入订单ID"
                            confirm-type="search"
                        />
                    </view>
                    <view class="search-field search-field--full">
                        <view class="search-field__label">电脑昵称</view>
                        <input
                            v-model.trim="searchForm.resourceName"
                            class="search-field__input"
                            placeholder="请输入电脑昵称"
                            confirm-type="search"
                        />
                    </view>
                </view>
                <view class="search-actions">
                    <view class="search-btn search-btn--primary" @click="applySearch">查询</view>
                    <view class="search-btn search-btn--muted" @click="resetSearch">重置</view>
                </view>
            </view>

            <view v-if="!filteredResources.length" class="empty-card">
                <view class="empty-card__title">暂无云实例</view>
                <view class="empty-card__text">当前没有可展示的云实例资源</view>
            </view>

            <view v-for="item in filteredResources" :key="item.id" class="resource-card" @click="goDetail(item.id)">
                <view class="resource-card__head">
                    <view class="resource-card__main">
                        <view class="resource-card__name">{{ item.resource_name || item.desktop_oid || item.cloud_resource_id || '云电脑实例' }}</view>
                        <view class="resource-card__ids">
                            <view>桌面：{{ item.desktop_oid || '-' }}</view>
                            <view>实例：{{ item.prod_inst_id || item.cloud_resource_id || '-' }}</view>
                        </view>
                    </view>
                    <view class="resource-card__status-group">
                        <view class="status-pill" :class="item.statusClass">{{ item.statusText }}</view>
                        <view class="status-pill status-pill--sub" :class="item.provisionClass">{{ item.provisionText }}</view>
                    </view>
                </view>

                <view v-if="item.cloudDeleteText" class="resource-card__alert">{{ item.cloudDeleteText }}</view>

                <view class="resource-card__spec">
                    <view class="resource-card__spec-main">{{ item.specText }}</view>
                    <view class="resource-card__spec-sub">
                        <text v-if="item.flavor_name">{{ item.flavor_name }}</text>
                        <text v-if="item.flavor_name && item.disk_type"> · </text>
                        <text v-if="item.disk_type">磁盘 {{ item.disk_type }}</text>
                    </view>
                </view>

                <view class="resource-card__foot">
                    <view class="resource-card__foot-text" :class="{ 'is-expired': item.isExpired }">
                        到期时间：{{ item.expired_at_text || '-' }}
                    </view>
                    <view class="resource-card__cta">></view>
                </view>
            </view>
        </view>
        <desktop-bottom-nav />
    </view>
</template>

<script setup lang="ts">
import DesktopBottomNav from '@/components/desktop-bottom-nav/desktop-bottom-nav.vue'
import { getCloudResourcePackLists } from '@/api/cloud'
import { navigateDesktopBack } from '@/utils/desktop'
import { onShow } from '@dcloudio/uni-app'
import { computed, reactive, ref } from 'vue'

const activeChip = ref<'all' | 'running' | 'creating' | 'expired'>('all')
const resourceList = ref<any[]>([])
const searchVisible = ref(false)
const searchVersion = ref(0)
const searchForm = reactive({
    resourceKeyword: '',
    orderId: '',
    resourceName: ''
})

const chips: Array<{ value: 'all' | 'running' | 'creating' | 'expired'; label: string }> = [
    { value: 'all', label: '全部' },
    { value: 'running', label: '运行中' },
    { value: 'creating', label: '开通中' },
    { value: 'expired', label: '已过期' }
]

const normalizeRunStatus = (status: string) => {
    if (status === 'running') return { text: '运行中', className: 'is-running' }
    if (status === 'stopped') return { text: '已关机', className: 'is-stopped' }
    if (status === 'creating') return { text: '创建中', className: 'is-creating' }
    if (status === 'expired') return { text: '已过期', className: 'is-expired' }
    if (status === 'error') return { text: '异常', className: 'is-expired' }
    return { text: status || '未知', className: 'is-stopped' }
}

const normalizeProvisionStatus = (status: string) => {
    if (status === 'succeeded') return { text: '已开通', className: 'is-success' }
    if (status === 'pending') return { text: '开通中', className: 'is-pending' }
    if (status === 'failed') return { text: '开通失败', className: 'is-failed' }
    return { text: status || '待同步', className: 'is-plain' }
}

const loadResources = async () => {
    try {
        const res = await getCloudResourcePackLists({ page_no: 1, page_size: 100 })
        const packs = res?.lists || []
        const flatList: any[] = []
        const now = Date.now() / 1000

        packs.forEach((pack: any) => {
            ;(pack.instances || []).forEach((instance: any) => {
                const runStatus = normalizeRunStatus(String(instance.status || ''))
                const provisionStatus = normalizeProvisionStatus(String(instance.provision_status || ''))
                const expiredAt = Number(instance.expired_at || 0)
                flatList.push({
                    ...instance,
                    statusText: runStatus.text,
                    statusClass: runStatus.className,
                    provisionText: provisionStatus.text,
                    provisionClass: provisionStatus.className,
                    cloudDeleteText: Number(instance.cloud_delete_status || 0) === 1 ? '天翼已删除' : '',
                    specText: `${Number(instance.cpu || 0)}C / ${Number(instance.memory_gb || 0)}G / ${instance.os_type || '-'} / ${Number(instance.bandwidth_mbps || 0)}M`,
                    isExpired: expiredAt > 0 && expiredAt <= now
                })
            })
        })

        resourceList.value = flatList
    } catch (error) {
        if (typeof error !== 'string') {
            uni.$u.toast('加载资源失败')
        }
    }
}

const filteredResources = computed(() => {
    searchVersion.value

    let lists = [...resourceList.value]
    if (activeChip.value === 'running') {
        lists = lists.filter((item) => item.status === 'running')
    } else if (activeChip.value === 'creating') {
        lists = lists.filter((item) => item.provision_status === 'pending' || item.status === 'creating')
    } else if (activeChip.value === 'expired') {
        lists = lists.filter((item) => item.isExpired || item.status === 'expired')
    }

    const resourceKeyword = searchForm.resourceKeyword.trim().toLowerCase()
    const orderId = searchForm.orderId.trim()
    const resourceName = searchForm.resourceName.trim().toLowerCase()

    if (resourceKeyword) {
        lists = lists.filter((item) => {
            const haystack = [
                item.desktop_oid,
                item.prod_inst_id,
                item.cloud_resource_id
            ]
                .map((value) => String(value || '').toLowerCase())
                .join(' ')
            return haystack.includes(resourceKeyword)
        })
    }

    if (orderId) {
        lists = lists.filter((item) => String(item.order_id || '').includes(orderId))
    }

    if (resourceName) {
        lists = lists.filter((item) => String(item.resource_name || '').toLowerCase().includes(resourceName))
    }

    return lists
})

const goDetail = (id: number) => {
    uni.navigateTo({ url: `/pages/cloud/detail?id=${id}` })
}

const toggleSearch = () => {
    searchVisible.value = !searchVisible.value
}

const applySearch = () => {
    searchVersion.value++
}

const resetSearch = () => {
    searchForm.resourceKeyword = ''
    searchForm.orderId = ''
    searchForm.resourceName = ''
    searchVersion.value++
}

const back = () => navigateDesktopBack()

onShow(() => {
    loadResources()
})
</script>

<style scoped lang="scss">
.page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--md-background);
}

.nav {
    position: sticky;
    top: 0;
    z-index: 10;
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

.nav__title {
    flex: 1;
    text-align: center;
    margin-right: 40px;
    font-size: 20px;
    font-weight: 500;
    color: var(--md-primary);
}

.body {
    flex: 1;
    padding: 14px;
    overflow-y: auto;
}

.chips {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    margin-bottom: 12px;
}

.chips__item {
    white-space: nowrap;
    padding: 6px 16px;
    border-radius: var(--md-radius-full);
    background: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    color: var(--md-on-surface-variant);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    &:active { background: var(--md-surface-variant); }
}

.chips__item.is-active {
    background: var(--md-primary-container);
    border-color: transparent;
    color: var(--md-on-primary-container);
    font-weight: 700;
}

.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.toolbar__count {
    color: var(--md-on-surface-variant);
    font-size: 13px;
    font-weight: 500;
}

.toolbar__toggle {
    padding: 5px 14px;
    border-radius: var(--md-radius-full);
    background: var(--md-secondary-container);
    color: var(--md-on-secondary-container);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
}

.search-card {
    margin-bottom: 12px;
    padding: var(--md-space-lg);
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    box-shadow: var(--md-elevation-1);
}

.search-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.search-field { min-width: 0; }
.search-field--full { grid-column: 1 / -1; }

.search-field__label {
    margin-bottom: 6px;
    color: var(--md-on-surface-variant);
    font-size: 12px;
    font-weight: 500;
}

.search-field__input {
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border-radius: var(--md-radius-sm);
    background: var(--md-surface-variant);
    border: 1px solid transparent;
    box-sizing: border-box;
    color: var(--md-on-surface);
    font-size: 13px;
    &:focus { border-color: var(--md-primary); outline: none; }
}

.search-actions {
    display: flex;
    gap: 10px;
    margin-top: 12px;
}

.search-btn {
    flex: 1;
    height: 40px;
    border-radius: var(--md-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
}

.search-btn--primary {
    background: var(--md-primary);
    color: var(--md-on-primary);
    &:active { opacity: 0.88; }
}

.search-btn--muted {
    background: var(--md-surface-variant);
    color: var(--md-on-surface-variant);
    &:active { opacity: 0.88; }
}

.empty-card {
    padding: 40px 16px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    text-align: center;
    box-shadow: var(--md-elevation-1);
}

.empty-card__title {
    color: var(--md-on-surface);
    font-size: 16px;
    font-weight: 500;
}

.empty-card__text {
    margin-top: 6px;
    color: var(--md-on-surface-variant);
    font-size: 13px;
}

.resource-card {
    margin-bottom: 10px;
    padding: 14px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    cursor: pointer;
    &:active { box-shadow: var(--md-elevation-1); background: var(--md-surface-variant); }
}

.resource-card__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.resource-card__main {
    flex: 1;
    min-width: 0;
}

.resource-card__name {
    color: var(--md-on-surface);
    font-size: 15px;
    font-weight: 500;
}

.resource-card__ids {
    margin-top: 4px;
    color: var(--md-on-surface-variant);
    font-size: 12px;
    line-height: 1.5;
    word-break: break-all;
}

.resource-card__status-group {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.status-pill {
    padding: 3px 10px;
    border-radius: var(--md-radius-full);
    font-size: 11px;
    font-weight: 500;
    background: var(--md-secondary-container);
    color: var(--md-on-secondary-container);
}

.status-pill.is-running  { background: var(--status-running-bg);  color: var(--status-running-fg); }
.status-pill.is-stopped  { background: var(--status-stopped-bg);  color: var(--status-stopped-fg); }
.status-pill.is-creating,
.status-pill.is-pending  { background: var(--status-warning-bg);  color: var(--status-warning-fg); }
.status-pill.is-expired,
.status-pill.is-failed   { background: var(--status-expired-bg);  color: var(--status-expired-fg); }
.status-pill.is-success  { background: var(--status-running-bg);  color: var(--status-running-fg); }
.status-pill--sub.is-plain { background: var(--md-surface-variant); color: var(--md-on-surface-variant); }

.resource-card__alert {
    margin-top: 8px;
    padding: 6px 10px;
    border-radius: var(--md-radius-xs);
    background: var(--md-error-container);
    color: var(--md-error);
    font-size: 12px;
    font-weight: 500;
}

.resource-card__spec {
    margin-top: 8px;
    padding: 8px 10px;
    border-radius: var(--md-radius-sm);
    background: var(--md-background);
}

.resource-card__spec-main {
    color: var(--md-on-surface);
    font-size: 13px;
    font-weight: 500;
}

.resource-card__spec-sub {
    margin-top: 2px;
    color: var(--md-on-surface-variant);
    font-size: 12px;
    line-height: 1.5;
}

.resource-card__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--md-outline-variant);
}

.resource-card__foot-text {
    color: var(--md-on-surface-variant);
    font-size: 12px;
    font-weight: 500;
}

.resource-card__foot-text.is-expired { color: var(--md-error); }

.resource-card__cta {
    color: var(--md-primary);
    font-size: 16px;
    font-weight: 600;
}

@media (max-width: 360px) {
    .search-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
