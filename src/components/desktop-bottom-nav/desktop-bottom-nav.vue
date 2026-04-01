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
                <view class="desktop-bottom-nav__icon" v-html="item.icon" />
            </view>
            <text class="desktop-bottom-nav__label">{{ item.label }}</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { isDesktopClient } from '@/utils/desktop'
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'

const isDesktop = isDesktopClient()

const ICON_HOME = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`
const ICON_CLOUD = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16.5c0 2.49-2.01 4.5-4.5 4.5h-10C4.01 21 2 18.99 2 16.5c0-2.34 1.78-4.24 4.06-4.46C6.69 9.64 9.13 8 12 8c2.63 0 4.93 1.35 6.28 3.39.24-.02.48-.04.72-.04C21.06 11.35 21 16.5 21 16.5z"/></svg>`
const ICON_NEWS = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/></svg>`
const ICON_USER = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`

const navItems = [
    { path: '/pages/desktop/home',    icon: ICON_HOME,  label: '工作台' },
    { path: '/pages/cloud/resources', icon: ICON_CLOUD, label: '云资源' },
    { path: '/pages/news/news',       icon: ICON_NEWS,  label: '资讯'   },
    { path: '/pages/user/user',       icon: ICON_USER,  label: '我的'   },
]

const currentPath = ref('')

const updatePath = () => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    currentPath.value = currentPage ? `/${currentPage.route}` : ''
}

onShow(() => {
    updatePath()
})

updatePath()

const go = (path: string) => {
    if (currentPath.value === path) return
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
    height: 32px;
    border-radius: var(--md-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
}

.desktop-bottom-nav__icon {
    width: 20px;
    height: 20px;
    color: var(--md-on-surface-variant);
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(svg) {
        fill: currentColor;
    }
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

    .desktop-bottom-nav__icon {
        color: var(--md-primary);
    }

    .desktop-bottom-nav__label {
        color: var(--md-primary);
        font-weight: 700;
    }
}
</style>
