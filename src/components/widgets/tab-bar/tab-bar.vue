<template>
    <view class="md3-tab-bar">
        <view
            v-for="item in tabs"
            :key="item.path"
            class="md3-tab-bar__item"
            :class="{ 'is-active': currentPath === item.path }"
            @click="navigate(item.path)"
        >
            <view class="md3-tab-bar__pill">
                <text class="md3-tab-bar__icon">{{ item.icon }}</text>
            </view>
            <text class="md3-tab-bar__label">{{ item.label }}</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { useRouter } from 'uniapp-router-next'

const props = defineProps<{
    currentPath: string
}>()

const router = useRouter()

const tabs = [
    { path: '/pages/desktop/home',    icon: '🏠', label: '工作台' },
    { path: '/pages/cloud/resources', icon: '🖥',  label: '云资源' },
    { path: '/pages/news/news',       icon: '📰', label: '资讯'   },
    { path: '/pages/user/user',       icon: '👤', label: '我的'   },
]

const navigate = (path: string) => {
    if (path === props.currentPath) return
    router.reLaunch(path)
}
</script>

<style lang="scss">
.md3-tab-bar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: var(--md-surface);
    border-top: 1px solid var(--md-outline-variant);
    padding: 8px 0 12px;
    flex-shrink: 0;
}

.md3-tab-bar__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}

.md3-tab-bar__pill {
    width: 64px;
    height: 28px;
    border-radius: var(--md-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
}

.md3-tab-bar__icon {
    font-size: 16px;
}

.md3-tab-bar__label {
    font-size: 11px;
    font-weight: 500;
    color: var(--md-on-surface-variant);
    line-height: 1;
}

.md3-tab-bar__item.is-active {
    .md3-tab-bar__pill {
        background: var(--md-primary-container);
    }
    .md3-tab-bar__label {
        color: var(--md-primary);
        font-weight: 700;
    }
}
</style>
