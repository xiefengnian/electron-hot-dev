import { ipcRenderer, contextBridge } from 'electron';

ipcRenderer.on('ipc_test', (e, ...args) => {
  console.log(`receive ipc_test`, ...args);
});

contextBridge.exposeInMainWorld('$api', {
  test: () => {
    ipcRenderer.send('test', '1');
  },
  test1: () => {
    ipcRenderer.send('ipc_test', '1');
  },
  test2: () => {
    ipcRenderer.invoke('ipc_test', '1').then((res) => {
      console.log(res);
    });
  },
  test3: () => {
    ipcRenderer.send('test_utils', '1');
  },
});
