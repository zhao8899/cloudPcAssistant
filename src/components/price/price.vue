<template>
    <view class="price-container">
        <view
            :class="['price-wrap', { 'price-wrap--disabled': lineThrough }]"
            :style="{ color }"
        >
            <view class="fix-pre" :style="{ fontSize: minorSize }">
                <slot name="prefix">{{ prefix }}</slot>
            </view>

            <view :style="{ 'font-weight': fontWeight }">
                <text :style="{ fontSize: mainSize }">{{ integer }}</text>
                <text :style="{ fontSize: minorSize }">{{ decimals }}</text>
            </view>

            <view class="fix-suf" :style="{ fontSize: minorSize }">
                <slot name="suffix">{{ suffix }}</slot>
            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { formatPrice } from '@/utils/util'

const props = withDefaults(
    defineProps<{
        content: string | number
        prec?: number
        autoPrec?: boolean
        color?: string
        mainSize?: string
        minorSize?: string
        lineThrough?: boolean
        fontWeight?: string
        prefix?: string
        suffix?: string
    }>(),
    {
        content: '',
        prec: 2,
        autoPrec: true,
        color: '#FA8919',
        mainSize: '36rpx',
        minorSize: '28rpx',
        lineThrough: false,
        fontWeight: 'normal',
        prefix: '¥',
        suffix: ''
    }
)

const integer = computed(() => {
    return String(
        formatPrice({
            price: props.content,
            take: 'int'
        })
    )
})

const decimals = computed(() => {
    const formattedDecimals = String(
        formatPrice({
            price: props.content,
            take: 'dec',
            prec: props.prec
        })
    )
    const normalizedDecimals =
        Number(formattedDecimals) % 10 === 0
            ? formattedDecimals.slice(0, Math.max(formattedDecimals.length - 1, 0))
            : formattedDecimals

    if (props.autoPrec) {
        return Number(normalizedDecimals) ? `.${normalizedDecimals}` : ''
    }

    return props.prec ? `.${normalizedDecimals}` : ''
})
</script>

<style lang="scss" scoped>
.price-container {
    display: inline-block;
}

.price-wrap {
    display: flex;
    align-items: baseline;

    &--disabled {
        position: relative;

        &::before {
            position: absolute;
            left: 0;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            display: block;
            content: '';
            height: 0.05em;
            background-color: currentColor;
        }
    }
}
</style>
