import { BrowserWindow } from 'electron';

declare global {
  function getBrowserWindowRuntime(): BrowserWindow;
}
