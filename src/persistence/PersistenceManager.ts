/// <reference path='../_includes.ts' />

import * as _ from 'lodash';

import { BudgetFactory } from './BudgetFactory';
import { DatabaseFactory } from './DatabaseFactory';
import { EntityFactory } from './EntityFactory';
import { CalculationsManager } from './CalculationsManager';
import { DropboxManager } from './DropboxManager';
import * as commonInterfaces from '../interfaces/common'; 
import { IImportedAccountObject } from '../interfaces/objects';
import * as catalogEntities from '../interfaces/catalogEntities';
import * as budgetEntities from '../interfaces/budgetEntities';
import * as catalogQueries from './queries/catalogQueries';
import * as budgetQueries from './queries/budgetQueries';
import * as persistenceHelpers from './helpers';
import * as miscQueries from './queries/miscQueries';
import { IDatabaseQuery } from '../interfaces/persistence';
import { DateWithoutTime, Logger, KeyGenerator } from '../utilities';
import { CatalogKnowledge, BudgetKnowledge } from './KnowledgeObjects';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../interfaces/state/IEntitiesCollection';
import { executeSqlQueries, executeSqlQueriesAndSaveKnowledge, setDatabaseReference } from './QueryExecutionUtility';
import { IScheduledTransactionCalculationsResult } from '../interfaces/calculations';

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

	private deviceId:string;
	private catalogKnowledge:CatalogKnowledge;
	private budgetKnowledge:BudgetKnowledge;
	private activeBudget:catalogEntities.IBudget;
	private calculationsManager:CalculationsManager = new CalculationsManager();
	private dropboxManager:DropboxManager = new DropboxManager();

	// Persistence helper classes for catalog entities
	private budgetHelper = new persistenceHelpers.BudgetHelper();
	private globalSettingHelper = new persistenceHelpers.GlobalSettingHelper();

	// Persistence helper classes for budget entities
	private accountHelper = new persistenceHelpers.AccountHelper();
	private masterCategoryHelper = new persistenceHelpers.MasterCategoryHelper();
	private monthlyBudgetHelper = new persistenceHelpers.MonthlyBudgetHelper();
	private monthlySubCategoryBudgetHelper = new persistenceHelpers.MonthlySubCategoryBudgetHelper();
	private payeeHelper = new persistenceHelpers.PayeeHelper();
	private payeeLocationHelper = new persistenceHelpers.PayeeLocationHelper();
	private payeeRenameConditionHelper = new persistenceHelpers.PayeeRenameConditionHelper();
	private scheduledTransactionHelper = new persistenceHelpers.ScheduledTransactionHelper();
	private settingHelper = new persistenceHelpers.SettingHelper();
	private subCategoryHelper = new persistenceHelpers.SubCategoryHelper();
	private transactionHelper = new persistenceHelpers.TransactionHelper();

	public initialize(refreshDatabaseAtStartup:boolean = false):Promise<boolean> {

		if(process.env.NODE_ENV === 'test') {

			// Open a connection to the database.
			var refDatabase = openDatabase("Envelopes", "1.0", "Envelopes Test Database", 5 * 1024 * 1024);
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
				// Get the deviceId from the database
				return this.getDeviceInformation(catalogKnowledge);
			})
			.then((deviceId:string)=>{

				this.deviceId = deviceId;
				//return this.dropboxManager.initialize(deviceId);
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
					var budgetEntity = EntityFactory.createNewBudget();
					budgetEntity.budgetName = "My Budget"; 
					return budgetFactory.createNewBudget(budgetEntity, this.catalogKnowledge);
				}
			});
	}

	public loadBudget(budget:catalogEntities.IBudget):Promise<ISimpleEntitiesCollection> {

		Logger.info(`Loading budget ${budget.budgetName}.`);
		// Set this as the currently active budget in persistence manager
		this.activeBudget = budget;
		// Load the budget knowledge values for this budget
		return this.loadBudgetKnowledgeValuesFromDatabase(budget.entityId)
			.then((budgetKnowledge:BudgetKnowledge)=>{

				this.budgetKnowledge = budgetKnowledge;
				// Run scheduled transaction calculations when opening the budget
				return this.calculationsManager.performScheduledTransactionCalculations(budget.entityId, budgetKnowledge, true);
			})
			.then((retVal:IScheduledTransactionCalculationsResult)=>{

				var catalogDeviceKnowledge = this.catalogKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
				var budgetDeviceKnowledge = this.budgetKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
				var budgetDeviceKnowledgeForCalculations = this.budgetKnowledge.lastDeviceKnowledgeForCalculationsLoadedFromLocalStorage;
				return this.loadEntitiesFromDatabase(budget.entityId, budgetDeviceKnowledge, budgetDeviceKnowledgeForCalculations, catalogDeviceKnowledge);
			});
	}

	public syncDataWithDatabase(updatedEntitiesCollection:ISimpleEntitiesCollection, existingEntitiesCollection:IEntitiesCollection):Promise<ISimpleEntitiesCollection> {

		var budgetId = this.activeBudget.entityId;
		var budgetKnowledge = this.budgetKnowledge;

		// Persist the passed entities into the database
		return this.saveEntitiesToDatabase(updatedEntitiesCollection, existingEntitiesCollection)
			.then((retVal:boolean)=>{

				// Run pending calculations
				return this.calculationsManager.performPendingCalculations(budgetId, budgetKnowledge);
			})
			.then((retVal:boolean)=>{
				
				// Load updated data from the database
				var catalogDeviceKnowledge = this.catalogKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
				var budgetDeviceKnowledge = this.budgetKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
				var budgetDeviceKnowledgeForCalculations = this.budgetKnowledge.lastDeviceKnowledgeForCalculationsLoadedFromLocalStorage;
				return this.loadEntitiesFromDatabase(budgetId, budgetDeviceKnowledge, budgetDeviceKnowledgeForCalculations, catalogDeviceKnowledge);
			});
	}

	public createNewBudget(budget:catalogEntities.IBudget):Promise<catalogEntities.IBudget> {

		// Create a blank new budget.
		let budgetFactory = new BudgetFactory();
		return budgetFactory.createNewBudget(budget, this.catalogKnowledge)
	}

	public cloneBudget(budget:catalogEntities.IBudget):Promise<ISimpleEntitiesCollection> {

		// Create a clone of the passed budget.
		let budgetFactory = new BudgetFactory();
		let clonedBudgetName = `${budget.budgetName} - Clone`;
		let clonedBudgetId = null;

		return budgetFactory.cloneBudget(budget.entityId, clonedBudgetName, this.catalogKnowledge)
			.then((budgetId:string)=>{

				clonedBudgetId = budgetId;
				// Load updated catalog data from the database so that the newly created budget entity gets loaded
				var catalogDeviceKnowledge = this.catalogKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
				return this.loadCatalogEntitiesFromDatabase(catalogDeviceKnowledge);
			});
	}

	public freshStartBudget(budget:catalogEntities.IBudget):Promise<ISimpleEntitiesCollection> {

		// Create a clone of the passed budget.
		let budgetFactory = new BudgetFactory();
		let freshStartBudgetName = `${budget.budgetName} - Fresh Started`;
		let freshStartBudgetId = null;

		return budgetFactory.freshStartBudget(budget.entityId, freshStartBudgetName, this.catalogKnowledge)
			.then((budgetId:string)=>{

				freshStartBudgetId = budgetId;
				// Load updated catalog data from the database so that the newly created budget entity gets loaded
				var catalogDeviceKnowledge = this.catalogKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
				return this.loadCatalogEntitiesFromDatabase(catalogDeviceKnowledge);
			});
	}

	public ensureMonthlyDataExistsForMonth(month:DateWithoutTime, existingEntitiesCollection:IEntitiesCollection):Promise<ISimpleEntitiesCollection> {

		var budgetId = this.activeBudget.entityId;
		var budgetKnowledge = this.budgetKnowledge;

		Logger.info(`PersistenceManager::Ensure that monthly budget data for the month of '${month.toISOString()}' already exists.`);
		var budgetFactory = new BudgetFactory();
		return budgetFactory.createMonthlyBudgetDataForMonth(budgetId, month, true, budgetKnowledge)
			.then((retVal:any)=>{

				// Run pending calculations
				Logger.info(`PersistenceManager::Performing pending calculations.`);
				return this.calculationsManager.performPendingCalculations(budgetId, budgetKnowledge);
			})
			.then((retVal:boolean)=>{
				
				Logger.info(`PersistenceManager::Loading updated data from the database.`);
				// Load updated data from the database
				var catalogDeviceKnowledge = this.catalogKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
				var budgetDeviceKnowledge = this.budgetKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
				var budgetDeviceKnowledgeForCalculations = this.budgetKnowledge.lastDeviceKnowledgeForCalculationsLoadedFromLocalStorage;
				return this.loadEntitiesFromDatabase(budgetId, budgetDeviceKnowledge, budgetDeviceKnowledgeForCalculations, catalogDeviceKnowledge);
			});
	}

	public performScheduledTransactionCalculations():Promise<ISimpleEntitiesCollection> {

		Logger.info(`PersistenceManager::Performing calculations for all scheduled transaction.`);
		var budgetId = this.activeBudget.entityId;
		var budgetKnowledge = this.budgetKnowledge;
		return this.calculationsManager.performScheduledTransactionCalculations(budgetId, budgetKnowledge, true)
			.then((retVal:IScheduledTransactionCalculationsResult)=>{
				
				Logger.info(`PersistenceManager::Loading updated data from the database.`);
				// Load updated data from the database
				var catalogDeviceKnowledge = this.catalogKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
				var budgetDeviceKnowledge = this.budgetKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
				var budgetDeviceKnowledgeForCalculations = this.budgetKnowledge.lastDeviceKnowledgeForCalculationsLoadedFromLocalStorage;
				return this.loadEntitiesFromDatabase(budgetId, budgetDeviceKnowledge, budgetDeviceKnowledgeForCalculations, catalogDeviceKnowledge);
			});
	}

	public generateUpcomingTransactionsNow(scheduledTransactionIds:Array<string>):Promise<ISimpleEntitiesCollection> {

		Logger.info(`PersistenceManager::Generating upcoming transactions for selected scheduled transactions now.`);
		var budgetId = this.activeBudget.entityId;
		var budgetKnowledge = this.budgetKnowledge;
		return this.calculationsManager.scheduledTransactionCalculations.generateUpcomingTransactionNow(budgetId, budgetKnowledge, scheduledTransactionIds)
			.then((retVal:IScheduledTransactionCalculationsResult)=>{

				Logger.info(`PersistenceManager::Running pending calculations.`);
				return this.calculationsManager.performPendingCalculations(budgetId, budgetKnowledge);
			})
			.then((retVal:boolean)=>{

				Logger.info(`PersistenceManager::Loading updated data from the database.`);
				// Load updated data from the database
				var catalogDeviceKnowledge = this.catalogKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
				var budgetDeviceKnowledge = this.budgetKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage;
				var budgetDeviceKnowledgeForCalculations = this.budgetKnowledge.lastDeviceKnowledgeForCalculationsLoadedFromLocalStorage;
				return this.loadEntitiesFromDatabase(budgetId, budgetDeviceKnowledge, budgetDeviceKnowledgeForCalculations, catalogDeviceKnowledge);
			});
	}
	// ************************************************************************************************
	// Internal/Utility Methods
	// ************************************************************************************************
	private getDeviceInformation(catalogKnowledge:CatalogKnowledge):Promise<string> {

		var queryList:Array<IDatabaseQuery> = [
			{name: "device", query: "SELECT * FROM GlobalSettings WHERE settingName = 'deviceId';", arguments: [] }
		];

		return executeSqlQueries(queryList)
			.then((result:any) => {

				var deviceRows:Array<any> = result.device;
				if(deviceRows && deviceRows.length > 0 && deviceRows[0].settingValue != null) {

					// We already have a device object. Get the deviceId from that and return
					return deviceRows[0].settingValue;
				}
				else {

					// We need to insert a row into the database for the device
					var deviceId:string = KeyGenerator.generateUUID();
					queryList = [ 
						{query: "REPLACE INTO GlobalSettings VALUES (?,?,?)", arguments: ["deviceId", deviceId, catalogKnowledge.getNextValue()]} 
					];
					return executeSqlQueries(queryList)
						.then((result:any) => {

							return deviceId;
						});
				}
			})
			.catch((error:Error) => {

				Logger.error(error);
				return null;
			});
	}

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

	private saveEntitiesToDatabase(entitiesCollection:ISimpleEntitiesCollection, existingEntitiesCollection:IEntitiesCollection):Promise<boolean> {

		var budgetId = this.activeBudget.entityId;
		var budgetKnowledge = this.budgetKnowledge;
		var catalogKnowledge = this.catalogKnowledge;

		// Create queries to persist these entities
		var queriesList:Array<IDatabaseQuery> = [];
		queriesList = _.concat(

			// Get the Data Persistence Queries for saving the catalog entities
			this.budgetHelper.getPersistenceQueries(entitiesCollection, existingEntitiesCollection, catalogKnowledge),
			this.globalSettingHelper.getPersistenceQueries(entitiesCollection, existingEntitiesCollection, catalogKnowledge),
			
			// Get the Data Persistence Queries for saving the budget entities
			this.accountHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.masterCategoryHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.monthlyBudgetHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.monthlySubCategoryBudgetHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.payeeHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.payeeLocationHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.payeeRenameConditionHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.scheduledTransactionHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.settingHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.subCategoryHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge),
			this.transactionHelper.getPersistenceQueries(budgetId, entitiesCollection, existingEntitiesCollection, budgetKnowledge)
		)

		if(queriesList.length > 0)
			return executeSqlQueriesAndSaveKnowledge(queriesList, budgetId, budgetKnowledge, catalogKnowledge);
		else	
			return Promise.resolve(true);
	}

	private loadEntitiesFromDatabase(budgetId:string, budgetDeviceKnowlege:number, budgetDeviceKnowledgeForCalculations:number, catalogDeviceKnowledge:number):Promise<ISimpleEntitiesCollection> {

		var queryList = [
			// Whenever we load the entities for a particular budget, we also update it's lastAccessedOn value
			catalogQueries.BudgetQueries.updateLastAccessedOnForBudget(budgetId),
			catalogQueries.BudgetQueries.loadDatabaseObject(catalogDeviceKnowledge),
			catalogQueries.GlobalSettingQueries.loadDatabaseObject(catalogDeviceKnowledge),
			budgetQueries.AccountQueries.loadDatabaseCalculationObject(budgetId, budgetDeviceKnowledgeForCalculations),
			budgetQueries.AccountQueries.loadDatabaseObject(budgetId, budgetDeviceKnowlege, budgetDeviceKnowledgeForCalculations),
			budgetQueries.MasterCategoryQueries.loadDatabaseObject(budgetId, budgetDeviceKnowlege),
			budgetQueries.MonthlyBudgetQueries.loadDatabaseObject(budgetId, budgetDeviceKnowlege, budgetDeviceKnowledgeForCalculations),
			budgetQueries.MonthlySubCategoryBudgetQueries.loadDatabaseObject(budgetId, budgetDeviceKnowlege, budgetDeviceKnowledgeForCalculations),
			budgetQueries.PayeeQueries.loadDatabaseObject(budgetId, budgetDeviceKnowlege),
			budgetQueries.PayeeLocationQueries.loadDatabaseObject(budgetId, budgetDeviceKnowlege),
			budgetQueries.PayeeRenameConditionQueries.loadDatabaseObject(budgetId, budgetDeviceKnowlege),
			budgetQueries.ScheduledTransactionQueries.loadDatabaseObject(budgetId, budgetDeviceKnowlege, budgetDeviceKnowledgeForCalculations),
			budgetQueries.SettingQueries.loadDatabaseObject(budgetId, budgetDeviceKnowlege),
			budgetQueries.SubCategoryQueries.loadDatabaseObject(budgetId, budgetDeviceKnowlege),
			budgetQueries.TransactionQueries.loadDatabaseObject(budgetId, budgetDeviceKnowlege, budgetDeviceKnowledgeForCalculations),
			// Also load the knowledge values that are in the database
			miscQueries.KnowledgeValueQueries.getLoadCatalogKnowledgeValueQuery(),
			miscQueries.KnowledgeValueQueries.getLoadBudgetKnowledgeValueQuery(budgetId),
		];

		return executeSqlQueries(queryList)
			.then((result:any)=>{

				// Use the loaded knowledge values to update the values in the knowledge objects
				this.catalogKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage = result.catalogKnowledge[0].currentDeviceKnowledge;
				this.budgetKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage = result.budgetKnowledge[0].currentDeviceKnowledge;
				this.budgetKnowledge.lastDeviceKnowledgeForCalculationsLoadedFromLocalStorage = result.budgetKnowledge[0].currentDeviceKnowledgeForCalculations;

				// resolve the promise with the result object
				return Promise.resolve(result);
			});
	}

	private loadCatalogEntitiesFromDatabase(catalogDeviceKnowledge:number):Promise<ISimpleEntitiesCollection> {

		var queryList = [
			catalogQueries.BudgetQueries.loadDatabaseObject(catalogDeviceKnowledge),
			catalogQueries.GlobalSettingQueries.loadDatabaseObject(catalogDeviceKnowledge),
			// Also load the knowledge values that are in the database
			miscQueries.KnowledgeValueQueries.getLoadCatalogKnowledgeValueQuery()
		];

		return executeSqlQueries(queryList)
			.then((result:any)=>{

				// Use the loaded knowledge values to update the values in the catalogKnowledge object
				this.catalogKnowledge.lastDeviceKnowledgeLoadedFromLocalStorage = result.catalogKnowledge[0].currentDeviceKnowledge;

				// resolve the promise with the result object
				return Promise.resolve(result);
			});
	}
}