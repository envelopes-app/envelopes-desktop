/// <reference path='../_includes.ts' />

export class DropboxManager {

	private deviceId:string;
	private dropboxFolderPath:string;
	private appFolderName:string = "ENAB";
	private dropboxFolderFound:boolean = false;

	public initialize(deviceId:string):Promise<boolean> {

		// Save the deviceId in the local variable
		this.deviceId = deviceId;

		// Load the dropbox config file and get the path for the dropbox folder
		return this.loadConfigFile()
			.then((fileContents)=>{

				if(fileContents && fileContents.personal && fileContents.personal.path) {
					// Save the location of the dropbox folder in the local variable
					this.dropboxFolderFound = true;
					this.dropboxFolderPath = fileContents.personal.path;
				}

				return true;
			});
	}	

	// ************************************************************************************************
	// Utility Methods
	// ************************************************************************************************
	private loadConfigFile():Promise<any> {

		return new Promise<any>((resolve, reject)=>{

			// Get the fs and path modules
			const remote = require('electron').remote;
			const { app } = require('electron').remote;
			const fs = remote.require('fs');
			const path = remote.require('path');

			var configFilePath:string;
			if(process.platform == "darwin")
				configFilePath = path.join(app.getPath("home"), ".dropbox/info.json");

			fs.readFile(configFilePath, (error, data)=>{

				if(error)
					reject(error);

				var configObj = JSON.parse(data);
				resolve(configObj);
			});
		});
	}
} 