const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // File dialogs
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    openFiles: () => ipcRenderer.invoke('dialog:openFiles'),
    openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
    saveFile: (defaultPath) => ipcRenderer.invoke('dialog:saveFile', defaultPath),

    // File I/O
    readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
    savePNG: (filePath, base64Data) => ipcRenderer.invoke('fs:savePNG', filePath, base64Data),
    listImages: (folderPath) => ipcRenderer.invoke('fs:listImages', folderPath),

    // Window controls
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close')
});
