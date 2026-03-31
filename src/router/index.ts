import routes from 'uni-router-routes'
import { createRouter } from 'uniapp-router-next'

import { BACK_URL } from '@/enums/constantEnums'
import { useUserStore } from '@/stores/user'
import { captureAffiliateParams } from '@/utils/affiliate'
import cache from '@/utils/cache'
import { getDesktopHomeRoute, isDesktopClient } from '@/utils/desktop'

const router = createRouter({
    routes: [
        ...routes,
        {
            path: '*',
            redirect() {
                return {
                    name: '404'
                }
            }
        }
    ],
    debug: import.meta.env.DEV,
    // @ts-ignore
    platform: process.env.UNI_PLATFORM,
    h5: {}
})

let isFirstEach = true

router.beforeEach(async (to) => {
    captureAffiliateParams(to.query as Record<string, any>)

    if (isDesktopClient() && to.path === '/pages/index/index') {
        return {
            path: getDesktopHomeRoute(),
            navType: 'reLaunch'
        }
    }

    const userStore = useUserStore()

    if (isFirstEach) {
        if (!userStore.isLogin && !to.meta.white) {
            cache.set(BACK_URL, to.fullPath)
        }
        isFirstEach = false
    }

    if (!userStore.isLogin && to.meta.auth) {
        return '/pages/login/login'
    }
})

router.afterEach((to) => {
    const userStore = useUserStore()
    if (!userStore.isLogin && !to.meta.white) {
        cache.set(BACK_URL, to.fullPath)
    }
})

export default router
