const { ipcMain, app, shell } = require('electron')
const { isSafeExternalUrl } = require('./constants')
const { getMainWindow, showMainWindow, showReminderWindow, hideReminderWindow } = require('./windows')

function registerIpcHandlers() {
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
        const mainWindow = getMainWindow()
        if (mainWindow) {
            mainWindow.reload()
        }
        return true
    })
}

module.exports = { registerIpcHandlers }
