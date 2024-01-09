import path from 'path'
import { app, ipcMain,dialog } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import {getFcode, getMcode, getUsage, getVcode, setFcode, setMcode, setVcode, upsertUsage,getConfig,setModbus} from './database'
import {getRead} from './modbus'
import fs from "fs"
import * as os from "os";

import {autoUpdater} from "electron-updater"
import log from 'electron-log'


const ProgressBar = require('electron-progressbar');
autoUpdater.autoDownload = false;


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

// MODBUS
let modbus_options = {
  'host': '127.0.0.1',
  'port': '501'
};
getConfig().then((rows) => {
  console.log(rows);
  if(rows === -1){
    fs.writeFileSync(`${userDataDirectory}/database.db`, existingSqliteFile);
  }else{
    //getRead();
  }
  getConfig().then((rows) => {
    console.log(rows);
    modbus_options = {
      'host': rows[0].modbus_host,
      'port': rows[0].modbus_port
    };
  });
});

if(!fs.existsSync(path.join(userDataDirectory, 'database.db'))){
  fs.writeFileSync(`${userDataDirectory}/database.db`, existingSqliteFile);
}

;(async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    //mainWindow.webContents.openDevTools()
  }

  // 자동 업데이트 등록
  await autoUpdater.checkForUpdates();

  // getRead().then((rows) => {
  //   console.log(rows)
  // })

})()

/* Updater ======================================================*/

let progressBar;

/* 업데이트가 가능한지 확인하는 부분이다.
업데이트가 가능한 경우 팝업이 뜨면서 업데이트를 하겠냐고 묻는다.
Update를 클릭하면 업데이트 가능한 파일을 다운로드 받는다. */
autoUpdater.on('update-available', () => {
  dialog
      .showMessageBox({
        type: 'info',
        title: 'Update available',
        message:
            'A new version is available. Do you want to update now?',
        buttons: ['Update', 'Later'],
      })
      .then((result) => {
        const buttonIndex = result.response;

        if (buttonIndex === 0) autoUpdater.downloadUpdate();
      });
});

/* progress bar가 없으면 업데이트를 다운받는 동안 사용자가 그 내용을 알 수 없기 때문에
progress bar는 꼭 만들어준다. */
autoUpdater.once('download-progress', (progressObj) => {
  progressBar = new ProgressBar({
    text: 'Downloading...',
    detail: 'Downloading...',
  });

  progressBar
      .on('completed', function () {
        console.info(`completed...`);
        progressBar.detail = 'Task completed. Exiting...';
      })
      .on('aborted', function () {
        console.info(`aborted...`);
      });
});

// 업데이트를 다운받고 나면 업데이트 설치 후 재시작을 요청하는 팝업이 뜬다.
autoUpdater.on('update-downloaded', () => {
  progressBar.setCompleted();
  dialog
      .showMessageBox({
        type: 'info',
        title: 'Update ready',
        message: 'Install & restart now?',
        buttons: ['Restart', 'Later'],
      })
      .then((result) => {
        const buttonIndex = result.response;

        if (buttonIndex === 0) autoUpdater.quitAndInstall(false, true);
      });
});

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})


ipcMain.on('db', async (event, arg) => {
    console.log(arg);
    switch (arg['req']) {
    case 'getUsage':
      getUsage(arg['u_date_from'],arg['u_date_to']).then((rows) => {
        event.reply('db', rows)
        })
      break;
    case 'getVcode':
      getVcode().then((rows) => {
        event.reply('db', rows)
      })
      break;
    case 'setVcode':
      setVcode(arg['dataSource'])
      break;
    case 'getMcode':
      getMcode().then((rows) => {
        event.reply('db', rows)
      })
      break;
    case 'setMcode':
      setMcode(arg['dataSource'])
      break;
    case 'getFcode':
      getFcode().then((rows) => {
        event.reply('db', rows)
      })
      break;
    case 'setFcode':
      setFcode(arg['dataSource'])
      break;
    case 'getConfig':
      getConfig().then((rows) => {
          console.log('getConfig ',rows);
          event.reply('db', rows)
        })
        break;
     case 'getRead':
       modbus_options = {
            'host': arg['modbusHost'],
            'port': arg['modbusPort']
       }
       console.log('getRead modbus_options',modbus_options);
       getRead(modbus_options).then((rows) => {
         console.log('getRead ',rows);
         // event.reply('db', rows)
        })
        break;
     case 'setModbus':
       modbus_options = {
            'host': arg['modbusHost'],
            'port': arg['modbusPort']
       }
       setModbus(modbus_options);

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
//monitoredFolder 비우기 (초기화)
fs.readdir(monitoredFolder, (err, files) => {
  if (err) {
    console.error('폴더를 읽을 수 없습니다:', err);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(monitoredFolder, file);
    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error('파일 정보를 가져올 수 없습니다:', err);
        return;
      }

      if (stats.isFile()) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('파일을 삭제할 수 없습니다:', err);
          }
        });
      }
    });
  });
});



// 파일을 SQLite에 삽입하는 함수
function insertFileToDatabase(filePath) {
  console.log('insertFileToDatabase filePath',filePath);
  // csv 파일 읽기
  const csvData = fs.readFileSync(filePath, "utf8");
  upsertUsage(csvData);
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
        if (extension === "csv") {

          insertFileToDatabase(filePath);

          // 파일을 보관 폴더로 이동
          const archivePath = path.join(archiveFolder, filename);
          fs.rename(filePath, archivePath, (err) => {
            if (err) {
              console.error('파일을 이동할 수 없습니다:', err);
            }
          });

        }

      }
    });
  }
});