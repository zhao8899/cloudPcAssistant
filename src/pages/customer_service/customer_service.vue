<template>
    <page-meta :page-style="$theme.pageStyle">
        <!-- #ifndef H5 -->
        <navigation-bar
            :front-color="$theme.navColor"
            :background-color="$theme.navBgColor"
        />
        <!-- #endif -->
    </page-meta>

    <view v-if="isDesktop" class="customer-desktop">
        <view class="chat-dialog">
            <view class="chat-dialog__header">
                <view class="chat-dialog__header-main">
                    <view class="chat-dialog__back" @click="goBack">‹</view>
                    <view>
                        <view class="chat-dialog__title">{{ supportTitle }}</view>
                        <view class="chat-dialog__subtitle">{{ supportSubtitle }}</view>
                    </view>
                </view>
                <view class="chat-dialog__status">在线服务</view>
            </view>

            <view class="chat-dialog__body">
                <view class="message-row">
                    <view class="message-avatar">客服</view>
                    <view class="message-bubble">
                        <view class="message-bubble__title">欢迎联系专属客服</view>
                        <view class="message-bubble__text">
                            {{ supportRemark || '桌面端客服入口采用对话框布局，优先引导到电话和二维码联系。' }}
                        </view>
                        <view class="message-bubble__meta">
                            <view v-if="supportTime">服务时间：{{ supportTime }}</view>
                            <view v-if="supportMobile">联系电话：{{ supportMobile }}</view>
                        </view>
                    </view>
                </view>

                <view v-if="supportQrCode" class="message-row message-row--self">
                    <view class="message-bubble message-bubble--qrcode">
                        <view class="message-bubble__title">客服二维码</view>
                        <image class="message-bubble__qrcode" :src="supportQrCode" mode="aspectFill" />
                        <view class="message-bubble__text">扫码后可继续与客服沟通</view>
                    </view>
                </view>
            </view>

            <view class="chat-dialog__composer">
                <view class="composer-toolbar">
                    <view class="composer-toolbar__icon">文</view>
                    <view class="composer-toolbar__icon">图</view>
                    <view class="composer-toolbar__icon">附</view>
                </view>

                <view class="composer-input">
                    <textarea
                        v-model="draftMessage"
                        class="composer-input__field"
                        maxlength="500"
                        placeholder="请输入消息，当前桌面端优先引导到电话或二维码联系。"
                    />
                    <view class="composer-input__footer">
                        <text>{{ draftLength }}/500</text>
                        <view class="composer-input__actions">
                            <view
                                v-if="supportMobile"
                                class="composer-input__button composer-input__button--ghost"
                                @click="showPhone"
                            >
                                电话咨询
                            </view>
                            <view class="composer-input__button" @click="submitDraft">发送</view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <desktop-bottom-nav />
    </view>

    <view v-else class="customer-service">
        <view v-for="(item, index) in state.pages" :key="index">
            <template v-if="item.name == 'customer-service'">
                <w-customer-service :content="item.content" :styles="item.styles" />
            </template>
        </view>
    </view>
</template>

<script setup lang="ts">
import DesktopBottomNav from '@/components/desktop-bottom-nav/desktop-bottom-nav.vue'
import { getDecorate } from '@/api/shop'
import { useAppStore } from '@/stores/app'
import { isDesktopClient, navigateDesktopBack } from '@/utils/desktop'
import { computed, reactive, ref } from 'vue'

type SupportContent = {
    title?: string
    remark?: string
    mobile?: string
    time?: string
    qrcode?: string
}

const appStore = useAppStore()
const state = reactive<{
    pages: any[]
    content: SupportContent
}>({
    pages: [],
    content: {}
})

const draftMessage = ref('')
const isDesktop = isDesktopClient()

const supportTitle = computed(() => String(state.content.title || '专属客服'))
const supportSubtitle = computed(() => '桌面端客服对话框')
const supportRemark = computed(() => String(state.content.remark || ''))
const supportMobile = computed(() => String(state.content.mobile || ''))
const supportTime = computed(() => String(state.content.time || ''))
const supportQrCode = computed(() => {
    const qrcode = String(state.content.qrcode || '').trim()
    return qrcode ? appStore.getImageUrl(qrcode) : ''
})
const draftLength = computed(() => draftMessage.value.length)

const getData = async () => {
    const data = await getDecorate({ id: 3 })
    state.pages = JSON.parse(data.data)
    const customerServicePage = Array.isArray(state.pages)
        ? state.pages.find((item: any) => item?.name === 'customer-service')
        : null
    state.content = customerServicePage?.content || {}
}

const goBack = () => navigateDesktopBack('/pages/desktop/home')

const showPhone = async () => {
    if (!supportMobile.value) return
    await uni.showModal({
        title: '客服电话',
        content: supportMobile.value,
        showCancel: false,
        confirmText: '知道了'
    })
}

const submitDraft = async () => {
    const content = draftMessage.value.trim()
    if (!content) {
        uni.$u.toast('请输入消息内容')
        return
    }

    await uni.showModal({
        title: '桌面客服提示',
        content: supportMobile.value
            ? `当前桌面端优先通过电话或二维码联系人工客服。\n客服电话：${supportMobile.value}`
            : '当前桌面端优先通过二维码联系人工客服。',
        showCancel: false,
        confirmText: '知道了'
    })
}

getData()
</script>

<style scoped lang="scss">
.customer-desktop {
    min-height: 100vh;
    padding: 18px 18px 88px;
    box-sizing: border-box;
    background: var(--md-background);
}

.chat-dialog {
    max-width: 920px;
    height: calc(100vh - 124px);
    margin: 0 auto;
    border-radius: var(--md-radius-lg);
    background: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    box-shadow: var(--md-elevation-1);
    display: grid;
    grid-template-rows: auto 1fr auto;
    overflow: hidden;
}

.chat-dialog__header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--md-outline-variant);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.chat-dialog__header-main {
    display: flex;
    align-items: center;
    gap: 12px;
}

.chat-dialog__back {
    width: 36px;
    height: 36px;
    border-radius: var(--md-radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--md-surface-variant);
    color: var(--md-on-surface);
    font-size: 22px;
    flex-shrink: 0;
    cursor: pointer;
}

.chat-dialog__title {
    color: var(--md-on-surface);
    font-size: 18px;
    font-weight: 500;
}

.chat-dialog__subtitle {
    margin-top: 2px;
    color: var(--md-on-surface-variant);
    font-size: 12px;
}

.chat-dialog__status {
    padding: 4px 10px;
    border-radius: var(--md-radius-full);
    background: rgba(5, 150, 105, 0.12);
    color: #059669;
    font-size: 12px;
    font-weight: 500;
}

.chat-dialog__body {
    padding: 16px 18px;
    overflow: auto;
    display: grid;
    gap: 14px;
    align-content: start;
    background: var(--md-background);
}

.message-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.message-row--self {
    justify-content: flex-end;
}

.message-avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--md-radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 12px;
    font-weight: 500;
    flex-shrink: 0;
}

.message-bubble {
    max-width: 520px;
    padding: 14px 16px;
    border-radius: var(--md-radius-md);
    background: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    box-shadow: var(--md-elevation-1);
}

.message-bubble--qrcode {
    background: var(--md-primary-container);
}

.message-bubble__title {
    color: var(--md-on-surface);
    font-size: 15px;
    font-weight: 500;
}

.message-bubble__text,
.message-bubble__meta {
    margin-top: 6px;
    color: var(--md-on-surface-variant);
    font-size: 13px;
    line-height: 1.6;
}

.message-bubble__qrcode {
    width: 120px;
    height: 120px;
    margin-top: 10px;
    border-radius: var(--md-radius-sm);
}

.chat-dialog__composer {
    padding: 14px 16px;
    border-top: 1px solid var(--md-outline-variant);
    background: var(--md-surface);
}

.composer-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
}

.composer-toolbar__icon {
    width: 32px;
    height: 32px;
    border-radius: var(--md-radius-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--md-surface-variant);
    color: var(--md-on-surface-variant);
    font-size: 12px;
    font-weight: 500;
}

.composer-input {
    border-radius: var(--md-radius-md);
    border: 1px solid var(--md-outline-variant);
    background: var(--md-background);
    overflow: hidden;
}

.composer-input__field {
    width: 100%;
    min-height: 100px;
    padding: 12px;
    box-sizing: border-box;
    color: var(--md-on-surface);
    font-size: 14px;
    line-height: 1.6;
    background: transparent;
}

.composer-input__footer {
    padding: 0 12px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: var(--md-on-surface-variant);
    font-size: 12px;
}

.composer-input__actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.composer-input__button {
    min-width: 72px;
    height: 36px;
    padding: 0 14px;
    border-radius: var(--md-radius-full);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
}

.composer-input__button--ghost {
    background: var(--md-primary-container);
    color: var(--md-primary);
}
</style>
