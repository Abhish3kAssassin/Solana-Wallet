const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Optional
    },
  });

  // Load React app
  const startUrl = `file://${path.join(__dirname, 'build', 'index.html')}`;
  mainWindow.loadURL(startUrl);
});
