const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktopBridge', {
    isDesktop: true,
    getContext: () => ipcRenderer.invoke('desktop:get-context'),
    openExternal: (url) => ipcRenderer.invoke('desktop:open-external', url),
    reloadDesktop: () => ipcRenderer.invoke('desktop:reload'),
    openTrayRoute: (route) => ipcRenderer.invoke('desktop:navigate', route),
    showReminderWindow: () => ipcRenderer.invoke('desktop:show-reminder'),
    hideReminderWindow: () => ipcRenderer.invoke('desktop:hide-reminder')
})
