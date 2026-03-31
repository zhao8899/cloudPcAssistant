<template>
    <view v-if="isDesktop" class="desktop-bottom-nav">
        <view
            v-for="item in navItems"
            :key="item.path"
            class="desktop-bottom-nav__item"
            :class="{ 'is-active': currentPath === item.path }"
            @click="go(item.path)"
        >
            <view class="desktop-bottom-nav__label">{{ item.label }}</view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { isDesktopClient } from '@/utils/desktop'
import { computed } from 'vue'

const isDesktop = isDesktopClient()

const navItems = [
    { path: '/pages/desktop/home', label: '主页' },
    { path: '/pages/cloud/orders', label: '订单' },
    { path: '/pages/user/user', label: '我的' }
]

const currentPath = computed(() => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    return currentPage ? `/${currentPage.route}` : ''
})

const go = (path: string) => {
    uni.reLaunch({ url: path })
}
</script>

<style scoped lang="scss">
.desktop-bottom-nav {
    position: fixed;
    left: 50%;
    bottom: 12px;
    transform: translateX(-50%);
    z-index: 50;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
}

.desktop-bottom-nav__item {
    min-width: 64px;
    padding: 8px 14px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
}

.desktop-bottom-nav__item.is-active {
    background: #eef3ff;
    color: #2563eb;
}

.desktop-bottom-nav__label {
    font-size: 13px;
    font-weight: 700;
}
</style>
