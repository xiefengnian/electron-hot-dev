import { ipcMain } from 'electron';
import bw from 'browserWindow';

ipcMain.on('ipc_test', () => {
  bw.webContents.send('ipc_test', 111);
});

ipcMain.handle('ipc_test', () => {
  return 3;
});
