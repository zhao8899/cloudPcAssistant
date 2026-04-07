const { app, BrowserWindow } = require('electron')
const { DEV_URL } = require('./modules/constants')
const { createStaticServer } = require('./modules/static-server')
const {
    setFrontendOrigin, setIsQuitting,
    createMainWindow, showMainWindow,
    getReminderWindow
} = require('./modules/windows')
const { createTray } = require('./modules/tray')
const { registerIpcHandlers } = require('./modules/ipc')

let frontendServer = null

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit()
}

app.on('second-instance', () => showMainWindow('/pages/desktop/home'))

app.whenReady().then(async () => {
    if (DEV_URL) {
        setFrontendOrigin(DEV_URL.replace(/\/$/, ''))
    } else {
        const { server, origin } = await createStaticServer()
        frontendServer = server
        setFrontendOrigin(origin)
    }

    registerIpcHandlers()
    createMainWindow()
    createTray()
})

app.on('before-quit', () => {
    setIsQuitting(true)
    const reminder = getReminderWindow()
    if (reminder) {
        reminder.destroy()
    }
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
        return
    }
    showMainWindow('/pages/desktop/home')
})

app.on('quit', () => {
    if (frontendServer) frontendServer.close()
})
