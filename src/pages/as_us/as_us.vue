<template>
    <page-meta :page-style="$theme.pageStyle">
        <!-- #ifndef H5 -->
        <navigation-bar
            :front-color="$theme.navColor"
            :background-color="$theme.navBgColor"
        />
        <!-- #endif -->
    </page-meta>
    <view class="page">
        <image :src="appStore.getWebsiteConfig.shop_logo" mode="" class="logo"></image>
        <view class="version">当前版本{{ appStore.config.version }}</view>
    </view>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()
</script>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    background: var(--md-background);
    display: flex;
    flex-direction: column;
    align-items: center;
}

.logo {
    width: 80px;
    height: 80px;
    border-radius: var(--md-radius-sm);
    margin-top: 48px;
}

.version {
    margin-top: 12px;
    font-size: 13px;
    color: var(--md-on-surface-variant);
}
</style>
