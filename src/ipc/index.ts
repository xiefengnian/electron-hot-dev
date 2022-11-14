import { ipcMain } from 'electron';
const bw = getBrowserWindowRuntime();

ipcMain.on('ipc_test', () => {
  bw.webContents.send('ipc_test', 11);
});

ipcMain.handle('ipc_test', () => {
  return 2;
});
