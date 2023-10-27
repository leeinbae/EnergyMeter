import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import getUsers, {getUsage} from './database'
import fs from "fs"

const isProd = process.env.NODE_ENV === 'production'
let existingSqliteFile;

if (isProd) {
  serve({ directory: 'app' })
  existingSqliteFile = fs.readFileSync(path.join(process.resourcesPath, './database.db'));
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
  existingSqliteFile = fs.readFileSync(path.join(__dirname, '../database.db'));
}

const userDataDirectory = app.getPath("userData");
console.log('app.getPath userData:',app.getPath('userData'))
console.log('__dirname:',__dirname)
console.log('process.resourcesPath:',process.resourcesPath)
console.log('path.join__dirname+database.db:',path.join(__dirname, '../database.db'))
fs.writeFileSync(`${userDataDirectory}/database.db`, existingSqliteFile);

;(async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})


ipcMain.on('db', async (event, arg) => {

    switch (arg) {
    case 'getUsers':
      console.log("getUsers");
      getUsers().then((rows) => {
        event.reply('db', rows)
      })
      break;
    case 'getUsage':
      console.log("getUsage");
      getUsage().then((rows) => {
        event.reply('db', rows)
        })
      break;
    case 3:
      console.log("Three");
      break;
    default:
      console.log("Unknown");
    }

})