import { ipcMain } from 'electron';

import bw from 'browserWindow';

bw.openDevTools();

ipcMain.on('test', (e, ...args) => {
  console.log('on test', ...args);
});
