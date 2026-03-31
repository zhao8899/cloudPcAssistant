<template><view /></template>
<script setup lang="ts">
import { computed, ref } from 'vue'
const n = ref(1)
const m = computed(() => n.value + 1)
</script>
