const { nativeImage } = require('electron')

const WINDOW_WIDTH = 480
const WINDOW_HEIGHT = 682
const REMINDER_WIDTH = 160
const REMINDER_HEIGHT = 110
const parsedReminderScale = Number(process.env.REMINDER_SCALE || 0.5)
const REMINDER_SCALE = Number.isFinite(parsedReminderScale) && parsedReminderScale > 0
    ? parsedReminderScale
    : 0.5
const APP_BASE_PATH = '/mobile/'
const DEV_URL = process.env.FRONTEND_DEV_URL || ''
const REMINDER_MODE = (process.env.REMINDER_MODE || 'persistent').toLowerCase()
const shouldHideOnBlur = REMINDER_MODE === 'transient'

function isSafeExternalUrl(rawUrl) {
    try {
        const url = new URL(rawUrl)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch (error) {
        return false
    }
}

function normalizeRoute(route = '/pages/desktop/home') {
    const safeRoute = String(route || '/pages/desktop/home').trim()
    return safeRoute.startsWith('/') ? safeRoute : `/${safeRoute}`
}

function joinDesktopUrl(base, route) {
    const normalizedRoute = normalizeRoute(route)
    const url = new URL(APP_BASE_PATH, base)
    url.pathname = `${APP_BASE_PATH.replace(/\/$/, '')}${normalizedRoute}`
    url.searchParams.set('desktop', '1')
    return url.toString()
}

function getTrayIcon() {
    // 32x32 blue rounded-square with white cloud — matches primary brand color #1976D2
    return nativeImage.createFromDataURL(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAeUlEQVR4nO3Xuw3AIAwEUK/BogyahUA0aYIjwOdPFJ/khoJ7okBAxKTUqyGH61Et3cJYlU8R1uUPxL8BXuU3QrrBiDngLeqAlagATgIDSCIGIJKAYwAy3zyBBIS4B0IAZqCddTgAOQnwB7g/ShMQ4mtGET6n2hiuqAMpOzo/e2pmYAAAAABJRU5ErkJggg=='
    )
}

module.exports = {
    WINDOW_WIDTH,
    WINDOW_HEIGHT,
    REMINDER_WIDTH,
    REMINDER_HEIGHT,
    REMINDER_SCALE,
    APP_BASE_PATH,
    DEV_URL,
    shouldHideOnBlur,
    isSafeExternalUrl,
    normalizeRoute,
    joinDesktopUrl,
    getTrayIcon
}
