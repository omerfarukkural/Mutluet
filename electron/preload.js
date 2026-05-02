// Preload script – exposes a minimal, safe API to the renderer process.
// Do NOT expose require/fs/path or other Node.js modules here.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development',
  // Add additional safe IPC channels here as the app grows
});
