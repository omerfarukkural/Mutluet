const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_DEV === 'true';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../public/pwa-512x512.png'),
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in the default browser, not in Electron
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      shell.openExternal(targetUrl);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Security: Prevent navigation to unexpected URLs
app.on('web-contents-created', (_event, contents) => {
  const distPath = path.join(__dirname, '../dist');

  contents.on('will-navigate', (event, navigationUrl) => {
    let allowed = false;

    if (isDev && navigationUrl.startsWith('http://localhost:5173')) {
      allowed = true;
    } else if (!isDev && navigationUrl.startsWith('file://')) {
      try {
        const filePath = new URL(navigationUrl).pathname;
        allowed = filePath.startsWith(distPath);
      } catch {
        allowed = false;
      }
    }

    if (!allowed) {
      event.preventDefault();
    }
  });
});
