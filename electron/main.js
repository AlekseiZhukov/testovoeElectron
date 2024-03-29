const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
//const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
const { download } = require('electron-dl');

let mainWindow;

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title:"download files",
        //frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule:true,
            contextIsolation: false,

        }
    });
    mainWindow.setMenu(null);

    //load the index.html from a url
    mainWindow.loadURL('http://localhost:3000/');

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();
    //installExtension(REACT_DEVELOPER_TOOLS);

});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.

    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('download', async (event, {payload}) => {
    if (payload.url) {
        const defaultPath = app.getPath( 'downloads');
        const defaultFileName = payload.url.split('/').pop();
        let customURL = dialog.showSaveDialogSync(mainWindow,{
            defaultPath: `${defaultPath}/${defaultFileName}`
        })

        if (customURL) {
            let filePath = customURL.split('\\');
            let filename = `${filePath.pop()}`;
            let directory = filePath.join('/');
            const properties = {directory, filename};

            await download(BrowserWindow.getFocusedWindow(), payload.url, {
                ...properties,
                onCompleted: item => {
                    mainWindow.webContents.send('download-complete', item)
                }
            })
        }
    }
})

ipcMain.on('openFile', (event, {path}) => {
    shell.showItemInFolder(path)
})
