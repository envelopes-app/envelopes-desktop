const fs = require('fs');
const path = require('path');
const { app, ipcMain, BrowserWindow, Menu } = require('electron');
const { initializeDatabase, closeDatabase, executeDatabaseQueries } = require('./electron-database');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({width: 800, height: 600})
	// and load the index.html of the app.
	if (process.env.NODE_ENV === 'development') {
		mainWindow.loadURL('http://localhost:8080/index.html')
	}
	else {
		mainWindow.loadURL('file://' + __dirname + '/build/index.html')
	}
	// Open the DevTools if we are in development mode
	if (process.env.NODE_ENV === 'development') {
		mainWindow.webContents.openDevTools();

		mainWindow.openDevTools();
		// Add a context menu for "Inspect Element"
		mainWindow.webContents.on('context-menu', (e, props) => {

			const { x, y } = props;
			Menu.buildFromTemplate([{
				label: 'Inspect element',
				click() {
					mainWindow.inspectElement(x, y);
				}
			}]).popup(mainWindow);
		});
  	}

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Set the local reference to the main window to null
		mainWindow = null;
		// Close the database. We will re-initialize it if we activate.
		closeDatabase();
	});
}

const handleDatabaseMessage = (event, args) => {

	var requestId = args.requestId;
	var queryList = args.queryList;

	return executeDatabaseQueries(queryList)
		.then((resultObj)=>{
			// Pass the result object received from the database back to the caller
			event.sender.send(requestId, null, resultObj);
		})
		.catch(function(error) {
			// In case of error, send the error object back to the caller
			event.sender.send(requestId, error, null);
		});
}

/*
const installExtensions = async () => {
  	if (process.env.NODE_ENV === 'development') {
    	const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

		const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];
		const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
		for (const name of extensions) {
			try {
				await installer.default(installer[name], forceDownload);
			} catch (e) {} // eslint-disable-line
		}
	}
};
*/

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	// Install the required extensions
  	// await installExtensions();

	// Start listening for ipc messages
	ipcMain.on('database-request', (event, args) => {
		handleDatabaseMessage(event, args);
	});

	// Initialize the database 
	initializeDatabase()
		.then(()=>{
			// Create the main window
			createWindow();
		})
		.catch(function(error) {
			console.log(error);
		});
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		initializeDatabase()
			.then(()=>{
				createWindow();
			})
			.catch(function(error) {
				console.log(error);
			});
	}
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.