'use strict';
const {app, BrowserWindow, Menu, shell, screen} = require('electron');
const path = require('path');

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

if (isMac) {
  // TODO
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { role: 'appMenu' },
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    { role: 'help' }
  ]));
} else {
  Menu.setApplicationMenu(null);
}

const isSafeOpenExternal = (url) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
  } catch (e) {
    // ignore
  }
  return false;
};

const createWindow = () => {
  const options = {
    width: 480,
    height: 360,
    useContentSize: true,
    minWidth: 50,
    minHeight: 50,
    icon: path.resolve('icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    show: false,
    backgroundColor: "#000000"
  };

  const activeScreen = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const bounds = activeScreen.workArea;
  options.x = bounds.x + ((bounds.width - options.width) / 2);
  options.y = bounds.y + ((bounds.height - options.height) / 2);

  const window = new BrowserWindow(options);
  window.once('ready-to-show', () => {
    window.show();
  });
  window.loadFile('../../index.html');
};

const acquiredLock = app.requestSingleInstanceLock();
if (acquiredLock) {
  app.enableSandbox();

  app.on('web-contents-created', (event, contents) => {
    // TODO: new-window is deprecated
    contents.on('new-window', (e, url) => {
      e.preventDefault();
      if (isSafeOpenExternal(url)) {
        shell.openExternal(url);
      }
    });
    contents.on('will-navigate', (e, url) => {
      e.preventDefault();
      if (isSafeOpenExternal(url)) {
        shell.openExternal(url);
      }
    });
  });

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('second-instance', () => {
    createWindow();
  });

  app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
} else {
  app.quit();
}
