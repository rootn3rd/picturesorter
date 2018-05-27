const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

const readdir = require('./readdir');
const APPSETTINGS_FILEPATH = './settings/appSettings.json';
let win;
let isUnlockedForSaving = false;
let appSettings = {};

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      webSecurity: false
    }
  });

  // load the dist folder from Angular
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'dist/picturesorter/index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  // Open the DevTools optionally:
  // win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

ipcMain.on('load_gallery', (event, args) => {
  console.log('Loading gallery');
  var mypath =
    'C:/Pankaj/Images/Wedding/Manisha Modi Traditonal Photos/farhan khan shadi 18.02.2018/03  haldi';
  // mypath = 'C:/Pankaj/delete';
  // mypath = mypath.replace(/ /g, '\\ ');

  readdir(mypath, [], (err, result) => {
    event.sender.send('galleryItems', result);
  });
});
ipcMain.on('export', (event, args) => {
  console.log('Export', args);
  if (args) {
    var galleryItems = args.items || [];
    var items = [];
    var destination = args.path;

    galleryItems.forEach(fileObj => {
      console.log(fileObj.path);
      try {
        // destination.txt will be created or overwritten by default.
        fs.copyFileSync(fileObj.path, path.join(destination, fileObj.name));
        items.push({ path: fileObj.path });
        console.log(fileObj.name + 'was copied');
      } catch (e) {
        console.log(e);
      }
    });

    console.log('Reached');
    event.sender.send('export_status', items);
  }
});

// ipcMain.on('export', (event, args) => {
//   console.log('Export', args);
//   if (args) {
//     var galleryItems = args.items || [];
//     var items = [];
//     var destination = args.path;

//     galleryItems.forEach(fileObj => {
//       console.log(fileObj.path);
//       try {
//         // destination.txt will be created or overwritten by default.
//         fs.copyFile(fileObj.path, path.join(destination, fileObj.name), err => {
//           if (err) {
//             throw err;
//           } else {
//             items.push({ path: fileObj.path });
//             console.log(fileObj.name + 'was copied');
//           }
//         });
//       } catch (e) {
//         console.log(e);
//       }
//     });

//     console.log('Reached');
//     event.sender.send('export_status', items);
//   }
// });

ipcMain.on('gallery-settings-updated', (event, data) => {
  appSettings = Object.assign({}, appSettings, data);
});

ipcMain.on('load_from_settings', (event, data) => {
  fs.readFile(APPSETTINGS_FILEPATH, (error, data) => {
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      console.log('Unable to parse data :', e);
    }
    event.sender.send('settings', jsonData);
    isUnlockedForSaving = true;
  });
});

ipcMain.on('add_folder_path', (event, data) => {
  if (data) {
    var stat = fs.statSync(data);
    if (stat && stat.isDirectory()) {
      appSettings.folderLocations = appSettings.folderLocations || [];
      appSettings.folderLocations.push(data);

      readdir(data, [], (err, result) => {
        event.sender.send('galleryItems', result);
      });
    }
  }
});
ipcMain.on('remove_folder_path', (event, data) => {
  if (
    data &&
    appSettings &&
    appSettings.folderLocations &&
    appSettings.folderLocations.length
  ) {
    appSettings.folderLocations = appSettings.folderLocations.filter(
      x => x !== data
    );
  }
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  console.log('Before quiting.. Saving the appSettings.json');
  if (isUnlockedForSaving && appSettings.galleryItems) {
    fs.writeFile(
      APPSETTINGS_FILEPATH,
      JSON.stringify(appSettings, null, 2),
      (err, data) => {
        if (!err) {
          console.log('Data save successful');
        }
      }
    );
  }
});
