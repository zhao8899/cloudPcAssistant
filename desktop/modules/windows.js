const { BrowserWindow, shell, screen } = require('electron')
const path = require('path')
const {
    WINDOW_WIDTH, WINDOW_HEIGHT,
    REMINDER_WIDTH, REMINDER_HEIGHT, REMINDER_SCALE,
    shouldHideOnBlur,
    isSafeExternalUrl,
    joinDesktopUrl
} = require('./constants')

let mainWindow = null
let reminderWindow = null
let frontendOrigin = ''
let isQuitting = false

function setFrontendOrigin(origin) {
    frontendOrigin = origin
}

function setIsQuitting(value) {
    isQuitting = value
}

function getMainWindow() {
    return mainWindow
}

function getReminderWindow() {
    return reminderWindow
}

function getAppEntryUrl(route = '/pages/desktop/home') {
    if (!frontendOrigin) {
        throw new Error('Frontend origin is not ready')
    }
    return joinDesktopUrl(frontendOrigin, route)
}

function applyNavigationGuard(webContents) {
    webContents.setWindowOpenHandler(({ url }) => {
        if (isSafeExternalUrl(url)) {
            shell.openExternal(url)
        }
        return { action: 'deny' }
    })

    webContents.on('will-navigate', (event, url) => {
        if (!frontendOrigin) {
            event.preventDefault()
            return
        }
        const urlOrigin = (() => { try { return new URL(url).origin } catch { return '' } })()
        if (urlOrigin === frontendOrigin) return
        event.preventDefault()
        if (isSafeExternalUrl(url)) {
            shell.openExternal(url)
        }
    })
}

function getReminderBounds() {
    const display = screen.getPrimaryDisplay()
    const { x, y, width } = display.workArea
    const reminderWidth = Math.max(80, Math.round(REMINDER_WIDTH * REMINDER_SCALE))
    const reminderHeight = Math.max(55, Math.round(REMINDER_HEIGHT * REMINDER_SCALE))
    return {
        x: x + width - reminderWidth - 20,
        y: y + 72,
        width: reminderWidth,
        height: reminderHeight
    }
}

function showMainWindow(route = '/pages/desktop/home') {
    if (!mainWindow) return
    hideReminderWindow()
    const targetUrl = getAppEntryUrl(route)
    if (mainWindow.webContents.getURL() !== targetUrl) {
        mainWindow.loadURL(targetUrl)
    }
    if (!mainWindow.isVisible()) {
        mainWindow.show()
    }
    if (mainWindow.isMinimized()) {
        mainWindow.restore()
    }
    mainWindow.focus()
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        minWidth: 440,
        minHeight: 580,
        show: false,
        title: 'Cloud PC Assistant',
        backgroundColor: '#eef3f8',
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            webSecurity: true
        }
    })

    mainWindow.setMenuBarVisibility(false)
    mainWindow.removeMenu()
    mainWindow.setAutoHideMenuBar(true)

    applyNavigationGuard(mainWindow.webContents)

    mainWindow.on('close', (event) => {
        if (isQuitting) return
        event.preventDefault()
        mainWindow.hide()
    })

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    showMainWindow('/pages/desktop/home')
}

function createReminderWindow() {
    if (reminderWindow) return reminderWindow

    const reminderWidth = Math.max(80, Math.round(REMINDER_WIDTH * REMINDER_SCALE))
    const reminderHeight = Math.max(55, Math.round(REMINDER_HEIGHT * REMINDER_SCALE))

    reminderWindow = new BrowserWindow({
        width: reminderWidth,
        height: reminderHeight,
        minWidth: reminderWidth,
        minHeight: reminderHeight,
        frame: false,
        resizable: false,
        maximizable: false,
        minimizable: false,
        skipTaskbar: true,
        show: false,
        alwaysOnTop: true,
        backgroundColor: '#ffffff',
        title: 'Cloud PC Assistant Reminder',
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            webSecurity: true
        }
    })

    reminderWindow.setMenuBarVisibility(false)
    reminderWindow.removeMenu()
    reminderWindow.setAutoHideMenuBar(true)
    reminderWindow.setAlwaysOnTop(true, 'screen-saver')
    reminderWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    reminderWindow.setBounds(getReminderBounds())
    reminderWindow.loadURL(getAppEntryUrl('/pages/desktop/reminder'))

    applyNavigationGuard(reminderWindow.webContents)

    if (shouldHideOnBlur) {
        reminderWindow.on('blur', () => {
            if (reminderWindow && !reminderWindow.webContents.isDevToolsOpened()) {
                reminderWindow.hide()
            }
        })
    }

    reminderWindow.on('close', (event) => {
        if (isQuitting) return
        event.preventDefault()
        reminderWindow.hide()
    })

    reminderWindow.on('closed', () => {
        reminderWindow = null
    })

    return reminderWindow
}

function showReminderWindow() {
    const window = createReminderWindow()
    if (mainWindow && mainWindow.isVisible()) {
        mainWindow.hide()
    }
    window.setBounds(getReminderBounds())
    if (!window.isVisible()) {
        window.show()
    }
    if (shouldHideOnBlur) {
        window.focus()
    }
    return window
}

function hideReminderWindow() {
    if (reminderWindow) {
        reminderWindow.hide()
    }
}

module.exports = {
    setFrontendOrigin,
    setIsQuitting,
    getMainWindow,
    getReminderWindow,
    createMainWindow,
    showMainWindow,
    createReminderWindow,
    showReminderWindow,
    hideReminderWindow
}
