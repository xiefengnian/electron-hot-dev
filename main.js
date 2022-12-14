const proc = require('child_process');
const electron = require('electron');
const fs = require('fs');
const chokidar = require('chokidar');
const babel = require('@babel/core');
const { join, parse } = require('path');
const glob = require('glob');

const initAllFile = new Set();

const createContextProvider = (content, filepath) => `
"use strict";
module.exports = (context) => {
  if(context.electron.ipcMain.on._hof) {
    context.electron.ipcMain.on = context.electron.ipcMain.on("${filepath}");
    context.electron.ipcMain.handle = context.electron.ipcMain.handle("${filepath}");
  }

  return ((require, getBrowserWindowRuntime) => {
    const exports = {};
    \n
    ${content.trim().replace(/"use strict";/g, '')}
    \n
    return exports;
  })((moduleId) => {
    const __require = require;
    if (context[moduleId]) {
      return context[moduleId];
    }
    if(moduleId.startsWith('.')) {
      return __require(moduleId)(context);
    }
    return __require(moduleId);
  },()=>context.browserWindow)
};
`;

glob.sync('src/**/*', { cwd: __dirname }).forEach((filepath) => {
  if (fs.statSync(filepath).isFile()) {
    initAllFile.add(join(process.cwd(), filepath));
  }
});

const outputDir = join(process.cwd(), 'dist');
const srcDir = join(process.cwd(), './src');

const transformFile = (filepath, srcDir, toDir) => {
  const { base, ext, dir, name } = parse(filepath);

  const basePath = dir.replace(srcDir, '');

  let needProvider = false;

  if (['.js', '.ts'].includes(ext)) {
    if (!['preload', 'config'].includes(name)) {
      needProvider = true;
    }
  }

  if (/\.(js|ts|mjs)$/.test(ext)) {
    const { code } = babel.transformFileSync(filepath, {
      presets: ['@babel/preset-env', '@babel/preset-typescript'],
      plugins: [],
    });

    const outputDir = join(toDir, basePath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFilename = join(outputDir, `${name}.js`);

    fs.writeFileSync(
      outputFilename,
      needProvider ? createContextProvider(code, outputFilename) : code
    );
  } else {
    fs.copyFileSync(filepath, join(toDir, basePath, base));
  }
};

const startApp = () => {
  const electronProcess = proc.spawn(electron, [process.cwd()], {
    stdio: 'pipe',
    env: {
      ...process.env,
      FORCE_COLOR: '1',
    },
    cwd: process.cwd(),
  });

  electronProcess.stdout.pipe(process.stdout);
  electronProcess.stderr.pipe(process.stderr);
};

chokidar
  .watch(join(join(__dirname, './src')))
  .on('add', (path) => {
    if (initAllFile.has(path)) {
      console.log(`[init] ${path}`);
      initAllFile.delete(path);
      if (initAllFile.size === 0) {
        startApp();
      }
    } else {
      console.log(`[add] ${path}`);
    }

    transformFile(path, srcDir, outputDir);
  })
  .on('change', (path) => {
    console.log(`[change] ${path}`);
    transformFile(path, srcDir, outputDir);
  });
