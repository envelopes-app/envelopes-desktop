const { app, Menu } = require('electron');

function initializeModule() {

	const template = [
	{
		label: 'File',
		submenu : [
			{
				label: 'Create a New Budget...'
			},
			{
				label: 'Open...',
				accelerator: 'CmdOrCtrl+O',
			},
			{
				type: 'separator'
			},
			{
				label: 'Budget Properties...'
			},
			{
				type: 'separator'
			},
			{
				label: 'Import Budget from YNAB'
			}
		]
	},
	{
		label: 'Edit',
		submenu: [
			{
				role: 'undo'
			},
			{
				role: 'redo'
			},
			{
				type: 'separator'
			},
			{
				role: 'cut'
			},
			{
				role: 'copy'
			},
			{
				role: 'paste'
			},
			{
				role: 'pasteandmatchstyle'
			},
			{
				role: 'delete'
			},
			{
				role: 'selectall'
			}
		]
	},
	{
		label: 'View',
		submenu: [
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
			},
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
	}
	]

	if (process.platform === 'darwin') {
		const name = require('electron').app.getName()
		template.unshift({
			label: name,
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
		// Edit menu.
		template[2].submenu.push(
			{
				type: 'separator'
			},
			{
				label: 'Speech',
				submenu: [
					{
						role: 'startspeaking'
					},
					{
						role: 'stopspeaking'
					}
				]
			}
		)
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