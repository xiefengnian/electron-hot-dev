const electron = require('electron');
const { join } = require('path');

const index = require('./test_require');

electron.app.on('ready', () => {
  const context = { browserWindow: null };

  const browserWindow = new electron.BrowserWindow({
    webPreferences: {
      preload: join(__dirname, './test_preload.js'),
    },
  });

  const _ipcMain = electron.ipcMain;

  const _ipcMainOnMap = {};
  const _ipcHandleMap = {};

  context.electron = {
    ...electron,
    ipcMain: {
      ..._ipcMain,
      on: (channel, listener) => {
        _ipcMainOnMap[channel] = listener;
        _ipcMain.on(channel, listener);
      },
      handle: (channel, listener) => {
        _ipcHandleMap[channel] = listener;
        return _ipcMain.handle(channel, listener);
      },
    },
  };

  context.browserWindow = browserWindow;

  index(context);

  Object.keys(_ipcMainOnMap).forEach((channel) => {
    _ipcMain.removeListener(channel, _ipcMainOnMap[channel]);
  });
  Object.keys(_ipcHandleMap).forEach((channel) => {
    _ipcMain.removeHandler(channel, _ipcHandleMap[channel]);
  });
});
