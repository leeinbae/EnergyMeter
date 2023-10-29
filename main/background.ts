import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import {getUsage, upsertUsage} from './database'
import fs from "fs"
import * as os from "os";

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
if(!fs.existsSync(path.join(userDataDirectory, 'database.db'))){
  fs.writeFileSync(`${userDataDirectory}/database.db`, existingSqliteFile);
}

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

    switch (arg['req']) {
    case 'getUsage':
      console.log(arg);
      getUsage(arg['u_date_from'],arg['u_date_to']).then((rows) => {
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

const platform = os.platform();
const schedule = require('node-schedule');
let femsFolder = '/Users/leeinbae/Desktop/fems'; // 감시할 폴더 경로

switch (platform) {
  case 'win32':
    console.log('Running on Windows');
    femsFolder = path.normalize('C://fems'); // 감시할 폴더 경로
    break;
  case 'darwin':
    console.log('Running on macOS');
    break;
  case 'linux':
    console.log('Running on Linux');
    break;
  default:
    console.log('Unknown platform:', platform);
}

const monitoredFolder = path.join(femsFolder, 'monitor'); // 감시할 폴더 경로
const archiveFolder = path.join(femsFolder, 'archive'); // 보관할 폴더 경로
const retentionPeriod = 7; // 보관 기간 (일)

if (!fs.existsSync(femsFolder)) {
  fs.mkdirSync(femsFolder);
}
if (!fs.existsSync(monitoredFolder)) {
  fs.mkdirSync(monitoredFolder);
}
if (!fs.existsSync(archiveFolder)) {
  fs.mkdirSync(archiveFolder);
}


// 파일을 SQLite에 삽입하는 함수
function insertFileToDatabase(filePath) {
  console.log('insertFileToDatabase filePath',filePath);
  // csv 파일 읽기
  const csvData = fs.readFileSync(filePath, "utf8");
  upsertUsage(csvData);
}

// 폴더를 감시하고 새 파일이 들어오면 처리하는 함수
function watchFolder() {
  fs.readdir(monitoredFolder, (err, files) => {
    if (err) {
      console.error('폴더를 읽을 수 없습니다:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(monitoredFolder, file);



      // 파일을 SQLite에 삽입
      insertFileToDatabase(filePath);

      // 파일을 보관 폴더로 이동
      const archivePath = path.join(archiveFolder, file);
      fs.rename(filePath, archivePath, (err) => {
        if (err) {
          console.error('파일을 이동할 수 없습니다:', err);
        }
      });
    });
  });
}

// 스케줄링: 매일 자정에 보관 기간이 지난 파일 삭제
schedule.scheduleJob('0 0 * * *', () => {
  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() - retentionPeriod);

  fs.readdir(archiveFolder, (err, files) => {
    if (err) {
      console.error('폴더를 읽을 수 없습니다:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(archiveFolder, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('파일 정보를 가져올 수 없습니다:', err);
          return;
        }

        if (stats.isFile() && stats.mtime < expiredDate) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('파일을 삭제할 수 없습니다:', err);
            }
          });
        }
      });
    });
  });
});

// 폴더 감시 시작
fs.watch(monitoredFolder, { encoding: 'utf-8' }, (eventType, filename) => {
  if (eventType === 'rename' && filename) {
    const filePath = path.join(monitoredFolder, filename);
    fs.stat(filePath, (err, stats) => {
      if (err) {
        //console.error('파일 정보를 가져올 수 없습니다:', err, stats);
        return;
      }

      if (stats.isFile()) {

        const extension = filename.split(".")[1];
        if (filename.includes("raw") && extension === "csv") {

          insertFileToDatabase(filePath);

          // 파일을 보관 폴더로 이동
          const archivePath = path.join(archiveFolder, filename);
          // fs.rename(filePath, archivePath, (err) => {
          //   if (err) {
          //     console.error('파일을 이동할 수 없습니다:', err);
          //   }
          // });

        }

      }
    });
  }
});