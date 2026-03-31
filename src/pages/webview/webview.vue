<template>
    <web-view :src="url" />
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { isDesktopClient, openDesktopExternal } from '@/utils/desktop'
import { ref } from 'vue'

const url = ref('')

onLoad(async (options) => {
    const targetUrl = decodeURIComponent(options.url || '')
    if (isDesktopClient()) {
        if (targetUrl) {
            await openDesktopExternal(targetUrl)
        }
        if (getCurrentPages().length > 1) {
            uni.navigateBack()
        } else {
            uni.reLaunch({ url: '/pages/desktop/home' })
        }
        return
    }
    url.value = targetUrl
})
</script>

<style></style>
