<template>
    <view class="page">
        <view class="nav">
            <view class="nav__back" @click="back">‹</view>
            <view class="nav__title">新建云实例</view>
        </view>

        <view class="section">
            <view class="section__title">地区选择</view>
            <view v-if="purchasePackOptions.length" class="region-list">
                <view
                    v-for="pack in purchasePackOptions"
                    :key="pack.id"
                    class="region-card"
                    :class="getPackCardClass(pack)"
                    @click="handlePackSelect(pack)"
                >
                    <view class="region-card__head">
                        <view class="region-card__name">{{ pack.region_name || pack.region_id || '-' }}</view>
                        <view v-if="selectedPackId === Number(pack.id)" class="region-card__badge">已选</view>
                    </view>
                </view>
            </view>
            <view v-else class="empty-text">暂无可选地区</view>
        </view>

        <view class="section" :class="{ 'is-loading': packResourceLoading }">
            <view class="section__title">系统类型</view>
            <view class="pill-row">
                <view
                    v-for="item in osTypeOptions"
                    :key="item"
                    class="pill"
                    :class="{ 'is-active': osType === item }"
                    @click="handleOsTypeChange(item)"
                >
                    {{ item }}
                </view>
            </view>
            <view v-if="selectedPurchasePack && !osTypeOptions.length" class="empty-text">当前地区下暂无可用系统类型</view>
        </view>

        <view class="section">
            <view class="section__title">规格选择</view>
            <view v-if="filteredSpecs.length" class="grid-list">
                <view
                    v-for="item in filteredSpecs"
                    :key="item.id"
                    class="option-card"
                    :class="{ 'is-active': item.id === currentSpec?.id }"
                    @click="onSpecChange(item)"
                >
                    <view v-if="item.id === currentSpec?.id" class="option-card__badge">已选</view>
                    <view class="option-card__name">{{ item.flavor_name }}</view>
                    <view class="option-card__meta">{{ item.cpu }}C / {{ item.memory_gb }}G</view>
                    <view class="option-card__meta">
                        {{ item.gpu_type_name || item.gpu_desc ? `GPU ${item.gpu_type_name || item.gpu_desc}` : '普通电脑' }}
                    </view>
                </view>
            </view>
            <view v-else class="empty-text">{{ selectedPurchasePack ? '当前系统类型暂无可选规格' : '请先选择地区' }}</view>
        </view>

        <view class="section">
            <view class="section__title">镜像选择</view>
            <view v-if="imageList.length" class="grid-list">
                <view
                    v-for="item in imageList"
                    :key="item.image_oid"
                    class="option-card"
                    :class="{ 'is-active': item.image_oid === imageOid }"
                    @click="handleImageChange(item.image_oid)"
                >
                    <view v-if="item.image_oid === imageOid" class="option-card__badge">已选</view>
                    <view class="option-card__name">{{ item.image_name }}</view>
                    <view class="option-card__meta">{{ item.platform || item.os_type || '-' }}</view>
                    <view class="option-card__meta">系统盘 {{ item.sys_disk_size || 120 }}GB</view>
                </view>
            </view>
            <view v-else class="empty-text">{{ selectedPurchasePack ? '暂无可用公共镜像' : '请先选择地区' }}</view>
        </view>

        <view class="section">
            <view class="section__title">系统盘</view>
            <view class="summary-row">
                <text>系统盘大小</text>
                <text>{{ systemDiskGb }}GB</text>
            </view>
            <view class="summary-tip">系统盘大小固定为 120GB，不可修改</view>
        </view>

        <view class="section">
            <view class="section__title">带宽大小</view>
            <view class="summary-row">
                <text>带宽</text>
                <text>{{ bandwidthDisplay }}M</text>
            </view>
            <slider
                class="bandwidth-slider"
                :value="bandwidthMbps"
                :min="1"
                :max="20"
                :step="1"
                block-size="20"
                activeColor="var(--md-primary)"
                backgroundColor="var(--md-primary-container)"
                @change="handleBandwidthChange"
            />
            <view class="summary-tip">默认 5M，可调整范围 1-20M</view>
        </view>

        <view class="section">
            <view class="section__title">时长</view>
            <view class="pill-row">
                <view
                    v-for="item in durationOptions"
                    :key="item.value"
                    class="duration-card"
                    :class="{ 'is-active': duration === item.value }"
                    @click="handleDurationChange(item.value)"
                >
                    {{ item.label }}
                </view>
            </view>
            <view class="field-block">
                <view class="field-block__label">购买数量</view>
                <view class="counter">
                    <view class="counter__btn" @click="changeQuantity(-1)">-</view>
                    <view class="counter__value">{{ quantity }}</view>
                    <view class="counter__btn" @click="changeQuantity(1)">+</view>
                </view>
                <view class="summary-tip">单次最多支持购买 10 台，将拆分为多个独立订单和实例处理。</view>
            </view>
            <view class="field-block">
                <view class="field-block__label">
                    用户邮箱
                    <text v-if="osType === 'Linux'" class="field-block__required">*（Linux 开通必填）</text>
                    <text v-else class="field-block__desc">（可选，填写后重复邮箱不重复创建账号。一个登录账户可以存在多个云电脑）</text>
                </view>
                <input v-model="userEmail" class="field-block__input" placeholder="请输入用户邮箱" />
                <view v-if="quantity > 1" class="summary-tip summary-tip--warn">
                    多台机器不建议填写邮箱；填写后可能复用同一云账户，出现一个账户下挂载多台实例。
                </view>
            </view>
            <view class="field-block">
                <view class="field-block__label">手机号</view>
                <input v-model="userMobile" class="field-block__input" placeholder="请输入手机号" />
            </view>
        </view>

        <view class="footer">
            <view class="footer__text">
                <view class="footer__title">{{ currentSpec?.flavor_name || '-' }}</view>
                <view class="footer__sub">
                    {{ osType }} ｜ {{ bandwidthDisplay }}M ｜ {{ durationLabel }} ｜ {{ quantity }}台
                </view>
            </view>
            <view class="footer__btn" :class="{ 'is-loading': submitting }" @click="submitOrder">
                {{ submitting ? '提交中...' : '提交订单' }}
            </view>
        </view>
        <desktop-bottom-nav />
    </view>
</template>

<script setup lang="ts">
import DesktopBottomNav from '@/components/desktop-bottom-nav/desktop-bottom-nav.vue'
import {
    getCloudPurchasePackOptions,
    getCloudSpecImages,
    getCloudSpecLists,
    submitCloudOrder
} from '@/api/cloud'
import { getDesktopHomeRoute, isDesktopClient, navigateDesktopBack } from '@/utils/desktop'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isDesktop = isDesktopClient()

const loading = ref(false)
const packResourceLoading = ref(false)
const submitting = ref(false)
const authPrompting = ref(false)
const refreshingUser = ref(false)

const purchasePackOptions = ref<any[]>([])
const allSpecs = ref<any[]>([])
const allImages = ref<any[]>([])
const imageList = ref<any[]>([])

const osType = ref<'Windows' | 'Linux'>('Windows')
const currentSpec = ref<any | null>(null)
const currentImage = ref<any | null>(null)
const imageOid = ref('')
const systemDiskGb = ref(120)
const bandwidthMbps = ref(5)
const duration = ref('1m')
const quantity = ref(1)
const userEmail = ref('')
const userMobile = ref('')
const selectedPackId = ref(0)

const durationOptions = [
    { label: '1个月', value: '1m' },
    { label: '2个月', value: '2m' },
    { label: '3个月', value: '3m' },
    { label: '4个月', value: '4m' },
    { label: '5个月', value: '5m' },
    { label: '6个月', value: '6m' },
    { label: '7个月', value: '7m' },
    { label: '8个月', value: '8m' },
    { label: '9个月', value: '9m' },
    { label: '10个月', value: '10m' },
    { label: '11个月', value: '11m' },
    { label: '12个月', value: '12m' }
]

const durationLabelMap: Record<string, string> = {
    '1m': '1个月',
    '2m': '2个月',
    '3m': '3个月',
    '4m': '4个月',
    '5m': '5个月',
    '6m': '6个月',
    '7m': '7个月',
    '8m': '8个月',
    '9m': '9个月',
    '10m': '10个月',
    '11m': '11个月',
    '12m': '12个月'
}

const durationLabel = computed(() => durationLabelMap[duration.value] || duration.value)
const selectedPurchasePack = computed(
    () => purchasePackOptions.value.find((item) => Number(item.id) === Number(selectedPackId.value)) || null
)
const osTypeOptions = computed(() => {
    const specTypes = new Set(allSpecs.value.map((item) => String(item.os_type || '')).filter(Boolean))
    const imageTypes = new Set(allImages.value.map((item) => String(item.os_type || '')).filter(Boolean))
    return ['Windows', 'Linux'].filter((item) => specTypes.has(item) && imageTypes.has(item)) as Array<
        'Windows' | 'Linux'
    >
})
const filteredSpecs = computed(() => {
    return allSpecs.value
        .filter((item) => (item.os_type || 'Windows') === osType.value)
        .sort((a, b) => {
            const cpuA = Number(a.cpu || 0)
            const cpuB = Number(b.cpu || 0)
            if (cpuA !== cpuB) return cpuA - cpuB
            const memoryA = Number(a.memory_gb || 0)
            const memoryB = Number(b.memory_gb || 0)
            if (memoryA !== memoryB) return memoryA - memoryB
            return String(a.flavor_name || '').localeCompare(String(b.flavor_name || ''))
        })
})
const bandwidthDisplay = computed(() => {
    const value = Number(bandwidthMbps.value || 5)
    return Number.isFinite(value) && value > 0 ? Math.round(value) : 5
})

const back = () => navigateDesktopBack()

const ensureLogin = () => {
    if (userStore.isLogin) return true
    uni.navigateTo({ url: '/pages/login/login' })
    return false
}

const isRealAuthed = computed(() => Number(userStore.userInfo?.auth_status || 0) === 1)

const promptRealAuth = () => {
    if (authPrompting.value) return
    authPrompting.value = true
    uni.showModal({
        title: '请先完成实名',
        content: '需实名认证后才可下单购买云实例。',
        confirmText: '去实名',
        cancelText: '取消',
        success: (res) => {
            if (res.confirm) {
                uni.navigateTo({ url: '/pages/user_data/user_data' })
                return
            }
            if (res.cancel) {
                uni.reLaunch({ url: getDesktopHomeRoute() })
            }
        },
        complete: () => {
            authPrompting.value = false
        }
    })
}

const ensureRealAuth = async () => {
    if (isRealAuthed.value) {
        return true
    }

    promptRealAuth()
    return false
}

const refreshUserInfo = async () => {
    if (!userStore.isLogin) return
    refreshingUser.value = true
    try {
        await userStore.getUser()
    } finally {
        refreshingUser.value = false
    }
}

const calculateNaturalExpireTimestamp = () => {
    const count = Math.max(1, Number(duration.value.replace('m', '').replace('y', '')) || 1)
    const target = new Date()
    target.setMonth(target.getMonth() + count)
    target.setHours(23, 59, 59, 0)
    return target.getTime()
}

const packDurationValid = (pack: any) => {
    return Number(pack?.valid_end_time || 0) * 1000 >= calculateNaturalExpireTimestamp()
}

const packAvailableCount = (pack: any) => {
    if (!pack || !currentSpec.value) return 0
    if (!packDurationValid(pack)) return 0

    const reqCpu = Math.max(0, Number(currentSpec.value.cpu || 0))
    const reqMemory = Math.max(0, Number(currentSpec.value.memory_gb || 0))
    const reqBandwidth = Math.max(0, Number(bandwidthDisplay.value || 0))

    const localCpu = Math.max(0, Number(pack.cpu_remaining_local || 0))
    const localMemory = Math.max(0, Number(pack.memory_remaining_local || 0))
    const localBandwidth = Math.max(0, Number(pack.bandwidth_remaining_local || 0))

    return Math.max(
        0,
        Math.floor(
            Math.min(
                reqCpu > 0 ? localCpu / reqCpu : Number.MAX_SAFE_INTEGER,
                reqMemory > 0 ? localMemory / reqMemory : Number.MAX_SAFE_INTEGER,
                reqBandwidth > 0 ? localBandwidth / reqBandwidth : Number.MAX_SAFE_INTEGER
            )
        )
    )
}

const getPackCardClass = (pack: any) => {
    if (selectedPackId.value === Number(pack.id)) {
        return 'is-active'
    }
    if (currentSpec.value && packAvailableCount(pack) <= 0) {
        return 'is-disabled'
    }
    return ''
}

const setBandwidthDefault5 = () => {
    bandwidthMbps.value = 5
}

const resetPackResources = () => {
    allSpecs.value = []
    allImages.value = []
    imageList.value = []
    currentSpec.value = null
    currentImage.value = null
    imageOid.value = ''
    systemDiskGb.value = 120
}

const filterImages = () => {
    imageList.value = allImages.value.filter((item) => item.os_type === osType.value)
    currentImage.value = imageList.value[0] || null
    imageOid.value = currentImage.value?.image_oid || ''
    systemDiskGb.value = 120
}

const handleOsTypeChange = (value: 'Windows' | 'Linux') => {
    if (osType.value === value) return
    osType.value = value
    currentSpec.value = filteredSpecs.value[0] || null
    setBandwidthDefault5()
    filterImages()
}

const onSpecChange = (row: any) => {
    currentSpec.value = row || null
    setBandwidthDefault5()
}

const handleImageChange = (value: string) => {
    imageOid.value = value
    currentImage.value = imageList.value.find((item) => item.image_oid === value) || null
    systemDiskGb.value = 120
}

const handleBandwidthChange = (event: any) => {
    bandwidthMbps.value = Number(event?.detail?.value || 5)
}

const handleDurationChange = (value: string) => {
    duration.value = value
    if (selectedPurchasePack.value && !packDurationValid(selectedPurchasePack.value)) {
        uni.$u.toast('当前地区有效期不足以覆盖所选时长')
    }
}

const changeQuantity = (step: number) => {
    quantity.value = Math.min(10, Math.max(1, Number(quantity.value || 1) + step))
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const isValidMobile = (mobile: string) => /^1\d{10}$/.test(mobile)

const applyPackResources = async (pack: any) => {
    const packId = Number(pack?.id || 0)
    const regionId = String(pack?.region_id || '')
    const cloudAccountId = Number(pack?.cloud_account_id || 0)

    if (packId <= 0 || !regionId) {
        selectedPackId.value = 0
        resetPackResources()
        return
    }

    packResourceLoading.value = true
    selectedPackId.value = packId
    resetPackResources()
    setBandwidthDefault5()

    try {
        const [specData, imageData] = await Promise.all([
            getCloudSpecLists({
                page_no: 1,
                page_size: 500,
                spec_type: '普通电脑',
                region_id: regionId,
                cloud_account_id: cloudAccountId
            }),
            getCloudSpecImages({
                spec_type: '普通电脑',
                region_id: regionId,
                cloud_account_id: cloudAccountId,
                os_type: ''
            })
        ])

        allSpecs.value = specData?.lists || []
        allImages.value = imageData?.lists || []

        const firstOsType = (osTypeOptions.value[0] || 'Windows') as 'Windows' | 'Linux'
        osType.value = firstOsType
        currentSpec.value = filteredSpecs.value[0] || null
        filterImages()
    } catch (error: any) {
        selectedPackId.value = 0
        resetPackResources()
        if (typeof error !== 'string') {
            uni.$u.toast(error?.message || '资源配置加载失败，请重试')
        }
    } finally {
        packResourceLoading.value = false
    }
}

const handlePackSelect = (pack: any) => {
    const nextPackId = Number(pack?.id || 0)
    if (nextPackId <= 0 || nextPackId === selectedPackId.value) return
    applyPackResources(pack)
}

const initData = async () => {
    loading.value = true
    try {
        const packData = await getCloudPurchasePackOptions()
        purchasePackOptions.value = packData?.lists || []
        const firstPack = purchasePackOptions.value[0]
        if (firstPack) {
            await applyPackResources(firstPack)
        }
    } finally {
        loading.value = false
    }
}

const submitOrder = async () => {
    if (submitting.value) return
    if (refreshingUser.value) return
    if (!(await ensureRealAuth())) return
    if (!currentSpec.value) return uni.$u.toast('请先选择规格')
    if (!selectedPurchasePack.value) return uni.$u.toast('请先选择地区')
    if (!currentImage.value) return uni.$u.toast('请先选择公共镜像')
    if (osType.value === 'Linux' && !userEmail.value.trim()) {
        return uni.$u.toast('开通 Linux 桌面必须填写用户邮箱')
    }
    if (userEmail.value.trim() && !isValidEmail(userEmail.value.trim())) {
        return uni.$u.toast('邮箱格式不正确，请重新输入')
    }
    if (userMobile.value.trim() && !isValidMobile(userMobile.value.trim())) {
        return uni.$u.toast('手机号格式不正确，请重新输入')
    }
    if (Number(quantity.value) < 1 || Number(quantity.value) > 10) {
        return uni.$u.toast('购买数量需在1到10台之间')
    }
    if (!packDurationValid(selectedPurchasePack.value)) {
        return uni.$u.toast('所选代理商资源池有效期不足以覆盖当前时长')
    }
    if (packAvailableCount(selectedPurchasePack.value) < Number(quantity.value)) {
        return uni.$u.toast(
            `所选代理商资源池剩余可用不足，当前最多可下单 ${packAvailableCount(selectedPurchasePack.value)} 台`
        )
    }

    submitting.value = true
    try {
        const durationValue = Number(duration.value.replace('m', '').replace('y', '')) || 1
        const durationUnit = duration.value.endsWith('y') ? 'year' : 'month'

        const res = await submitCloudOrder({
            flavor_id: currentSpec.value.flavor_id,
            cloud_account_id: Number(currentSpec.value.cloud_account_id || 0),
            region_id: currentSpec.value.region_id,
            image_id: currentImage.value.image_oid,
            system_disk_gb: Number(systemDiskGb.value),
            bandwidth_mbps: Number(bandwidthDisplay.value),
            duration_unit: durationUnit,
            duration_value: durationValue,
            quantity: Number(quantity.value),
            os_type: osType.value,
            spec_type: '普通电脑',
            image_name: currentImage.value.image_name,
            flavor_name: currentSpec.value.flavor_name,
            user_email: userEmail.value.trim(),
            user_mobile: userMobile.value.trim(),
            preferred_pack_id: Number(selectedPackId.value),
            subnet_oid: '',
            vpc_oid: '',
            security_group: '',
            system_disk_type: '',
            pub_user_oid_list: [],
            bill_mode: 'Cycle',
            cycle_type: duration.value.endsWith('y') ? 'Year' : 'Month',
            cycle_cnt: durationValue,
            raw_selected: {
                spec: currentSpec.value,
                image: currentImage.value
            }
        })

        const successCount = Number(res?.success_count || 0)
        const failedCount = Number(res?.failed_count || 0)
        if (successCount > 1 || failedCount > 0) {
            uni.$u.toast(
                failedCount > 0
                    ? `批量提交完成，成功 ${successCount} 台，失败 ${failedCount} 台`
                    : `批量提交完成，成功提交 ${successCount} 台云电脑`
            )
        } else {
            uni.$u.toast(`提交成功，待审核，订单号：${res?.order_no || ''}`)
        }
        setTimeout(() => {
            uni.navigateTo({ url: '/pages/cloud/orders' })
        }, 700)
    } catch (error) {
        if (typeof error !== 'string') {
            uni.$u.toast('提交失败，请重试')
        }
    } finally {
        submitting.value = false
    }
}

onLoad(async () => {
    if (!ensureLogin()) return
    await refreshUserInfo()
    if (!isRealAuthed.value) {
        promptRealAuth()
    }
    initData()
})

onShow(async () => {
    if (!userStore.isLogin) return
    await refreshUserInfo()
    if (!isRealAuthed.value) {
        promptRealAuth()
    }
})
</script>

<style scoped lang="scss">
.page {
    min-height: 100vh;
    background: var(--md-background);
    display: flex;
    flex-direction: column;
    padding-bottom: 80px;
}

.nav {
    display: flex;
    align-items: center;
    height: 56px;
    padding: 0 4px 0 8px;
    background: var(--md-surface);
    border-bottom: 1px solid var(--md-outline-variant);
    flex-shrink: 0;
}

.nav__back {
    width: 40px;
    font-size: 28px;
    color: var(--md-on-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.nav__title {
    flex: 1;
    margin-right: 40px;
    text-align: center;
    font-size: 18px;
    font-weight: 500;
    color: var(--md-on-surface);
}

.section {
    margin: 12px 14px 0;
    padding: 14px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    box-shadow: var(--md-elevation-1);
}

.section.is-loading {
    opacity: 0.75;
}

.section__title {
    margin-bottom: 10px;
    font-size: 15px;
    color: var(--md-on-surface);
    font-weight: 500;
}

.region-list,
.grid-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.region-card,
.option-card {
    position: relative;
    padding: 10px;
    border-radius: var(--md-radius-sm);
    border: 1px solid var(--md-outline-variant);
    background: var(--md-background);
    cursor: pointer;
}

.region-card.is-active,
.option-card.is-active {
    border-color: var(--md-primary);
    background: var(--md-primary-container);
}

.region-card.is-disabled {
    border-color: var(--status-expired-bg);
    background: var(--status-expired-bg);
    opacity: 0.7;
}

.region-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
}

.region-card__name,
.option-card__name {
    font-size: 13px;
    color: var(--md-on-surface);
    font-weight: 500;
    line-height: 1.4;
}

.region-card__badge,
.option-card__badge {
    padding: 2px 8px;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 11px;
    font-weight: 500;
}

.option-card__meta {
    margin-top: 4px;
    color: var(--md-on-surface-variant);
    font-size: 11px;
    line-height: 1.5;
}

.pill-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.pill {
    padding: 6px 14px;
    border-radius: var(--md-radius-full);
    background: var(--md-surface-variant);
    color: var(--md-on-surface-variant);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
}

.pill.is-active {
    background: var(--md-primary-container);
    color: var(--md-primary);
}

.duration-card {
    min-width: 64px;
    padding: 8px;
    border-radius: var(--md-radius-sm);
    background: var(--md-background);
    border: 1px solid var(--md-outline-variant);
    color: var(--md-on-surface-variant);
    font-size: 13px;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
}

.duration-card.is-active {
    background: var(--md-primary-container);
    border-color: var(--md-primary);
    color: var(--md-primary);
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: var(--md-on-surface);
}

.summary-tip {
    margin-top: 6px;
    color: var(--md-on-surface-variant);
    font-size: 12px;
    line-height: 1.7;
}

.bandwidth-slider {
    margin-top: 8px;
}

.summary-tip--warn {
    color: var(--status-warning-fg);
}

.field-block {
    margin-top: 14px;
}

.field-block__label {
    font-size: 13px;
    color: var(--md-on-surface);
    line-height: 1.7;
}

.field-block__required {
    color: var(--md-error);
}

.field-block__desc {
    color: var(--md-on-surface-variant);
}

.field-block__input {
    margin-top: 6px;
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border-radius: var(--md-radius-sm);
    background: var(--md-background);
    border: 1px solid var(--md-outline-variant);
    color: var(--md-on-surface);
    font-size: 13px;
    box-sizing: border-box;
}

.counter {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
}

.counter__btn,
.counter__value {
    width: 32px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    border-radius: var(--md-radius-sm);
    background: var(--md-surface-variant);
    color: var(--md-on-surface);
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
}

.footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    background: var(--md-surface);
    border-top: 1px solid var(--md-outline-variant);
}

.footer__text {
    flex: 1;
    min-width: 0;
}

.footer__title {
    color: var(--md-on-surface);
    font-size: 14px;
    font-weight: 500;
}

.footer__sub {
    margin-top: 2px;
    color: var(--md-on-surface-variant);
    font-size: 11px;
    line-height: 1.6;
}

.footer__btn {
    min-width: 100px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
}

.footer__btn.is-loading {
    opacity: 0.7;
}

.empty-text {
    color: var(--md-on-surface-variant);
    font-size: 13px;
}
</style>
