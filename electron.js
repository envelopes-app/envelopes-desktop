const fs = require('fs');
const path = require('path');
const { Promise } = require('es6-promise');
const { app, ipcMain, BrowserWindow, Menu } = require('electron');
const { initializeMenusModule, finalizeMenusModule } = require('./electron-menus');
const { initializeDatabaseModule, finalizeDatabaseModule } = require('./electron-database');
const { initializeWindowModule, finalizeWindowModule } = require('./electron-window');

//import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({width: 1024, height: 768})
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
		// Finalize all the modules. We will re-initialize it if we activate.
		finalizeMenusModule();
		finalizeDatabaseModule();
		finalizeWindowModule();
	});
}

const installExtensions = () => {
/*
  	if (process.env.NODE_ENV === 'development') {

		return installExtension(REACT_DEVELOPER_TOOLS)
			.then((name) => {
				console.log(`Added Extension:  ${name}`);
			})
			.catch((err)=>{
				console.log('An error occurred: ', err);
			});
	}
	else
*/
	return Promise.resolve(null);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {

	// Install the required extensions
  	return installExtensions()
		.then(()=>{
			// Initialize the database module 
			initializeDatabaseModule();
		})
		.then(()=>{
			// Create the main window
			createWindow();
		})
		.then(()=>{
			// Initialize the menu module 
			initializeMenusModule();
		})
		.then(()=>{
			// Initialize the window module 
			initializeWindowModule(mainWindow);
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
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		initializeDatabaseModule()
			.then(()=>{
				createWindow();
			})
			.then(()=>{
				// Initialize the menu module 
				initializeMenusModule();
			})
			.then(()=>{
				// Initialize the window module 
				initializeWindowModule(mainWindow);
			})
			.catch(function(error) {
				console.log(error);
			});
	}
});
