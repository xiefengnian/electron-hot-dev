import { ipcMain } from 'electron';

import u from './utils';

const bw = getBrowserWindowRuntime();

console.log({ u });
u();

bw.webContents.openDevTools();

ipcMain.on('test', (e, ...args) => {
  console.log('on test', ...args);
});
