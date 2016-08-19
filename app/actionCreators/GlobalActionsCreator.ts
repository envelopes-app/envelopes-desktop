/// <reference path="../_includes.ts" />

import { Promise } from 'es6-promise';

import { IApplicationState, IEntitiesCollection } from '../interfaces/state';
import { PersistenceManager } from '../persistence';
import { ActionNames } from '../constants';
import * as catalogEntities from '../interfaces/catalogEntities';
import { CreateBudgetCompletedAction, OpenBudgetCompletedAction, SyncDataWithDatabaseCompletedAction } from '../interfaces/actions';

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

	public static openBudgetCompleted(budget:catalogEntities.IBudget, entities:IEntitiesCollection):OpenBudgetCompletedAction {
		return {
			type: ActionNames.GLOBAL_LOAD_BUDGET_COMPLETED,
			budget: budget,
			entities: entities
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

		return function(dispatch:ReactRedux.Dispatch<IApplicationState>, getState:()=>IApplicationState) {

			var persistenceManager = PersistenceManager.getInstance();
			// Initialize the persistence manager. This would create the database if it does 
			// not already exist. If it does, then this would ensure that any pending migrations 
			// are run on the database.
			return persistenceManager.initialize(refreshDatabase)
				.then((retVal:boolean)=>{

					// Select the budget to open (one with the most recent lastAccessedOn value). 
					// If there is no budget in the database, a new blank budget would be created.
					return persistenceManager.selectBudgetToOpen();
				})
				.then((budget:catalogEntities.IBudget)=>{

					// Dispatch action to open the budget
					dispatch(GlobalActionsCreator.openBudget(budget));
				});
		};
	}

	public static createBudget() {

		return function(dispatch:ReactRedux.Dispatch<IApplicationState>, getState:()=>IApplicationState) {

			return Promise.resolve(null);
		};
	}

	public static openBudget(budget:catalogEntities.IBudget) {

		return function(dispatch:ReactRedux.Dispatch<IApplicationState>, getState:()=>IApplicationState) {

			var persistenceManager = PersistenceManager.getInstance();
			return persistenceManager.loadBudgetData()
				.then((updatedEntities:IEntitiesCollection)=>{

					// dispatch action open budget completed
					dispatch(GlobalActionsCreator.openBudgetCompleted(budget, updatedEntities));
				});
		};
	}

	public static syncBudgetDataWithDatabase(entitiesCollection:IEntitiesCollection) {

		return function(dispatch:ReactRedux.Dispatch<IApplicationState>, getState:()=>IApplicationState) {

			var persistenceManager = PersistenceManager.getInstance();
			return persistenceManager.syncDataWithDatabase(entitiesCollection)
				.then((updatedEntities:IEntitiesCollection)=>{

					// dispatch action sync data with database completed
					dispatch(GlobalActionsCreator.SyncDataWithDatabaseCompleted(updatedEntities));
				});
		};
	}
}
