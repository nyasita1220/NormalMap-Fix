const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 860,
        height: 600,
        minWidth: 660,
        minHeight: 480,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        resizable: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');
}

// IPC handlers
ipcMain.handle('dialog:openFile', async () => {
    const r = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Normal Map',
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'tga', 'tiff', 'tif'] }],
        properties: ['openFile']
    });
    return r.canceled ? null : r.filePaths[0];
});

ipcMain.handle('dialog:openFiles', async () => {
    const r = await dialog.showOpenDialog(mainWindow, {
        title: 'Add Normal Maps',
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'tga', 'tiff', 'tif'] }],
        properties: ['openFile', 'multiSelections']
    });
    return r.canceled ? [] : r.filePaths;
});

ipcMain.handle('dialog:openFolder', async () => {
    const r = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Folder',
        properties: ['openDirectory']
    });
    return r.canceled ? null : r.filePaths[0];
});

ipcMain.handle('dialog:saveFile', async (_, defaultPath) => {
    const r = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Converted',
        defaultPath: defaultPath,
        filters: [{ name: 'PNG', extensions: ['png'] }]
    });
    return r.canceled ? null : r.filePath;
});

ipcMain.handle('fs:savePNG', async (_, filePath, base64Data) => {
    const buffer = Buffer.from(base64Data, 'base64');
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, buffer);
    return true;
});

ipcMain.handle('fs:readFile', async (_, filePath) => {
    return fs.readFileSync(filePath).toString('base64');
});

ipcMain.handle('fs:listImages', async (_, folderPath) => {
    const exts = new Set(['.png', '.jpg', '.jpeg', '.bmp', '.tga', '.tiff', '.tif']);
    return fs.readdirSync(folderPath)
        .filter(f => exts.has(path.extname(f).toLowerCase()))
        .map(f => path.join(folderPath, f));
});

ipcMain.on('window:minimize', () => mainWindow.minimize());
ipcMain.on('window:maximize', () => {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('window:close', () => mainWindow.close());

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
