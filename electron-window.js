const { app, dialog, ipcMain } = require('electron');

let browserWindow;
let appName = "ENAB v1.0.0"; 
let openBudgetName; 

function initializeModule(mainWindow) {

	// Save a reference to the main window
	browserWindow = mainWindow;
	// Start listening for ipc messages related to window
	ipcMain.on('window-title-request', handleWindowTitleMessage);
}

function finalizeModule() {

	browserWindow = null;
	// Remove the listener from ipcMain
	ipcMain.removeListener('window-title-request', handleWindowTitleMessage);
}

function handleWindowTitleMessage(event, args) {

	activeBudgetName = args.activeBudgetName;
	browserWindow.setTitle(`${appName} - ${activeBudgetName}`);
}

module.exports = {
	initializeWindowModule: initializeModule,
	finalizeWindowModule: finalizeModule
};