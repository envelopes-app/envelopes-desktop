/// <reference path='../_includes.ts' />

import * as sqlite3 from 'sqlite3';
import * as RSVP from 'es6-promise';

export class PersistenceManager {

	protected _refDatabase:sqlite3.Database;

        public initialize(databaseFileName:string):Promise<boolean> {

			return new RSVP.Promise<any>((resolve, reject)=>{

				// Open a connection to the database.
				this._refDatabase = new sqlite3.Database(databaseFileName);
				// Provide an error handler on the database object
				this._refDatabase.on('error', (err:Error)=>{
					reject(err);
				});
				// Provide a success handler to use the returned database object when it is opened
				this._refDatabase.on('open', ()=>{
					resolve(true);
				});
			});
        }
}