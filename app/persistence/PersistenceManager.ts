/// <reference path='../_includes.ts' />

import { Promise } from 'es6-promise';

import { DatabaseFactory } from './DatabaseFactory';
import * as catalogQueries from './queries/catalogQueries';
import * as catalogEntities from '../interfaces/catalogEntities';
import * as budgetEntities from '../interfaces/budgetEntities';
import { IEntitiesCollection } from '../interfaces/state/IEntitiesCollection';

export class PersistenceManager {

	public static initialize(refreshDatabaseAtStartup:boolean = false):Promise<boolean> {

		// Ensure that the database tables are created and all the migrations have been run
		var databaseFactory = new DatabaseFactory();
		return databaseFactory.createDatabase(refreshDatabaseAtStartup)
	}

	public static createInitialUserAndBudget():Promise<boolean> {

		// Ensure that we have at least one user in the database, and that user should
		// have at least one budget associated with him. If there is no budget associated
		// with the user, then create a blank "My Budget" for that user.
		return Promise.resolve(true);		
	}

	public static syncDataWithDatabase(entitiesCollection:IEntitiesCollection):Promise<IEntitiesCollection> {

		// Persist the passed entities into the database

		// Run any pending calculations

		// Load updated data from the database

		// Resolve the promise with the updated data that we loaded
		return Promise.resolve(null);		
	}
}