const { app, Menu, Tray } = require('electron')
const { getTrayIcon } = require('./constants')
const { showMainWindow, showReminderWindow } = require('./windows')

function createTray() {
    const tray = new Tray(getTrayIcon())
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

    return tray
}

module.exports = { createTray }
