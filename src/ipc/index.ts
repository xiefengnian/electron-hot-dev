import { ipcMain } from 'electron';
import bw from 'browserWindow';

ipcMain.on('ipc_test', () => {
  bw.webContents.send('ipc_test', 11);
});

ipcMain.handle('ipc_test', () => {
  return 1111;
});
