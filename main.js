const {app, BrowserWindow} = require('electron');
const path = require('path');


let mainWindow;

const createWindow = async () => {
  const window = new BrowserWindow({
    show:false,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  window.on('ready-to-show', () => {
    window.show();
  });

  window.on('closed', () => {
    mainWindow = undefined;
  });

  await window.loadFile(path.join(__dirname, 'index.html'));

  return window;
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
