import * as electron from 'electron';

export const a = () => {
  console.log('utils export default');
};

export default () => {
  console.log('utils export default');
};

electron.ipcMain.on('test_utils', () => {
  console.log('on test_utils 3');
});
