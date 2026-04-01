const { app, BrowserWindow, Menu, Tray, ipcMain, shell, nativeImage, screen } = require('electron')
const fs = require('fs')
const http = require('http')
const path = require('path')

const WINDOW_WIDTH = 480
const WINDOW_HEIGHT = 682
const REMINDER_WIDTH = 160
const REMINDER_HEIGHT = 110
const APP_BASE_PATH = '/mobile/'
const DEV_URL = process.env.FRONTEND_DEV_URL || ''

let mainWindow = null
let reminderWindow = null
let tray = null
let frontendServer = null
let frontendOrigin = ''
let isQuitting = false

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit()
}

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

function createStaticServer() {
    const frontendDir = app.isPackaged
        ? path.join(process.resourcesPath, 'frontend')
        : path.resolve(__dirname, '../dist')

    if (!fs.existsSync(frontendDir)) {
        throw new Error(`Frontend build not found: ${frontendDir}`)
    }

    const server = http.createServer((req, res) => {
        const incomingUrl = new URL(req.url || APP_BASE_PATH, 'http://127.0.0.1')
        const pathname = decodeURIComponent(incomingUrl.pathname)
        let filePath = pathname.startsWith(APP_BASE_PATH)
            ? pathname.slice(APP_BASE_PATH.length)
            : pathname.replace(/^\/+/, '')

        if (!filePath || pathname.endsWith('/')) {
            filePath = 'index.html'
        }

        let resolvedPath = path.resolve(frontendDir, filePath)
        const relativePath = path.relative(frontendDir, resolvedPath)
        if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
            res.writeHead(403)
            res.end('Forbidden')
            return
        }

        if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
            resolvedPath = path.join(frontendDir, 'index.html')
        }

        const ext = path.extname(resolvedPath).toLowerCase()
        const contentTypeMap = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.svg': 'image/svg+xml',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2'
        }

        fs.readFile(resolvedPath, (error, buffer) => {
            if (error) {
                res.writeHead(500)
                res.end('Internal Server Error')
                return
            }

            res.writeHead(200, {
                'Content-Type': contentTypeMap[ext] || 'application/octet-stream',
                'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
            })
            res.end(buffer)
        })
    })

    return new Promise((resolve, reject) => {
        server.once('error', reject)
        server.listen(0, '127.0.0.1', () => {
            const address = server.address()
            frontendOrigin = `http://127.0.0.1:${address.port}`
            resolve(server)
        })
    })
}

function getAppEntryUrl(route = '/pages/desktop/home') {
    if (DEV_URL) {
        return joinDesktopUrl(DEV_URL, route)
    }

    if (!frontendOrigin) {
        throw new Error('Frontend origin is not ready')
    }

    return joinDesktopUrl(frontendOrigin, route)
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

function getReminderBounds() {
    const display = screen.getPrimaryDisplay()
    const { x, y, width } = display.workArea
    return {
        x: x + width - REMINDER_WIDTH - 20,
        y: y + 72,
        width: REMINDER_WIDTH,
        height: REMINDER_HEIGHT
    }
}

function createReminderWindow() {
    if (reminderWindow) return reminderWindow

    reminderWindow = new BrowserWindow({
        width: REMINDER_WIDTH,
        height: REMINDER_HEIGHT,
        minWidth: 140,
        minHeight: 90,
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
            preload: path.join(__dirname, 'preload.js'),
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

    reminderWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (isSafeExternalUrl(url)) {
            shell.openExternal(url)
        }
        return { action: 'deny' }
    })

    reminderWindow.webContents.on('will-navigate', (event, url) => {
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
    return window
}

function hideReminderWindow() {
    if (reminderWindow) {
        reminderWindow.hide()
    }
}

function createTray() {
    tray = new Tray(getTrayIcon())
    tray.setToolTip('Cloud PC Assistant')

    const template = [
        { label: 'Open Workbench', click: () => showMainWindow('/pages/desktop/home') },
        { label: 'Open Reminder', click: () => showReminderWindow() },
        { label: 'Resources', click: () => showMainWindow('/pages/cloud/resources') },
        { label: 'Orders', click: () => showMainWindow('/pages/cloud/orders') },
        { label: 'Notifications', click: () => showMainWindow('/pages/cloud/notifications') },
        { type: 'separator' },
        { label: 'Exit', click: () => app.quit() }
    ]

    tray.setContextMenu(Menu.buildFromTemplate(template))
    tray.on('double-click', () => showMainWindow('/pages/desktop/home'))
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
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            webSecurity: true
        }
    })

    mainWindow.setMenuBarVisibility(false)
    mainWindow.removeMenu()
    mainWindow.setAutoHideMenuBar(true)

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (isSafeExternalUrl(url)) {
            shell.openExternal(url)
        }
        return { action: 'deny' }
    })

    mainWindow.webContents.on('will-navigate', (event, url) => {
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

ipcMain.handle('desktop:get-context', () => ({
    isDesktop: true,
    platform: process.platform,
    version: app.getVersion(),
    appName: app.getName()
}))

ipcMain.handle('desktop:open-external', async (_event, url) => {
    if (!isSafeExternalUrl(url)) {
        return false
    }
    await shell.openExternal(url)
    return true
})

ipcMain.handle('desktop:navigate', async (_event, route) => {
    showMainWindow(route)
    return true
})

ipcMain.handle('desktop:show-reminder', async () => {
    showReminderWindow()
    return true
})

ipcMain.handle('desktop:hide-reminder', async () => {
    hideReminderWindow()
    return true
})

ipcMain.handle('desktop:reload', async () => {
    if (mainWindow) {
        mainWindow.reload()
    }
    return true
})

app.on('second-instance', () => {
    showMainWindow('/pages/desktop/home')
})

app.whenReady().then(async () => {
    if (!DEV_URL) {
        frontendServer = await createStaticServer()
    } else {
        frontendOrigin = DEV_URL.replace(/\/$/, '')
    }
    createMainWindow()
    createTray()
})

app.on('before-quit', () => {
    isQuitting = true
    if (reminderWindow) {
        reminderWindow.destroy()
        reminderWindow = null
    }
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
        return
    }
    showMainWindow('/pages/desktop/home')
})

app.on('quit', () => {
    if (frontendServer) {
        frontendServer.close()
    }
})
