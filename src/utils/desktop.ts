declare global {
    interface Window {
        desktopBridge?: {
            isDesktop?: boolean
            getContext?: () => Promise<{ isDesktop: boolean; platform: string; version: string; appName?: string }>
            openExternal?: (url: string) => Promise<boolean>
            reloadDesktop?: () => Promise<boolean>
            openTrayRoute?: (route: string) => Promise<boolean>
            showReminderWindow?: () => Promise<boolean>
            hideReminderWindow?: () => Promise<boolean>
        }
    }
}

export function isDesktopClient() {
    return typeof window !== 'undefined' && !!window.desktopBridge?.isDesktop
}

export function getDesktopHomeRoute() {
    return '/pages/desktop/home'
}

export async function openDesktopRoute(route: string) {
    if (isDesktopClient() && window.desktopBridge?.openTrayRoute) {
        return window.desktopBridge.openTrayRoute(route)
    }
    if (typeof window !== 'undefined') {
        uni.navigateTo({ url: route })
    }
    return false
}

export async function openDesktopExternal(url: string) {
    if (isDesktopClient() && window.desktopBridge?.openExternal) {
        return window.desktopBridge.openExternal(url)
    }
    if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer')
    }
    return false
}

export async function showDesktopReminderWindow() {
    if (isDesktopClient() && window.desktopBridge?.showReminderWindow) {
        return window.desktopBridge.showReminderWindow()
    }
    if (typeof window !== 'undefined') {
        uni.navigateTo({ url: '/pages/desktop/reminder' })
    }
    return false
}

export async function hideDesktopReminderWindow() {
    if (isDesktopClient() && window.desktopBridge?.hideReminderWindow) {
        return window.desktopBridge.hideReminderWindow()
    }
    if (typeof window !== 'undefined' && getCurrentPages().length > 1) {
        uni.navigateBack()
    }
    return false
}

export async function navigateDesktopBack(fallback = getDesktopHomeRoute()) {
    if (typeof window !== 'undefined') {
        const pages = getCurrentPages()
        if (pages.length > 1) {
            uni.navigateBack()
            return true
        }
        if (isDesktopClient() && window.desktopBridge?.openTrayRoute) {
            return window.desktopBridge.openTrayRoute(fallback)
        }
        uni.reLaunch({ url: fallback })
        return true
    }
    return false
}
