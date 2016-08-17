/// <reference path="../_includes.ts" />

import { Promise } from 'es6-promise';

import { IApplicationState, IEntitiesCollection } from '../interfaces/state';
import { PersistenceManager } from '../persistence';
import { ActionNames } from '../constants';
import * as catalogEntities from '../interfaces/catalogEntities';
import { CreateBudgetCompletedAction, LoadBudgetCompletedAction, SyncDataWithDatabaseCompletedAction } from '../interfaces/actions/GlobalActions';

export class GlobalActionsCreator {

	// ********************************************************************************************
	// Sync Action Creators
	// ********************************************************************************************
	public static createBudgetCompleted(budgetId:string):CreateBudgetCompletedAction {
		return {
			type: ActionNames.GLOBAL_CREATE_BUDGET_COMPLETED,
			budgetId: budgetId
		};
	}

	public static loadBudgetCompleted(budget:catalogEntities.IBudget):LoadBudgetCompletedAction {
		return {
			type: ActionNames.GLOBAL_LOAD_BUDGET_COMPLETED,
			budget: budget
		};
	}

	public static SyncDataWithDatabaseCompleted(entities:IEntitiesCollection):SyncDataWithDatabaseCompletedAction {
		return {
			type: ActionNames.GLOBAL_SYNC_DATA_WITH_DATABASE_COMPLETED,
			entities: entities
		};
	}

	// ********************************************************************************************
	// Async Action Creators
	// ********************************************************************************************
	public static initializeDatabase(refreshDatabase:boolean = false) {

		return function(dispatch:ReactRedux.Dispatch<IApplicationState>) {

			var persistenceManager = PersistenceManager.getInstance();
			// Initialize the persistence manager. This would create the database if it does 
			// not already exist. If it does, then this would ensure that any pending migrations 
			// are run on the database.
			return persistenceManager.initialize(refreshDatabase)
				.then((retVal:boolean)=>{

					// Load the default budget (one with the most recent lastAccessedOn value). If 
					// there is no budget in the database, a new blank budget would be created.
					return persistenceManager.loadDefaultBudget();
				});
		};
	}

	public static createBudget() {}

	public static openBudget() {}

	public static syncBudgetDataWithDatabase(entitiesCollection:IEntitiesCollection) {

		return function(dispatch:ReactRedux.Dispatch<IApplicationState>) {

			var persistenceManager = PersistenceManager.getInstance();

			return persistenceManager.syncDataWithDatabase(entitiesCollection)
				.then((updatedEntities:IEntitiesCollection)=>{


					// dispatch action sync data with database completed
				});
		};
	}
}
