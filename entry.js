const electron = require('electron');
const fs = require('fs');
const path = require('path');
const decache = require('clear-module');
const { join } = require('path');
const { getConfig } = require('./utils');
const _ = require('lodash');

const mPath = path.join(__dirname, './dist/index.js');

let m = require(mPath);

const config = getConfig();

const main = async () => {
  const context = { browserWindow: null, electron: electron };

  const _config = _.merge({
    ...(config.browserWindow || {}),
    ...{
      webPreferences: {
        preload: join(__dirname, './dist/preload.js'),
      },
    },
  });

  const _ipcMain = electron.ipcMain;

  /**
   * {
   *   [filepath] : {
   *    channels: string[], // channels可能会重复，使用对应关系避免冲突
   *    listeners: function[],
   *   }
   * }
   */
  const _ipcMainOnMap = {};
  const _ipcHandleMap = {};

  const hackContext = (_context) => {
    _context.electron = {
      ...electron,
      ipcMain: {
        ..._ipcMain,
        on: (filepath) => (channel, listener) => {
          if (!_ipcMainOnMap[filepath]) {
            _ipcMainOnMap[filepath] = {
              channels: [],
              listeners: [],
            };
          }
          _ipcMainOnMap[filepath].channels.push(channel);
          _ipcMainOnMap[filepath].listeners.push(listener);
          _ipcMain.on(channel, listener);
        },
        handle: (filepath) => (channel, listener) => {
          if (!_ipcHandleMap[filepath]) {
            _ipcHandleMap[filepath] = {
              channels: [],
              listeners: [],
            };
          }
          _ipcHandleMap[filepath].channels.push(channel);
          _ipcHandleMap[filepath].listeners.push(listener);
          return _ipcMain.handle(channel, listener);
        },
      },
      __hack: true,
    };
    return _context;
  };

  context.browserWindow = new electron.BrowserWindow(_config);

  await context.browserWindow.loadFile('./index.html');

  m.call(this, hackContext(context));

  const clearEvents = (filepath) => {
    if (_ipcMainOnMap[filepath]) {
      const { channels, listeners } = _ipcMainOnMap[filepath];
      channels.forEach((channel, index) => {
        _ipcMain.removeListener(channel, listeners[index]);
      });
      _ipcMainOnMap[filepath] = undefined;
    }
    if (_ipcHandleMap[filepath]) {
      const { channels, listeners } = _ipcHandleMap[filepath];
      channels.forEach((channel, index) => {
        _ipcMain.removeHandler(channel, listeners[index]);
      });
      _ipcHandleMap[filepath] = undefined;
    }
  };

  fs.watchFile(mPath, () => {
    // clear events start
    clearEvents(mPath);
    // clear events end
    decache(mPath);
    m = require(mPath);
    m.call(this, hackContext(context));
  });

  fs.watchFile(_config.webPreferences.preload, () => {
    context.browserWindow.reload();
  });

  // ipc

  fs.readdirSync(join(__dirname, './dist/ipc')).forEach((file) => {
    const ipcFilepath = join(__dirname, './dist/ipc', file);

    let ipc = require(ipcFilepath);

    ipc.call(this, hackContext(context));

    fs.watch(ipcFilepath, () => {
      // clear events start
      clearEvents(ipcFilepath);
      // clear events end

      decache(ipcFilepath);
      ipc = require(ipcFilepath);
      ipc.call(this, hackContext(context));
    });
  });
};

electron.app.on('ready', () => {
  main();
});
