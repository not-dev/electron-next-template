"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Native
// Packages
const electron_1 = require("electron");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const electron_next_1 = __importDefault(require("electron-next"));
const electron_store_1 = __importDefault(require("electron-store"));
const path_1 = require("path");
const url_1 = require("url");
const store = new electron_store_1.default({
    configFileMode: 0o644,
    defaults: {
        x: undefined,
        y: undefined,
        width: 800,
        height: 640,
        maximized: false
    }
});
// Prepare the renderer once the app is ready
electron_1.app.on('ready', async () => {
    await (0, electron_next_1.default)('./renderer');
    const win = new electron_1.BrowserWindow({
        show: false,
        x: store.get('x'),
        y: store.get('y'),
        width: store.get('width'),
        height: store.get('height'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: false,
            preload: (0, path_1.join)(__dirname, 'preload.js')
        }
    });
    if (store.get('maximized')) {
        win.maximize();
    }
    win.setMenuBarVisibility(false);
    win.show();
    const url = electron_is_dev_1.default
        ? 'http://localhost:8000/'
        : (0, url_1.format)({
            pathname: (0, path_1.join)(__dirname, '../renderer/out/index.html'),
            protocol: 'file:',
            slashes: true
        });
    win.loadURL(url);
    win.once('close', () => {
        const { x, y, width, height } = win.getBounds();
        const isMaximized = win.isMaximized();
        if (isMaximized) {
            store.set({ maximized: isMaximized });
        }
        else {
            store.set({ x, y, width, height, maximized: isMaximized });
        }
    });
});
// Quit the app once all windows are closed
electron_1.app.on('window-all-closed', electron_1.app.quit);
// listen the channel `message` and resend the received message to the renderer process
electron_1.ipcMain.on('message', (event, message) => {
    console.log(message);
    setTimeout(() => event.sender.send('message', 'hi from electron'), 500);
});
