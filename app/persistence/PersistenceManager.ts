/// <reference path='../_includes.ts' />

import { Promise } from 'es6-promise';

import { DatabaseFactory } from './DatabaseFactory';
import * as catalogQueries from './queries/catalogQueries';
import * as catalogEntities from '../interfaces/catalogEntities';
import * as budgetEntities from '../interfaces/budgetEntities';

export class PersistenceManager {

	public static initialize(refreshDatabaseAtStartup:boolean = false):Promise<boolean> {

		// Ensure that the database tables are created and all the migrations have been run
		var databaseFactory = new DatabaseFactory();
		return databaseFactory.createDatabase(refreshDatabaseAtStartup)
	}

	public static createInitialUserAndBudget():Promise<boolean> {

		return Promise.resolve(true);		
	}
}