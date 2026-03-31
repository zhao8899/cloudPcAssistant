<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useAppStore } from './stores/app'
import { captureAffiliateParams } from './utils/affiliate'
import { useUserStore } from './stores/user'
import { useThemeStore } from './stores/theme'

const appStore = useAppStore()
const { getUser } = useUserStore()
const { getTheme } = useThemeStore()

const bootstrap = async () => {
    getTheme()
    await appStore.getConfig()
    await getUser()
}

onLaunch(async (options) => {
    captureAffiliateParams(options as Record<string, any>)
    await bootstrap()
})
</script>

<style lang="scss">
@import './styles/var.css';
@import './styles/typography.css';
</style>
