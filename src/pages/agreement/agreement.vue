<template>
    <view class="agreement-page">
        <u-parse :html="agreementContent"></u-parse>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPolicy } from '@/api/app'

let agreementType = ref('') // 协议类型
const agreementContent = ref('') // 协议内容

const getData = async (type) => {
    const res = await getPolicy({ type })
    agreementContent.value = res.content
    uni.setNavigationBarTitle({
        title: String(res.title)
    })
}

onLoad((options: any) => {
    if (options.type) {
        agreementType = options.type
        getData(agreementType)
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
