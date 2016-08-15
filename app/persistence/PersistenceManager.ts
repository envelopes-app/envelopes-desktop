/// <reference path='../_includes.ts' />

import { Promise } from 'es6-promise';

import { DatabaseFactory } from './DatabaseFactory';

export class PersistenceManager {

	public initialize(refreshDatabaseAtStartup:boolean = false):Promise<boolean> {

		// Ensure that the database tables are created and all the migrations have been run
		var databaseFactory = new DatabaseFactory();
		return databaseFactory.createDatabase(refreshDatabaseAtStartup);
	}
}