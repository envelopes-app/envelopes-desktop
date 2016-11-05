/// <reference path="../_includes.ts" />

import { DateWithoutTime, Logger } from '../utilities';
import { PersistenceManager } from '../persistence';
import { ActionNames } from '../constants';
import { IImportedAccountObject } from '../interfaces/objects';
import * as catalogEntities from '../interfaces/catalogEntities';
import { IApplicationState, IEntitiesCollection, ISimpleEntitiesCollection } from '../interfaces/state';
import { 
	CreateBudgetCompletedAction, 
	OpenBudgetCompletedAction, 
	SyncDataWithDatabaseCompletedAction,
	EnsureBudgetEntitiesForMonthCompletedAction 
} from '../interfaces/actions';

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

	public static openBudgetCompleted(budget:catalogEntities.IBudget, entities:ISimpleEntitiesCollection):OpenBudgetCompletedAction {
		return {
			type: ActionNames.GLOBAL_LOAD_BUDGET_COMPLETED,
			budget: budget,
			entities: entities
		};
	}

	public static SyncDataWithDatabaseCompleted(entities:ISimpleEntitiesCollection):SyncDataWithDatabaseCompletedAction {
		return {
			type: ActionNames.GLOBAL_SYNC_DATA_WITH_DATABASE_COMPLETED,
			entities: entities
		};
	}

	public static EnsureBudgetEntitiesForMonthCompleted(month:DateWithoutTime):EnsureBudgetEntitiesForMonthCompletedAction {
		return {
			type: ActionNames.GLOBAL_ENSURE_BUDGET_ENTITIES_FOR_MONTH_COMPLETED,
			month: month
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

	public static createBudget(budget:catalogEntities.IBudget) {

		return function(dispatch:ReactRedux.Dispatch<IApplicationState>, getState:()=>IApplicationState) {

			var persistenceManager = PersistenceManager.getInstance();
			return persistenceManager.createNewBudget(budget)
				.then((createdBudget:catalogEntities.IBudget)=>{

					// dispatch action open budget to open this newly created budget
					dispatch(GlobalActionsCreator.openBudget(createdBudget));
				})
				.catch((error)=>{
					Logger.error(error.message);
					Logger.error(error.stack);
				});
		};
	}

	public static openBudget(budget:catalogEntities.IBudget) {

		return function(dispatch:ReactRedux.Dispatch<IApplicationState>, getState:()=>IApplicationState) {

			var persistenceManager = PersistenceManager.getInstance();
			return persistenceManager.loadBudget(budget)
				.then((updatedEntities:ISimpleEntitiesCollection)=>{

					// dispatch action open budget completed
					dispatch(GlobalActionsCreator.openBudgetCompleted(budget, updatedEntities));
				})
				.catch((error)=>{
					Logger.error(error.message);
					Logger.error(error.stack);
				});
		};
	}

	public static importYnabData(budgetName:string, accountsList:Array<IImportedAccountObject>, budgetRows:Array<any>, registerRows:Array<any>) {

		return function(dispatch:ReactRedux.Dispatch<IApplicationState>, getState:()=>IApplicationState) {

			var persistenceManager = PersistenceManager.getInstance();
			return persistenceManager.importYnabData(budgetName, accountsList, budgetRows, registerRows)
				.then((createdBudget:catalogEntities.IBudget)=>{
					// dispatch action open budget to open this newly created budget
					dispatch(GlobalActionsCreator.openBudget(createdBudget));
				})
				.catch((error)=>{
					Logger.error(error.message);
					Logger.error(error.stack);
				});
		};
	}

	public static syncBudgetDataWithDatabase(updatedEntitiesCollection:ISimpleEntitiesCollection) {

		return function(dispatch:ReactRedux.Dispatch<IApplicationState>, getState:()=>IApplicationState) {

			// Get the existing in-memory entities collection from state. This is so that we can
			// determine in the PersistenceManager which entities being saved are new, and which are
			// being updated (and what fields are being updated). On the basis of this we will be 
			// queueing the calculations to be run. 
			var existingEntitiesCollection = getState().entitiesCollection;
			var persistenceManager = PersistenceManager.getInstance();
			return persistenceManager.syncDataWithDatabase(updatedEntitiesCollection, existingEntitiesCollection)
				.then((updatedEntitiesFromStorage:ISimpleEntitiesCollection)=>{
					// dispatch action sync data with database completed
					dispatch(GlobalActionsCreator.SyncDataWithDatabaseCompleted(updatedEntitiesFromStorage));
				})
				.catch((error)=>{
					Logger.error(error.message);
					Logger.error(error.stack);
				});
		};
	}

	public static ensureBudgetEntitiesForMonth(month:DateWithoutTime) {

		return function(dispatch:ReactRedux.Dispatch<IApplicationState>, getState:()=>IApplicationState) {

			// Get the existing in-memory entities collection from state. This is so that we can
			// determine in the PersistenceManager if the data for the month already exists or not. 
			var existingEntitiesCollection = getState().entitiesCollection;
			var persistenceManager = PersistenceManager.getInstance();
			return persistenceManager.ensureMonthlyDataExistsForMonth(month, existingEntitiesCollection)
				.then((updatedEntitiesFromStorage:ISimpleEntitiesCollection)=>{
					// dispatch action sync data with database completed
					dispatch(GlobalActionsCreator.SyncDataWithDatabaseCompleted(updatedEntitiesFromStorage));
					// dispatch action ensure budget entities for month completed
					dispatch(GlobalActionsCreator.EnsureBudgetEntitiesForMonthCompleted(month));
				})
				.catch((error)=>{
					Logger.error(error.message);
					Logger.error(error.stack);
				});
		};
	}
}
