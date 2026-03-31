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
                    <view class="chat-dialog__back" @click="goBack">&lt;</view>
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
    background: linear-gradient(180deg, #edf3fb 0%, #f7f9fc 100%);
}

.chat-dialog {
    max-width: 920px;
    height: calc(100vh - 124px);
    margin: 0 auto;
    border-radius: 26px;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
    display: grid;
    grid-template-rows: auto 1fr auto;
    overflow: hidden;
}

.chat-dialog__header {
    padding: 18px 22px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.chat-dialog__header-main {
    display: flex;
    align-items: center;
    gap: 14px;
}

.chat-dialog__back {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    color: #334155;
    font-size: 18px;
    font-weight: 700;
    flex-shrink: 0;
}

.chat-dialog__title {
    color: #0f172a;
    font-size: 22px;
    font-weight: 700;
}

.chat-dialog__subtitle {
    margin-top: 6px;
    color: #64748b;
    font-size: 13px;
}

.chat-dialog__status {
    padding: 8px 12px;
    border-radius: 999px;
    background: #dcfce7;
    color: #15803d;
    font-size: 12px;
    font-weight: 700;
}

.chat-dialog__body {
    padding: 18px 20px;
    overflow: auto;
    display: grid;
    gap: 14px;
    align-content: start;
    background: linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, rgba(255, 255, 255, 0.96) 100%);
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
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2563eb 0%, #635bff 100%);
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
}

.message-bubble {
    max-width: 520px;
    padding: 16px 18px;
    border-radius: 20px;
    background: #ffffff;
    border: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
}

.message-bubble--qrcode {
    background: linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%);
}

.message-bubble__title {
    color: #0f172a;
    font-size: 15px;
    font-weight: 700;
}

.message-bubble__text,
.message-bubble__meta {
    margin-top: 8px;
    color: #64748b;
    font-size: 13px;
    line-height: 1.6;
}

.message-bubble__qrcode {
    width: 120px;
    height: 120px;
    margin-top: 12px;
    border-radius: 18px;
}

.chat-dialog__composer {
    padding: 16px 18px 18px;
    border-top: 1px solid rgba(15, 23, 42, 0.06);
    background: rgba(255, 255, 255, 0.98);
}

.composer-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
}

.composer-toolbar__icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    color: #475569;
    font-size: 12px;
    font-weight: 700;
}

.composer-input {
    border-radius: 20px;
    border: 1px solid rgba(15, 23, 42, 0.06);
    background: #f8fafc;
    overflow: hidden;
}

.composer-input__field {
    width: 100%;
    min-height: 120px;
    padding: 16px;
    box-sizing: border-box;
    color: #0f172a;
    font-size: 14px;
    line-height: 1.6;
    background: transparent;
}

.composer-input__footer {
    padding: 0 16px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: #94a3b8;
    font-size: 12px;
}

.composer-input__actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.composer-input__button {
    min-width: 88px;
    height: 38px;
    padding: 0 14px;
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2563eb 0%, #635bff 100%);
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
}

.composer-input__button--ghost {
    background: #eff6ff;
    color: #2563eb;
}
</style>
