/// <reference path='../_includes.ts' />

import { Database } from 'sqlite3';
import * as RSVP from 'es6-promise';

import { IDatabaseQuery } from './IDatabaseQuery';
import { BudgetKnowledge } from './KnowledgeObjects';

export class QueryExecutionUtility {

	private refDatabase:Database;

	constructor(refDatabase:Database) {

		// Save reference to the passed variables for future use
		this.refDatabase = refDatabase;
	}

	public finalize():void {

		// Null out the variables
		this.refDatabase = null;
	}

	public executeSqlQueriesAndSaveKnowledge(queryList:Array<IDatabaseQuery>,
												budgetId:string,
												budgetKnowledge:BudgetKnowledge):Promise<any> {

		// Append the query to persist the budgetKnowledge values to the list of queries
		// queryList.push( ynab.queries.KnowledgeValueQueries.getSaveBudgetKnowledgeValueQuery(budgetVersionId, budgetKnowledge) );
		return this.executeSqlQueries(queryList);
	}

	public executeSqlQueries(queryList:Array<IDatabaseQuery>):Promise<any> {

		return new RSVP.Promise<any>((resolve, reject)=>{
			var results:any = {};
			var startTime = Date.now();
/*
			this.refDatabase.transaction(
				(refTransaction:SQLTransaction)=>{

					_.each(queryList, (queryObj)=>{
						if(queryObj)
							this.executeSqlQuery(refTransaction, queryObj, results);
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
					ynab.utilities.ConsoleUtilities.error(standardError.toString());
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
			*/
		});
	}
/*
	private executeSqlQuery(refTransaction:SQLTransaction, queryObj:IDatabaseQuery, results:any):void {

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

			// Note: If you put an error callback here, and you are executing multiple statements inside of a transaction,
			// the transaction's error handler doesn't get called in case of an error!
			// It makes it look like the SQL succeeds when it really doesn't
			// So I've removed the error callback so that its known about in the executeSqlQueries method above.
			// FA: It is sometime beneficial in debugging to have that error handler here as it makes it easy to
			// see which sql statement failed.
			/*
				,
				function(transaction:SQLTransaction, error:SQLError):boolean {

					debugger;
					ynab.utilities.ConsoleUtilities.error(error.message);
					return false;
				}
				/
		);
	}*/
}