// const fs = require('fs');
// const path = require('path');
// const config = require(join(__dirname, './dist/config.js')).default || {};

// console.log(__dirname);

// let userPreloadPath;

// if (config?.browserWindow?.webPreferences?.preload) {
//   userPreloadPath = join(__dirname, './dist', config.browserWindow.webPreferences.preload).replace(
//     /\.ts$/,
//     '.js',
//   );

//   console.log({ userPreloadPath });

//   const requirePreload = () => {
//     let preload = require(userPreloadPath);

//     if (typeof preload.default === 'function') {
//       preload();
//     }
//   };

//   fs.watchFile(userPreloadPath, () => {
//     decache(userPreloadPath);
//     requirePreload();
//   });
// }

const e = require('electron');
const { contextBridge, ipcRenderer } = e;

ipcRenderer.on('ipc_test', () => {
  console.log(`receive ipc_test`);
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
});
