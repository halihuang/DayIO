const {app, BrowserWindow} = require('electron');
const path = require('path');


let mainWindow;

const createWindow = async () => {
  let loading = new BrowserWindow({
    show: false,
     frame: false,
   });

  loading.once('show', () => {
    const mainWindow = new BrowserWindow({
      show:false,
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true
      }
    });

    mainWindow.webContents.once('dom-ready', () => {
      setTimeout(() => {
        console.log('main loaded');
        mainWindow.show();
        loading.hide();
        loading.close();
      }, 3000);

    })
    // long loading html
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  });

  loading.loadURL(path.join(__dirname, 'loading.html'));
  loading.show();

  // mainWindow.on('ready-to-show', () => {
  //   mainWindow.show();
  // });
  // loading.on('closed', () => {
  //   loading = undefined;
  // })
  //
  // mainWindow.on('closed', () => {
  //   mainWindow = undefined;
  // });

  return mainWindow;
}

if(!app.requestSingleInstanceLock()){
  app.quit();
}

app.on('second-instance', () => {
  if (mainWindow){
    if(mainWindow.isMinimized()){
      mainWindow.restore();
    }
    mainWindow.show();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', async () => {
  if(!mainWindow){
    mainWindow = await createWindow();
  }
});

(async () => {
  await app.whenReady();
  mainWindow = await createWindow();
})();
