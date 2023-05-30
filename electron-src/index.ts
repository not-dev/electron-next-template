// Native
// Packages
import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import isDev from 'electron-is-dev'
import prepareNext from 'electron-next'
import Store from 'electron-store'
import { join } from 'path'
import { format } from 'url'

type StoreType = {
  x?: number
  y?: number
  width?: number
  height?: number
  maximized?: boolean
};

const store = new Store<StoreType>({
  configFileMode: 0o644,
  defaults: {
    x: undefined,
    y: undefined,
    width: 800,
    height: 640,
    maximized: false
  }
})

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer')

  const win = new BrowserWindow({
    show: false,
    x: store.get('x'),
    y: store.get('y'),
    width: store.get('width'),
    height: store.get('height'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      preload: join(__dirname, 'preload.js')
    }
  })
  if (store.get('maximized')) {
    win.maximize()
  }
  win.setMenuBarVisibility(false)
  win.show()

  const url = isDev
    ? 'http://localhost:8000/'
    : format({
      pathname: join(__dirname, '../renderer/out/index.html'),
      protocol: 'file:',
      slashes: true
    })

  win.loadURL(url)

  win.once('close', () => {
    const { x, y, width, height } = win.getBounds()
    const isMaximized = win.isMaximized()
    if (isMaximized) {
      store.set({ maximized: isMaximized })
    } else {
      store.set({ x, y, width, height, maximized: isMaximized })
    }
  })
})

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit)

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on('message', (event: IpcMainEvent, message: any) => {
  console.log(message)
  setTimeout(() => event.sender.send('message', 'hi from electron'), 500)
})
