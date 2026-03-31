<template>
    <view v-if="isDesktop" class="desktop-bottom-nav">
        <view
            v-for="item in navItems"
            :key="item.path"
            class="desktop-bottom-nav__item"
            :class="{ 'is-active': currentPath === item.path }"
            @click="go(item.path)"
        >
            <view class="desktop-bottom-nav__pill">
                <text class="desktop-bottom-nav__icon">{{ item.icon }}</text>
            </view>
            <text class="desktop-bottom-nav__label">{{ item.label }}</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { isDesktopClient } from '@/utils/desktop'
import { computed } from 'vue'

const isDesktop = isDesktopClient()

const navItems = [
    { path: '/pages/desktop/home',    icon: '🏠', label: '工作台' },
    { path: '/pages/cloud/resources', icon: '🖥',  label: '云资源' },
    { path: '/pages/news/news',       icon: '📰', label: '资讯'   },
    { path: '/pages/user/user',       icon: '👤', label: '我的'   },
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
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: var(--md-surface);
    border-top: 1px solid var(--md-outline-variant);
    padding: 8px 0 12px;
    flex-shrink: 0;
}

.desktop-bottom-nav__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}

.desktop-bottom-nav__pill {
    width: 64px;
    height: 28px;
    border-radius: var(--md-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
}

.desktop-bottom-nav__icon {
    font-size: 16px;
}

.desktop-bottom-nav__label {
    font-size: 11px;
    font-weight: 500;
    color: var(--md-on-surface-variant);
    line-height: 1;
}

.desktop-bottom-nav__item.is-active {
    .desktop-bottom-nav__pill {
        background: var(--md-primary-container);
    }

    .desktop-bottom-nav__label {
        color: var(--md-primary);
        font-weight: 700;
    }
}
</style>
