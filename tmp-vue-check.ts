import { computed, ref, App } from 'vue'
const a = ref(1)
const b = computed(() => a.value + 1)
let app!: App
console.log(b.value, app)
