module.exports = (context) =>
  ((require) => {
    const { app, ipcMain } = require('electron');
    const bw = require('browserWindow');
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    bw.loadURL('http://github.com');

    bw.openDevTools();

    console.log(fs.readdirSync(path.join(os.homedir(), 'learn')));

    require('./test_util');

    let handler = (event, ...args) => {
      console.log(`ipcMain on test`, ...args);
    };

    ipcMain.on('test', handler);
  })((moduleId) => {
    if (context[moduleId]) {
      return context[moduleId];
    }
    return require(moduleId);
  });
