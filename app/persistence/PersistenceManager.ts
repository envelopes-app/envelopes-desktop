/// <reference path='../_includes.ts' />

import * as _ from 'lodash';

import { executeSqlQueries, executeSqlQueriesAndSaveKnowledge } from './QueryExecutionUtility';
import { BudgetFactory } from './BudgetFactory';
import { DatabaseFactory } from './DatabaseFactory';
import { CalculationsManager } from './CalculationsManager';
import * as commonInterfaces from '../interfaces/common'; 
import * as catalogEntities from '../interfaces/catalogEntities';
import * as budgetEntities from '../interfaces/budgetEntities';
import * as catalogQueries from './queries/catalogQueries';
import * as budgetueries from './queries/budgetQueries';
import * as miscQueries from './queries/miscQueries';
import { IDatabaseQuery } from '../interfaces/persistence';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../interfaces/state/IEntitiesCollection';
import { CatalogKnowledge, BudgetKnowledge } from './KnowledgeObjects';
import { Logger } from '../utilities';

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
	private calculationsManager:CalculationsManager;

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

	public selectBudgetToOpen():Promise<catalogEntities.IBudget> {

		// Get all the budget entities from the database
		var query = catalogQueries.BudgetQueries.getAllBudgets();
		return executeSqlQueries([query])
			.then((result:any)=>{

				if(result.budgets && result.budgets.length > 0) {
					// Iterate through the budgets to find the one that has the latest 'lastAccesson' value
					var budget = result.budgets[0];
					for(var i = 1; i < result.budgets.length; i++) {

						if(result.budgets[i].lastAccessedOn > budget.lastAccessedOn)
							budget = result.budgets[i];
					}

					return budget;
				}
				else {

					// Currently there is no budget in the database. Create a blank new budget.
					var budgetFactory = new BudgetFactory();
					return budgetFactory.createNewBudget(this.catalogKnowledge, "My Budget", null, null);
				}
			})
			.then((budget:catalogEntities.IBudget)=>{

				// Set this as the currently active budget in persistence manager
				this.activeBudget = budget;
				// Load the budget knowledge values for this budget
				return this.loadBudgetKnowledgeValuesFromDatabase(budget.entityId);
			})
			.then((budgetKnowledge:BudgetKnowledge)=>{

				this.budgetKnowledge = budgetKnowledge;
				return this.activeBudget;
			})
			.catch((error:Error)=>{

				Logger.error(error.toString());
				return null;
			});
	}

	public syncDataWithDatabase(updatedEntitiesCollection:ISimpleEntitiesCollection, existingEntitiesCollection:IEntitiesCollection):Promise<IEntitiesCollection> {

		var budgetId = this.activeBudget.entityId;
		var budgetKnowledge = this.budgetKnowledge;

		// Persist the passed entities into the database
		return this.saveBudgetEntitiesToDatabase(updatedEntitiesCollection, existingEntitiesCollection)
			.then((retVal:boolean)=>{

				// Run pending calculations
				return this.calculationsManager.performPendingCalculations(budgetId, budgetKnowledge);
			})
			.then((retVal:boolean)=>{
				
				// Load updated data from the database
				var deviceKnowledge = this.budgetKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
				var deviceKnowledgeForCalculations = this.budgetKnowledge.lastDeviceKnowledgeForCalculationsLoadedFromLocalStorage;
				return this.loadBudgetEntitiesFromDatabase(budgetId, deviceKnowledge, deviceKnowledgeForCalculations);
			});
	}

	public loadBudgetData():Promise<IEntitiesCollection> {

		var budgetId = this.activeBudget.entityId;
		var deviceKnowledge = this.budgetKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
		var deviceKnowledgeForCalculations = this.budgetKnowledge.lastDeviceKnowledgeForCalculationsLoadedFromLocalStorage;
		return this.loadBudgetEntitiesFromDatabase(budgetId, deviceKnowledge, deviceKnowledgeForCalculations);
	}

	// ************************************************************************************************
	// Internal/Utility Methods
	// ************************************************************************************************
	private loadCatalogKnowledgeValuesFromDatabase():Promise<CatalogKnowledge> {

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

	private saveCatalogKnowledgeValuesToDatabase(catalogKnowledge:CatalogKnowledge):Promise<any> {

		var query = miscQueries.KnowledgeValueQueries.getSaveCatalogKnowledgeValueQuery(catalogKnowledge);
		return executeSqlQueries([query]);
	}

	private loadBudgetKnowledgeValuesFromDatabase(budgetId:string):Promise<BudgetKnowledge> {

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

	private saveBudgetKnowledgeValuesToDatabase(budgetId:string, budgetKnowledge:BudgetKnowledge):Promise<any> {

		var query = miscQueries.KnowledgeValueQueries.getSaveBudgetKnowledgeValueQuery(budgetId, budgetKnowledge);
		return executeSqlQueries([query]);
	}

	private saveBudgetEntitiesToDatabase(entitiesCollection:ISimpleEntitiesCollection, existingEntitiesCollection:IEntitiesCollection):Promise<boolean> {

		// Iterate through the passed entities, and ensure that each of them has the budgetId set
		// Also update the deviceKnowledge value on each entity 
		var budgetId = this.activeBudget.entityId;
		var budgetKnowledge = this.budgetKnowledge;

		var setBudgetIdAndDeviceKnowledge = (entitiesArray:Array<commonInterfaces.IBudgetEntity>)=>{

			if(entitiesArray && entitiesArray.length > 0) {
				_.forEach(entitiesArray, (entity:commonInterfaces.IBudgetEntity)=>{

					entity.budgetId = budgetId;
					entity.deviceKnowledge = budgetKnowledge.getNextValue();
				});
			}
		};

		// Call the updateEntities method on each type of entity array in the passed entities collection 
		setBudgetIdAndDeviceKnowledge(entitiesCollection.accounts);
		setBudgetIdAndDeviceKnowledge(entitiesCollection.accountMappings);
		setBudgetIdAndDeviceKnowledge(entitiesCollection.masterCategories);
		setBudgetIdAndDeviceKnowledge(entitiesCollection.monthlyBudgets);
		setBudgetIdAndDeviceKnowledge(entitiesCollection.monthlySubCategoryBudgets);
		setBudgetIdAndDeviceKnowledge(entitiesCollection.payees);
		setBudgetIdAndDeviceKnowledge(entitiesCollection.payeeLocations);
		setBudgetIdAndDeviceKnowledge(entitiesCollection.payeeRenameConditions);
		setBudgetIdAndDeviceKnowledge(entitiesCollection.scheduledSubTransactions);
		setBudgetIdAndDeviceKnowledge(entitiesCollection.scheduledTransactions);
		setBudgetIdAndDeviceKnowledge(entitiesCollection.settings);
		setBudgetIdAndDeviceKnowledge(entitiesCollection.subCategories);
		setBudgetIdAndDeviceKnowledge(entitiesCollection.subTransactions);
		setBudgetIdAndDeviceKnowledge(entitiesCollection.transactions);

		// Create queries to persist these entities
		var queriesList:Array<IDatabaseQuery> = [];
		queriesList = _.concat(
			// Get the Data Persistence Queries for saving these entities
			_.map(entitiesCollection.accounts, (entity)=>{ return budgetueries.AccountQueries.insertDatabaseObject(entity); }),
			_.map(entitiesCollection.accountMappings, (entity)=>{ return budgetueries.AccountMappingQueries.insertDatabaseObject(entity); }),
			_.map(entitiesCollection.masterCategories, (entity)=>{ return budgetueries.MasterCategoryQueries.insertDatabaseObject(entity); }),
			_.map(entitiesCollection.monthlyBudgets, (entity)=>{ return budgetueries.MonthlyBudgetQueries.insertDatabaseObject(entity); }),
			_.map(entitiesCollection.monthlySubCategoryBudgets, (entity)=>{ return budgetueries.MonthlySubCategoryBudgetQueries.insertDatabaseObject(entity); }),
			_.map(entitiesCollection.payees, (entity)=>{ return budgetueries.PayeeQueries.insertDatabaseObject(entity); }),
			_.map(entitiesCollection.payeeLocations, (entity)=>{ return budgetueries.PayeeLocationQueries.insertDatabaseObject(entity); }),
			_.map(entitiesCollection.payeeRenameConditions, (entity)=>{ return budgetueries.PayeeRenameConditionQueries.insertDatabaseObject(entity); }),
			_.map(entitiesCollection.scheduledSubTransactions, (entity)=>{ return budgetueries.ScheduledSubTransactionQueries.insertDatabaseObject(entity); }),
			_.map(entitiesCollection.scheduledTransactions, (entity)=>{ return budgetueries.ScheduledTransactionQueries.insertDatabaseObject(entity); }),
			_.map(entitiesCollection.settings, (entity)=>{ return budgetueries.SettingQueries.insertDatabaseObject(entity); }),
			_.map(entitiesCollection.subCategories, (entity)=>{ return budgetueries.SubCategoryQueries.insertDatabaseObject(entity); }),
			_.map(entitiesCollection.subTransactions, (entity)=>{ return budgetueries.SubTransactionQueries.insertDatabaseObject(entity); }),
			_.map(entitiesCollection.transactions, (entity)=>{ return budgetueries.TransactionQueries.insertDatabaseObject(entity); })
		)

		// Get the Calculation Invalidation Queries to queue calculations
		if(entitiesCollection.accounts) {
			_.forEach(entitiesCollection.accounts, (entity)=>{ 
				var originalEntity = existingEntitiesCollection.accounts.getEntityById(entity.entityId);
				var query = budgetueries.AccountQueries.getCalculationInvalidationQuery(entity, originalEntity); 
				if(query)
					queriesList.push(query);
			});
		}

		if(queriesList.length > 0)
			return executeSqlQueriesAndSaveKnowledge(queriesList, budgetId, budgetKnowledge);
		else	
			return Promise.resolve(true);
	}

	private loadBudgetEntitiesFromDatabase(budgetId:string, deviceKnowlege:number, deviceKnowledgeForCalculations:number):Promise<IEntitiesCollection> {

		var queryList = [
			budgetueries.AccountQueries.loadDatabaseObject(budgetId, deviceKnowlege, deviceKnowledgeForCalculations),
			budgetueries.AccountMappingQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetueries.MasterCategoryQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetueries.MonthlyBudgetQueries.loadDatabaseObject(budgetId, deviceKnowlege, deviceKnowledgeForCalculations),
			budgetueries.MonthlySubCategoryBudgetQueries.loadDatabaseObject(budgetId, deviceKnowlege, deviceKnowledgeForCalculations),
			budgetueries.PayeeQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetueries.PayeeLocationQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetueries.PayeeRenameConditionQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetueries.ScheduledSubTransactionQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetueries.ScheduledTransactionQueries.loadDatabaseObject(budgetId, deviceKnowlege, deviceKnowledgeForCalculations),
			budgetueries.SettingQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetueries.SubCategoryQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetueries.SubTransactionQueries.loadDatabaseObject(budgetId, deviceKnowlege, deviceKnowledgeForCalculations),
			budgetueries.TransactionQueries.loadDatabaseObject(budgetId, deviceKnowlege, deviceKnowledgeForCalculations),
			// Also load the knowledge values that are in the database
			miscQueries.KnowledgeValueQueries.getLoadBudgetKnowledgeValueQuery(budgetId),
		];

		return executeSqlQueries(queryList)
			.then((result:any)=>{

				// Use the loaded knowledge values to update the values in the budgetKnowledge object
				this.budgetKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage = result.budgetKnowledge[0].currentDeviceKnowledge;
				this.budgetKnowledge.lastDeviceKnowledgeForCalculationsLoadedFromLocalStorage = result.budgetKnowledge[0].currentDeviceKnowledgeForCalculations;

				// resolve the promise with the result object
				return Promise.resolve(result);
			});
	}
}