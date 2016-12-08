const { app, dialog, ipcMain } = require('electron');

let browserWindow;
let appName = "ENAB v1.0.0"; 
let openBudgetName; 

function initializeModule(mainWindow) {

	// Save a reference to the main window
	browserWindow = mainWindow;
	// Start listening for ipc messages related to window
	ipcMain.on('window-title-request', handleWindowTitleMessage);
	ipcMain.on('select-budget-file-request', handleSelectBudgetFileMessage);
	ipcMain.on('select-register-file-request', handleSelectRegisterFileMessage);
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

function handleSelectBudgetFileMessage(event, args) {

	var options = {
		filters: [{name: 'CSV Files', extensions: ['csv']}],
		properties: ['openFile']
	};

	var filePaths = dialog.showOpenDialog(browserWindow, options);
	if(filePaths && filePaths.length > 0) {
		event.sender.send("budget-file-path", filePaths[0]);
	}
	else {
		event.sender.send("budget-file-path", null);
	}
}

function handleSelectRegisterFileMessage(event, args) {

	var options = {
		filters: [{name: 'CSV Files', extensions: ['csv']}],
		properties: ['openFile']
	};

	var filePaths = dialog.showOpenDialog(browserWindow, options);
	if(filePaths && filePaths.length > 0) {
		event.sender.send("register-file-path", filePaths[0]);
	}
	else {
		event.sender.send("register-file-path", null);
	}
}

module.exports = {
	initializeWindowModule: initializeModule,
	finalizeWindowModule: finalizeModule
};