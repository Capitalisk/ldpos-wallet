'use strict';

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  Menu,
  shell,
  dialog,
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import fs from 'fs';
import defaultConfig from './config.json';
import { CONFIG_FILE_PATH, CONFIG_PATH } from './constants';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

const setMainMenu = () => {
  const template = [
    {
      label: 'External links',
      submenu: [
        {
          label: 'Github',
          accelerator: 'Shift+CmdOrCtrl+G',
          click: () =>
            shell.openExternal('http://www.github.com/Capitalisk/ldpos-wallet'),
        },
        {
          label: 'Discord',
          accelerator: 'Shift+CmdOrCtrl+D',
          click: () =>
            shell.openExternal('http://www.github.com/Capitalisk/ldpos-wallet'),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    title: 'LDPoS Wallet',
    fullscreenWindowTitle: 'LDPoS Wallet',
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
    },
  });

  win.maximize();

  setMainMenu();

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }

  // Create config file if it doesn't exist
  const createConfig = () => {
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
      fs.mkdir(CONFIG_PATH, { recursive: true }, err => {
        if (err) console.error(err);
        fs.writeFile(
          CONFIG_FILE_PATH,
          JSON.stringify(defaultConfig, null, 2),
          err => {
            if (err) console.error(err);
          },
        );
      });
    }
  };

  createConfig();

  // Events
  ipcMain.handle('get-config', () => {
    return new Promise((res, rej) => {
      fs.readFile(CONFIG_FILE_PATH, (err, data) => {
        if (err) rej(err);
        res(Buffer.from(data, 'base64').toString('utf8'));
      });
    });
  });

  ipcMain.handle('save-config', (event, config) => {
    createConfig();
    console.log(`Trying to save file ${config}`);
    return new Promise((res, rej) => {
      fs.writeFile(CONFIG_FILE_PATH, config, err => {
        if (err) rej(err);
        res({ message: 'File saved!' });
      });
    });
  });

  ipcMain.handle('warn-overwrite', async () => {
    const response = await dialog.showMessageBox(null, {
      message: 'Config entry already exists, do you want to overwrite it?',
      type: 'warning',
      buttons: ['Overwrite', 'Cancel'],
      defaultId: 0,
      cancelId: 1,
    });

    // Picks the index of the response
    return response.response === 0 ? true : false;
  });

  ipcMain.handle('delete-config', () => {
    return new Promise((res, rej) => {
      console.log(removeFile);
      // TODO: This doesn't work for some reason...
      fs.rm(CONFIG_FILE_PATH, err => {
        if (err) rej(err);
        res();
      });
    });
  });

  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
