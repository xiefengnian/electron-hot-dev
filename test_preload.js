const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('$api', {
  test: () => {
    ipcRenderer.send('test', 111);
  },
});
