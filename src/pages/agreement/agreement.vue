<template>
    <view class="agreement-page">
        <u-parse :html="agreementContent"></u-parse>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPolicy } from '@/api/app'

const agreementType = ref('')
const agreementContent = ref('')

const getData = async (type: string) => {
    const res = await getPolicy({ type })
    agreementContent.value = res.content
    uni.setNavigationBarTitle({
        title: String(res.title)
    })
}

onLoad((options: any) => {
    if (options.type) {
        agreementType.value = options.type
        getData(agreementType.value)
    }
})
</script>

<style lang="scss" scoped>
.agreement-page {
    min-height: 100vh;
    background: var(--md-surface);
    padding: 16px;
    color: var(--md-on-surface);
    font-size: 14px;
    line-height: 1.8;
    box-sizing: border-box;
}
</style>
