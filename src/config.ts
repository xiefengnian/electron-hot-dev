import type { BrowserWindowConstructorOptions } from 'electron';

type Config = {
  browserWindow: BrowserWindowConstructorOptions;
};

function defineInitConfig(config: Config): Config {
  return config;
}

export default defineInitConfig({
  browserWindow: {
    webPreferences: {
      preload: 'preload.ts',
    },
  },
});
