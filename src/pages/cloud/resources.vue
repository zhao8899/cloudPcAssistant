<template>
    <view class="page">
        <view class="nav">
            <view class="nav__back" @click="back">&lt;</view>
            <view class="nav__title">资源中心</view>
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
    background: #f8f9ff;
}

.nav {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    height: 110rpx;
    padding: 0 28rpx;
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    color: #fff;
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

.body {
    padding: 28rpx;
}

.chips {
    display: flex;
    gap: 14rpx;
    overflow-x: auto;
    margin-bottom: 24rpx;
}

.chips__item {
    white-space: nowrap;
    padding: 16rpx 28rpx;
    border-radius: 999rpx;
    background: #fff;
    color: #64748b;
    font-size: 22rpx;
    font-weight: 800;
}

.chips__item.is-active {
    background: #2563eb;
    color: #fff;
}

.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18rpx;
    padding: 0 4rpx;
}

.toolbar__count {
    color: #475569;
    font-size: 22rpx;
    font-weight: 800;
}

.toolbar__toggle {
    padding: 12rpx 20rpx;
    border-radius: 999rpx;
    background: #eef2ff;
    color: #4f46e5;
    font-size: 20rpx;
    font-weight: 800;
}

.search-card {
    margin-bottom: 24rpx;
    padding: 24rpx;
    border-radius: 28rpx;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    box-shadow: 0 16rpx 44rpx rgba(59, 130, 246, 0.08);
    border: 1rpx solid #e7eefb;
}

.search-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16rpx;
}

.search-field {
    min-width: 0;
}

.search-field--full {
    grid-column: 1 / -1;
}

.search-field__label {
    margin-bottom: 10rpx;
    color: #64748b;
    font-size: 20rpx;
    font-weight: 800;
}

.search-field__input {
    height: 78rpx;
    padding: 0 22rpx;
    border-radius: 18rpx;
    background: #fff;
    border: 2rpx solid #dbe7ff;
    box-sizing: border-box;
    color: #0f172a;
    font-size: 22rpx;
}

.search-actions {
    display: flex;
    gap: 16rpx;
    margin-top: 18rpx;
}

.search-btn {
    flex: 1;
    height: 78rpx;
    border-radius: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 900;
}

.search-btn--primary {
    background: #2563eb;
    color: #fff;
}

.search-btn--muted {
    background: #f1f5f9;
    color: #475569;
}

.empty-card {
    padding: 52rpx 28rpx;
    border-radius: 28rpx;
    background: #fff;
    text-align: center;
    box-shadow: 0 18rpx 48rpx rgba(59, 130, 246, 0.08);
}

.empty-card__title {
    color: #0f172a;
    font-size: 30rpx;
    font-weight: 900;
}

.empty-card__text {
    margin-top: 12rpx;
    color: #94a3b8;
    font-size: 22rpx;
}

.resource-card {
    margin-bottom: 22rpx;
    padding: 22rpx;
    border-radius: 24rpx;
    background: #fff;
    box-shadow: 0 16rpx 44rpx rgba(59, 130, 246, 0.08);
    border: 1rpx solid #e9eef8;
    position: relative;
    overflow: hidden;
}

.resource-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 10rpx;
    height: 100%;
    background: linear-gradient(180deg, #2563eb 0%, #60a5fa 100%);
}

.resource-card__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18rpx;
}

.resource-card__main {
    flex: 1;
    min-width: 0;
}

.resource-card__name {
    color: #0f172a;
    font-size: 25rpx;
    font-weight: 900;
}

.resource-card__ids {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 17rpx;
    line-height: 1.5;
    word-break: break-all;
}

.resource-card__status-group {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10rpx;
}

.status-pill {
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    font-size: 17rpx;
    font-weight: 900;
    background: #f1f5f9;
    color: #64748b;
}

.status-pill.is-running {
    background: #ecfdf5;
    color: #059669;
}

.status-pill.is-stopped {
    background: #f1f5f9;
    color: #64748b;
}

.status-pill.is-creating,
.status-pill.is-pending {
    background: #eef2ff;
    color: #4f46e5;
}

.status-pill.is-expired,
.status-pill.is-failed {
    background: #fff1f2;
    color: #e11d48;
}

.status-pill.is-success {
    background: #eff6ff;
    color: #2563eb;
}

.status-pill--sub {
    font-size: 16rpx;
}

.status-pill--sub.is-plain {
    background: #f8fafc;
    color: #64748b;
}

.resource-card__alert {
    margin-top: 14rpx;
    padding: 10rpx 14rpx;
    border-radius: 14rpx;
    background: #fff1f2;
    color: #e11d48;
    font-size: 18rpx;
    font-weight: 800;
}

.resource-card__spec {
    margin-top: 14rpx;
    padding: 14rpx 16rpx;
    border-radius: 16rpx;
    background: #f8fafc;
}

.resource-card__spec-main {
    color: #0f172a;
    font-size: 22rpx;
    font-weight: 900;
}

.resource-card__spec-sub {
    margin-top: 6rpx;
    color: #64748b;
    font-size: 17rpx;
    line-height: 1.5;
}

.resource-card__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 14rpx;
    padding-top: 14rpx;
    border-top: 1rpx solid #f1f5f9;
}

.resource-card__foot-text {
    color: #475569;
    font-size: 18rpx;
    font-weight: 700;
}

.resource-card__foot-text.is-expired {
    color: #dc2626;
}

.resource-card__cta {
    color: #2563eb;
    font-size: 24rpx;
    font-weight: 900;
}

@media (max-width: 680rpx) {
    .search-grid {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
