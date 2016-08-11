const {app, BrowserWindow} = require('electron');

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
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
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
  	// await installExtensions();
	// Create the main window
	createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.