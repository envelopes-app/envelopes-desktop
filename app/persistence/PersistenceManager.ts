/// <reference path='../_includes.ts' />

import { Promise } from 'es6-promise';

import { executeSqlQueries } from './QueryExecutionUtility';
import { DatabaseFactory } from './DatabaseFactory';
import * as catalogQueries from './queries/catalogQueries';
import * as miscQueries from './queries/miscQueries';
import * as catalogEntities from '../interfaces/catalogEntities';
import * as budgetEntities from '../interfaces/budgetEntities';
import { IDatabaseQuery } from '../interfaces/persistence';
import { IEntitiesCollection } from '../interfaces/state/IEntitiesCollection';
import { CatalogKnowledge, BudgetKnowledge } from './KnowledgeObjects';

export class PersistenceManager {

	// ************************************************************************************************
	// Singleton Implementation
	// ************************************************************************************************
	private static instance:PersistenceManager;

	public static getInstance():PersistenceManager { 

		if(!PersistenceManager.instance)
			PersistenceManager.instance =  new PersistenceManager();

		return PersistenceManager.instance 
	};
	// ************************************************************************************************

	private catalogKnowledge:CatalogKnowledge;
	private budgetKnowledge:BudgetKnowledge;
	private activeBudget:catalogEntities.IBudget;

	public initialize(refreshDatabaseAtStartup:boolean = false):Promise<boolean> {

		// Ensure that the database tables are created and all the migrations have been run
		var databaseFactory = new DatabaseFactory();
		return databaseFactory.createDatabase(refreshDatabaseAtStartup)
			.then((retVal:boolean)=>{

				// Load the catalog knowledge values from the database
				return this.loadCatalogKnowledgeValuesFromDatabase();
			})
			.then((catalogKnowledge:CatalogKnowledge)=>{

				this.catalogKnowledge = catalogKnowledge;
				return true;
			});
	}

	public createInitialUserAndBudget():Promise<boolean> {

		// Ensure that we have at least one user in the database, and that user should
		// have at least one budget associated with him. If there is no budget associated
		// with the user, then create a blank "My Budget" for that user.
		return Promise.resolve(true);		
	}

	public syncDataWithDatabase(entitiesCollection:IEntitiesCollection):Promise<IEntitiesCollection> {

		// Persist the passed entities into the database

		// Run any pending calculations

		// Load updated data from the database

		// Resolve the promise with the updated data that we loaded
		return Promise.resolve(null);		
	}

	// ************************************************************************************************
	// Internal/Utility Methods
	// ************************************************************************************************
	public loadCatalogKnowledgeValuesFromDatabase():Promise<CatalogKnowledge> {

		var queryList:Array<IDatabaseQuery> = [
			miscQueries.KnowledgeValueQueries.getLoadCatalogKnowledgeValueQuery()
		];

		return executeSqlQueries(queryList)
			.then((result:any)=>{

				var catalogKnowledge:CatalogKnowledge = new CatalogKnowledge();
				if(result.catalogKnowledge && result.catalogKnowledge.length > 0) {

					catalogKnowledge.currentDeviceKnowledge = result.catalogKnowledge[0].currentDeviceKnowledge;
					catalogKnowledge.deviceKnowledgeOfServer = result.catalogKnowledge[0].deviceKnowledgeOfServer;
					catalogKnowledge.serverKnowledgeOfDevice = result.catalogKnowledge[0].serverKnowledgeOfDevice;
				}

				return catalogKnowledge;
			});
	}

	protected saveCatalogKnowledgeValuesToDatabase(catalogKnowledge:CatalogKnowledge):Promise<any> {

		var query = miscQueries.KnowledgeValueQueries.getSaveCatalogKnowledgeValueQuery(catalogKnowledge);
		return executeSqlQueries([query]);
	}

	public loadBudgetKnowledgeValuesFromDatabase(budgetId:string):Promise<BudgetKnowledge> {

		var budgetKnowledge:BudgetKnowledge = new BudgetKnowledge();
		var queryList:Array<IDatabaseQuery> = [
			miscQueries.KnowledgeValueQueries.getLoadBudgetKnowledgeValueQuery(budgetId),
			miscQueries.KnowledgeValueQueries.getMaxDeviceKnowledgeFromBudgetEntities(budgetId)
		];

		return executeSqlQueries(queryList)
			.then((result:any)=>{

				var budgetKnowledgeFound = (result.budgetKnowledge && result.budgetKnowledge.length > 0);
				budgetKnowledge.currentDeviceKnowledge = budgetKnowledgeFound ? result.budgetKnowledge[0].currentDeviceKnowledge : 0;
				budgetKnowledge.currentDeviceKnowledgeForCalculations = budgetKnowledgeFound ? result.budgetKnowledge[0].currentDeviceKnowledgeForCalculations : 0;
				budgetKnowledge.deviceKnowledgeOfServer = budgetKnowledgeFound ? result.budgetKnowledge[0].deviceKnowledgeOfServer : 0;
				budgetKnowledge.serverKnowledgeOfDevice = budgetKnowledgeFound ? result.budgetKnowledge[0].serverKnowledgeOfDevice : 0;
				budgetKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage = 0;

				if(result.budgetKnowledgeFromEntities && result.budgetKnowledgeFromEntities.length > 0) {

					// This is the max device knowledge value that has been assigned to an entity of this budget
					// We want to ensure that the deviceKnowledge value that we loaded from the BudgetVersionKnowledge
					// table is not less then this.
					var deviceKnowledgeFromEntities = result.budgetKnowledgeFromEntities[0].deviceKnowledge;
					if(deviceKnowledgeFromEntities > 0 && (deviceKnowledgeFromEntities >= budgetKnowledge.currentDeviceKnowledge)) {
						// We want to set the current device knowledge to be one more than the max device knowledge
						budgetKnowledge.currentDeviceKnowledge = deviceKnowledgeFromEntities + 1;
					}
				}

				return budgetKnowledge;
			});
	}

	protected saveBudgetKnowledgeValuesToDatabase(budgetId:string, budgetKnowledge:BudgetKnowledge):Promise<any> {

		var query = miscQueries.KnowledgeValueQueries.getSaveBudgetKnowledgeValueQuery(budgetId, budgetKnowledge);
		return executeSqlQueries([query]);
	}
}