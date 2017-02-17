const { app, Menu, ipcMain } = require('electron');

function initializeModule() {

	const template = [
	{
		label: 'File',
		submenu : [
			{
				label: 'Create a New Budget...',
				click: function(menuItem, browserWindow, event) {
					browserWindow.webContents.send("menu-message", {menu:"create_new_budget"});
				}
			},
			{
				label: 'Open...',
				accelerator: 'CmdOrCtrl+O',
				click: function(menuItem, browserWindow, event) {
					browserWindow.webContents.send("menu-message", {menu:"open_budget"});
				}
			},
			{
				type: 'separator'
			},
			{
				label: 'Clone Budget',
				click: function(menuItem, browserWindow, event) {
					browserWindow.webContents.send("menu-message", {menu:"clone_budget"});
				}
			},
			{
				label: 'Make a Fresh Start...',
				click: function(menuItem, browserWindow, event) {
					browserWindow.webContents.send("menu-message", {menu:"fresh_start"});
				}
			},
			{
				type: 'separator'
			},
			{
				label: 'Budget Settings...',
				click: function(menuItem, browserWindow, event) {
					browserWindow.webContents.send("menu-message", {menu:"show_budget_settings"});
				}
			},
			{
				type: 'separator'
			},
			{
				label: 'Import YNAB Budget Data',
				click: function(menuItem, browserWindow, event) {
					browserWindow.webContents.send("menu-message", {menu:"import_ynab_budget_data"});
				}
			}
		]
	},
	{
		label: 'Edit',
		submenu: [
			{
				role: 'cut'
			},
			{
				role: 'copy'
			},
			{
				role: 'paste'
			}
		]
	},
	{
		label: 'View',
		submenu: [
			{
				role: 'resetzoom'
			},
			{
				role: 'zoomin'
			},
			{
				role: 'zoomout'
			},
			{
				type: 'separator'
			},
			{
				role: 'togglefullscreen'
			}
		]
	},
	{
		role: 'window',
		submenu: [
			{
				role: 'minimize'
			},
			{
				role: 'close'
			}
		]
	},
	{
		role: 'help',
		submenu: [
			{
				label: 'Learn More',
				click () { require('electron').shell.openExternal('http://electron.atom.io') }
			}
		]
	}]

	if (process.env.NODE_ENV === 'development') {

		// Add the "Reload" and "Toggle Developer Tools" menu items to the view menu
		template[2].submenu.unshift(
			{
				label: 'Reload',
				accelerator: 'CmdOrCtrl+R',
				click (item, focusedWindow) {
					if (focusedWindow) focusedWindow.reload()
				}
			},
			{
				label: 'Toggle Developer Tools',
				accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
				click (item, focusedWindow) {
					if (focusedWindow) focusedWindow.webContents.toggleDevTools()
				}
			},
			{
				type: 'separator'
			}
		)
	}

	if (process.platform === 'darwin') {
		template.unshift({
			label: "Envelopes",
			submenu: [
				{
					role: 'about'
				},
				{
					type: 'separator'
				},
				{
					role: 'services',
					submenu: []
				},
				{
					type: 'separator'
				},
				{
					role: 'hide'
				},
				{
					role: 'hideothers'
				},
				{
					role: 'unhide'
				},
				{
					type: 'separator'
				},
				{
					role: 'quit'
				}
			]
		})
		// Window menu.
		template[4].submenu = [
			{
				label: 'Close',
				accelerator: 'CmdOrCtrl+W',
				role: 'close'
			},
			{
				label: 'Minimize',
				accelerator: 'CmdOrCtrl+M',
				role: 'minimize'
			},
			{
				label: 'Zoom',
				role: 'zoom'
			},
			{
				type: 'separator'
			},
			{
				label: 'Bring All to Front',
				role: 'front'
			}
		]
	}

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu);
}

function finalizeModule() {

}

module.exports = {
	initializeMenusModule: initializeModule,
	finalizeMenusModule: finalizeModule
};