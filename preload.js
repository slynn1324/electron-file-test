const { contextBridge, ipcRenderer } = require('electron')

// this exposes an API into the renderer context, under the name 'electron'
contextBridge.exposeInMainWorld('electron', {
    log: (msg) => ipcRenderer.send('log', msg),
    open: () => ipcRenderer.invoke('open'),
    save: (data) => ipcRenderer.invoke('save', data)
});




