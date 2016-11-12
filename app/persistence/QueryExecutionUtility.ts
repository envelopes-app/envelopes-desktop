/// <reference path='../_includes.ts' />

import * as uuid from 'node-uuid';
import * as _ from 'lodash';

import { Logger } from '../utilities';
import { BudgetKnowledge, CatalogKnowledge } from './KnowledgeObjects';
import { KnowledgeValueQueries } from './queries/miscQueries';
import { IDatabaseQuery } from '../interfaces/persistence/IDatabaseQuery';

export function executeSqlQueriesAndSaveKnowledge(queryList:Array<IDatabaseQuery>,
											budgetId:string,
											budgetKnowledge:BudgetKnowledge,
											catalogKnowledge?:CatalogKnowledge):Promise<any> {

	// Append the query to persist the budgetKnowledge values to the list of queries
	if(catalogKnowledge)
		queryList.push( KnowledgeValueQueries.getSaveCatalogKnowledgeValueQuery(catalogKnowledge) );
	queryList.push( KnowledgeValueQueries.getSaveBudgetKnowledgeValueQuery(budgetId, budgetKnowledge) );
	return executeSqlQueries(queryList);
}

export function executeSqlQueries(queryList:Array<IDatabaseQuery>):Promise<any> {

	if(process.env.NODE_ENV === 'test') 
		return executeSqlQueriesInTestEnvironment(queryList);
	else 
		return executeSqlQueriesInProductionEnvironment(queryList);
}

function executeSqlQueriesInProductionEnvironment(queryList:Array<IDatabaseQuery>):Promise<any> {

	return new Promise<any>((resolve, reject)=>{

		var { ipcRenderer } = require('electron');
		// We have to send this request to the main process for execution. 
		// Generate a new guid to uniquely identify this request. 
		var requestId:string = uuid.v4();
		// Use the requestId as the channel name to listen for the response
		ipcRenderer.once(requestId, function(event, ...args:any[]) {

			// If there was an error, it would be in the first args position
			if(args[0]) {
				debugger; reject(args[0]);
			}
			// Resolve the promise object with the data received from the main process
			resolve(args[1]);
		});

		var payload:any = {
			requestId: requestId,
			queryList: queryList
		};
		// Send the request to the main process
		ipcRenderer.send("database-request", payload);
	});
}

// ******************************************************************************************************************
// Following code is for accessing the database when running in a test environment, since there, we do not have 
// access to the ipcRenderer object. These methods use websql to access the database.
// ******************************************************************************************************************
// Reference to the websql database that is used in the testing environment. This is set by the PersistenceManager.
var _refDatabase;

export function setDatabaseReference(database):void {
	_refDatabase = database;
}

function executeSqlQueriesInTestEnvironment(queryList:Array<IDatabaseQuery>):Promise<any> {

	var refDatabase = _refDatabase;
	return new Promise<any>((resolve, reject)=>{
		var results:any = {};
		var startTime = Date.now();

		refDatabase.transaction(
			(refTransaction:SQLTransaction)=>{

				_.each(queryList, (queryObj)=>{
					if(queryObj)
						executeSqlQuery(refTransaction, queryObj, results);
				});
			},
			(error:SQLError)=>{
				// If the transaction fails, reject the promise
				// Turn this into a readable standard error
				var standardError : Error;
				try{
					standardError = new Error(`SQL Error ${error.code}: ${error.message}`);
				}
				catch(e){
					standardError = new Error('Unknown SQL Error');
				}
				Logger.error(standardError.toString());
				reject(standardError);

			},
			()=>{

				var endTime = Date.now();
				var duration = (endTime - startTime)/1000;
				results.executionTime = duration;

				// Transaction completed successfully so resolve the promise
				resolve(results);
			}
		);
	});
}

function executeSqlQuery(refTransaction:SQLTransaction, queryObj:IDatabaseQuery, results:any):void {

	refTransaction.executeSql(queryObj.query, queryObj.arguments,
		(transaction:SQLTransaction, resultSet:SQLResultSet):void => {

			if(queryObj.name != undefined) {

				var objects:Array<any> = [];
				var rowsAffected = resultSet.rowsAffected;

				if(resultSet.rows.length > 0) {

					for(var i:number = 0; i < resultSet.rows.length; i++) {

						var object:any = resultSet.rows.item(i);
						objects.push(object);
					}
				}

				// If there is already an object of the same name in the results object then append the
				// contents of this array to the array in that object.
				// Otherwise just store this array in the result object.
				var existingObjects:Array<any> = results[queryObj.name];
				if(existingObjects) {
					objects = existingObjects.concat(objects);

					var previousRowsAffected = results[queryObj.name + "_rows_affected"];
					rowsAffected += previousRowsAffected;
				}

				results[ queryObj.name ] = objects;
				results[ queryObj.name + "_rows_affected" ] = rowsAffected;
			}
		}
		,
		function(transaction:SQLTransaction, error:SQLError):boolean {

			Logger.error(error.message);
			return false;
		}
	);
}
