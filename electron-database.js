const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { Promise } = require('es6-promise');
const { app, ipcMain } = require('electron');

let database; 

function initializeModule() {

	// Start listening for ipc messages related to database
	ipcMain.on('database-request', handleDatabaseMessage);

	// Initialize the database 
	return initializeDatabase();
}

function finalizeModule() {

	// Remove the listener from ipcMain
	ipcMain.removeListener('database-request', handleDatabaseMessage);
	// Close the database. We will re-initialize it if we activate.
	closeDatabase();
}

function handleDatabaseMessage(event, args) {

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

function initializeDatabase() {

	return new Promise((resolve, reject)=>{

		var databaseFolderName = (process.env.NODE_ENV === 'development') ? "ENAB-DEV" : "ENAB";  
		// Ensure that the directory for storing the database file exists
		var databaseDir = path.join(app.getPath('documents'), databaseFolderName);
		if (!fs.existsSync(databaseDir))
			fs.mkdirSync(databaseDir);

		var databaseFileName = path.join(databaseDir,'enab.db');
		// Open a connection to the database.
		database = new sqlite3.Database(databaseFileName);
		// Provide an error handler on the database object
		database.on('error', (err)=>{
			reject(err);
		});
		// Provide a success handler to use the returned database object when it is opened
		database.on('open', ()=>{
			resolve(true);
		});
	});
} 

function closeDatabase() {

	return new Promise((resolve, reject)=>{
		database.close(function(error) {

			database = null;
			if(error)
				reject(error);

			resolve();
		});
	});
}

function executeDatabaseQueries(databaseQueries) {

	// We are getting an array of "IDatabaseQuery" objects here.
	// Each IDatabaseQuery has the following properties
	// - name?: string
	// - query: string
	// - arguments: Array<any>
	return new Promise((resolve, reject)=>{
		
		database.serialize(function() {

			var resultObj = {};
			// Start a transaction
			database.exec('BEGIN');
			var promises = databaseQueries.map(function(databaseQuery) {
				return executeDatabaseQuery(databaseQuery, resultObj);
			});

			Promise.all(promises)
				.then(()=>{
					// Commit the transaction
					database.exec('COMMIT');
					// Resolve the promise
					resolve(resultObj);
				})
				.catch((error)=>{
					// Rollback the transaction
					database.exec('ROLLBACK');
					// Reject the promise
					reject(error);
				});
		});
	});
}

function executeDatabaseQuery(databaseQuery, resultObj) {

	return new Promise((resolve, reject)=>{

		database.all(databaseQuery.query, databaseQuery.arguments, function(err, rows) {

			if(err) {
				console.log(err);
				reject(err);
			}

			if(databaseQuery.name)
				resultObj[databaseQuery.name] = rows;

			resolve();
		});
	});
}

module.exports = {
	initializeDatabaseModule: initializeModule,
	finalizeDatabaseModule: finalizeModule
};