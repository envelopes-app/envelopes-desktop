/// <reference path='../_includes.ts' />

import * as _ from 'lodash';

import { BudgetFactory } from './BudgetFactory';
import { DatabaseFactory } from './DatabaseFactory';
import { CalculationsManager } from './CalculationsManager';
import * as commonInterfaces from '../interfaces/common'; 
import * as catalogEntities from '../interfaces/catalogEntities';
import * as budgetEntities from '../interfaces/budgetEntities';
import * as catalogQueries from './queries/catalogQueries';
import * as budgetQueries from './queries/budgetQueries';
import * as persistenceHelpers from './helpers';
import * as miscQueries from './queries/miscQueries';
import { IDatabaseQuery } from '../interfaces/persistence';
import { DateWithoutTime, Logger } from '../utilities';
import { CatalogKnowledge, BudgetKnowledge } from './KnowledgeObjects';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../interfaces/state/IEntitiesCollection';
import { executeSqlQueries, executeSqlQueriesAndSaveKnowledge, setDatabaseReference } from './QueryExecutionUtility';

export class PersistenceManager {

	// ************************************************************************************************
	// Singleton Implementation
	// ************************************************************************************************
	private static instance:PersistenceManager;

	public static getInstance():PersistenceManager { 

		if(!PersistenceManager.instance)
			PersistenceManager.instance =  new PersistenceManager();

		return PersistenceManager.instance;
	};
	// ************************************************************************************************

	private catalogKnowledge:CatalogKnowledge;
	private budgetKnowledge:BudgetKnowledge;
	private activeBudget:catalogEntities.IBudget;
	private calculationsManager:CalculationsManager = new CalculationsManager();

	private accountHelper = new persistenceHelpers.AccountHelper();
	private accountMappingHelper = new persistenceHelpers.AccountMappingHelper();
	private masterCategoryHelper = new persistenceHelpers.MasterCategoryHelper();
	private monthlyBudgetHelper = new persistenceHelpers.MonthlyBudgetHelper();
	private monthlySubCategoryBudgetHelper = new persistenceHelpers.MonthlySubCategoryBudgetHelper();
	private payeeHelper = new persistenceHelpers.PayeeHelper();
	private payeeLocationHelper = new persistenceHelpers.PayeeLocationHelper();
	private payeeRenameConditionHelper = new persistenceHelpers.PayeeRenameConditionHelper();
	private scheduledSubTransactionHelper = new persistenceHelpers.ScheduledSubTransactionHelper();
	private scheduledTransactionHelper = new persistenceHelpers.ScheduledTransactionHelper();
	private settingHelper = new persistenceHelpers.SettingHelper();
	private subCategoryHelper = new persistenceHelpers.SubCategoryHelper();
	private subTransactionHelper = new persistenceHelpers.SubTransactionHelper();
	private transactionHelper = new persistenceHelpers.TransactionHelper();

	public initialize(refreshDatabaseAtStartup:boolean = false):Promise<boolean> {

		if(process.env.NODE_ENV === 'test') {

			// Open a connection to the database.
			var refDatabase = openDatabase("ENAB", "1.0", "ENAB Test Database", 5 * 1024 * 1024);
			// Set the reference of the database in the QueryExecutionUtility
			setDatabaseReference(refDatabase);
			// Explicitly set refreshDatabaseAtStartup to true to force a blank database
			refreshDatabaseAtStartup = true;
		}
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
					return budgetFactory.createNewBudget(this.catalogKnowledge, "My Budget", null);
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

	public loadBudgetData():Promise<ISimpleEntitiesCollection> {

		var budgetId = this.activeBudget.entityId;
		var deviceKnowledge = this.budgetKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
		var deviceKnowledgeForCalculations = this.budgetKnowledge.lastDeviceKnowledgeForCalculationsLoadedFromLocalStorage;
		return this.loadBudgetEntitiesFromDatabase(budgetId, deviceKnowledge, deviceKnowledgeForCalculations);
	}

	public syncDataWithDatabase(updatedEntitiesCollection:ISimpleEntitiesCollection, existingEntitiesCollection:IEntitiesCollection):Promise<ISimpleEntitiesCollection> {

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

	public createNewBudget(budgetName:string):Promise<catalogEntities.IBudget> {

		// Get all the budget entities from the database. We want to make sure that there are no 
		// existing budgets with the same name.
		var query = catalogQueries.BudgetQueries.getAllBudgets();
		return executeSqlQueries([query])
			.then((result:any)=>{

				if(result.budgets && result.budgets.length > 0) {
					
					var budget = _.find(result.budgets, {name: budgetName, isTombstone: false});
					if(budget)
						Promise.reject(`There is already a budget named ${budgetName} in the database.`);
				}

				// Create a blank new budget.
				var budgetFactory = new BudgetFactory();
				return budgetFactory.createNewBudget(this.catalogKnowledge, budgetName, null);
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

	public ensureMonthlyDataExistsForMonth(month:DateWithoutTime, existingEntitiesCollection:IEntitiesCollection):Promise<ISimpleEntitiesCollection> {

		var budgetId = this.activeBudget.entityId;
		var budgetKnowledge = this.budgetKnowledge;

		Logger.info(`PersistenceManager::Ensure that monthly budget data for the month of '${month.toISOString()}' already exists.'`);
		// Check if we already have data available for this month
		var monthlySubCategoryBudgetsArray = existingEntitiesCollection.monthlySubCategoryBudgets;
		var monthlySubCategoryBudgetsForMonth = monthlySubCategoryBudgetsArray.getMonthlySubCategoryBudgetsByMonth(month.toISOString());
		if(monthlySubCategoryBudgetsForMonth && monthlySubCategoryBudgetsForMonth.length > 0) {
			debugger;
			Logger.info(`PersistenceManager::The monthly budget data for the month of '${month.toISOString()}' already exists.'`);
			return Promise.resolve({});
		}
		else {

			Logger.info(`PersistenceManager::The monthly budget data for the month of '${month.toISOString()}' does not exist. Creating now.'`);
			// We did not find monthlySubCategoryBudget entities for this month, so we need to create them
			var budgetFactory = new BudgetFactory();
			return budgetFactory.createMonthlyBudgetDataForMonth(budgetId, month, true, budgetKnowledge)
				.then((retVal:any)=>{

					// Run pending calculations
					Logger.info(`PersistenceManager::Performing pending calculations.'`);
					return this.calculationsManager.performPendingCalculations(budgetId, budgetKnowledge);
				})
				.then((retVal:boolean)=>{
					
					Logger.info(`PersistenceManager::Loading updated data from the database.'`);
					// Load updated data from the database
					var deviceKnowledge = this.budgetKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
					var deviceKnowledgeForCalculations = this.budgetKnowledge.lastDeviceKnowledgeForCalculationsLoadedFromLocalStorage;
					return this.loadBudgetEntitiesFromDatabase(budgetId, deviceKnowledge, deviceKnowledgeForCalculations);
				});
		}
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

		var budgetId = this.activeBudget.entityId;
		var budgetKnowledge = this.budgetKnowledge;
		// Create queries to persist these entities
		var queriesList:Array<IDatabaseQuery> = [];
		queriesList = _.concat(

			// Get the Data Persistence Queries for saving these entities
			this.accountHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.accountMappingHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.masterCategoryHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.monthlyBudgetHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.monthlySubCategoryBudgetHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.payeeHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.payeeLocationHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.payeeRenameConditionHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.scheduledSubTransactionHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.scheduledTransactionHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.settingHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.subCategoryHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.subTransactionHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.transactionHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge)
		)

		if(queriesList.length > 0)
			return executeSqlQueriesAndSaveKnowledge(queriesList, budgetId, budgetKnowledge);
		else	
			return Promise.resolve(true);
	}

	private loadBudgetEntitiesFromDatabase(budgetId:string, deviceKnowlege:number, deviceKnowledgeForCalculations:number):Promise<ISimpleEntitiesCollection> {

		var queryList = [
			budgetQueries.AccountQueries.loadDatabaseObject(budgetId, deviceKnowlege, deviceKnowledgeForCalculations),
			budgetQueries.AccountMappingQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetQueries.MasterCategoryQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetQueries.MonthlyBudgetQueries.loadDatabaseObject(budgetId, deviceKnowlege, deviceKnowledgeForCalculations),
			budgetQueries.MonthlySubCategoryBudgetQueries.loadDatabaseObject(budgetId, deviceKnowlege, deviceKnowledgeForCalculations),
			budgetQueries.PayeeQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetQueries.PayeeLocationQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetQueries.PayeeRenameConditionQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetQueries.ScheduledSubTransactionQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetQueries.ScheduledTransactionQueries.loadDatabaseObject(budgetId, deviceKnowlege, deviceKnowledgeForCalculations),
			budgetQueries.SettingQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetQueries.SubCategoryQueries.loadDatabaseObject(budgetId, deviceKnowlege),
			budgetQueries.SubTransactionQueries.loadDatabaseObject(budgetId, deviceKnowlege, deviceKnowledgeForCalculations),
			budgetQueries.TransactionQueries.loadDatabaseObject(budgetId, deviceKnowlege, deviceKnowledgeForCalculations),
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