import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import getUsers, {getUsage} from './database'

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

;(async () => {
  await app.whenReady()

  console.log('app.getPath userData:',app.getPath('userData'))
  console.log('__dirname:',__dirname)
  console.log('process.resourcesPath:',process.resourcesPath)
  const fs = require("fs");

  // 기존 SQLite 파일을 읽습니다.
  const existingSqliteFile = fs.readFileSync(path.join(process.resourcesPath, './database.db'));
  // 앱의 사용자 데이터 디렉터리를 가져옵니다.
  const userDataDirectory = app.getPath("userData");
  // SQLite 파일을 앱의 사용자 데이터 디렉터리에 복사합니다.
  fs.writeFileSync(`${userDataDirectory}/database.db`, existingSqliteFile);

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