/// <reference path='../_includes.ts' />

import * as _ from 'lodash';

import { executeSqlQueries, executeSqlQueriesAndSaveKnowledge } from './QueryExecutionUtility';
import { CatalogKnowledge, BudgetKnowledge } from './KnowledgeObjects';
import * as commonInterfaces from '../interfaces/common'; 
import * as catalogEntities from '../interfaces/catalogEntities'; 
import * as budgetEntities from '../interfaces/budgetEntities'; 
import { IDatabaseQuery, IReferenceDataForEnsuringMonthlyDataExists } from '../interfaces/persistence';
import { DateWithoutTime, KeyGenerator, Logger } from '../utilities';
import { InternalCategories, InternalCategoryNames, InternalPayees, SubCategoryType } from '../constants';
import * as catalogQueries from './queries/catalogQueries';
import * as budgetQueries from './queries/budgetQueries';
import * as miscQueries from './queries/miscQueries';

export class BudgetFactory {

	public createNewBudget(budget:catalogEntities.IBudget, catalogKnowledge:CatalogKnowledge):Promise<catalogEntities.IBudget> {

		Logger.info(`BudgetFactory::Creating budget ${budget.budgetName}.`);
		var subCategoryIds:Array<string> = [];
		var queriesList:Array<IDatabaseQuery> = [];
		var budgetKnowledge = new BudgetKnowledge();

		// Create the budget entity
		budget.deviceKnowledge = catalogKnowledge.getNextValue();
		queriesList.push(catalogQueries.BudgetQueries.insertDatabaseObject(budget));

		// Create any setting entities that are required
		queriesList = queriesList.concat( this.createSettings(budget.entityId, budgetKnowledge) );

		// Create the internal master category and it's sub-categories
		queriesList = queriesList.concat( this.createInternalMasterAndSubCategories(budget.entityId, 0, subCategoryIds, budgetKnowledge) );
		// Create the debt master category
		queriesList = queriesList.concat( this.createDebtPaymentMasterCategory(budget.entityId, 10000, budgetKnowledge) );

		// Create the regular master and subcategories for the new budget.
		queriesList = queriesList.concat( this.createMasterAndSubCategories(budget.entityId, "Immediate Obligations", 20000, ["Rent/Mortgage", "Electric", "Water", "Internet", "Groceries", "Transportation", "Interest & Fees"], subCategoryIds, budgetKnowledge) );
		queriesList = queriesList.concat( this.createMasterAndSubCategories(budget.entityId, "True Expenses", 30000, ["Auto Maintenance", "Home Maintenance", "Renter's Home Insurance", "Medical", "Clothing", "Gifts", "Giving", "Computer Replacement", "Software Subscriptions", "Stuff I Forgot to Budget For"], subCategoryIds, budgetKnowledge) );
		queriesList = queriesList.concat( this.createMasterAndSubCategories(budget.entityId, "Debt Payments", 40000, ["Student Loan", "Auto Loan"], subCategoryIds, budgetKnowledge) );
		queriesList = queriesList.concat( this.createMasterAndSubCategories(budget.entityId, "Quality of Life Goals", 50000, ["Vacation", "Fitness", "Education"], subCategoryIds, budgetKnowledge) );
		queriesList = queriesList.concat( this.createMasterAndSubCategories(budget.entityId, "Just for Fun", 60000, ["Dining Out", "Gaming", "Music", "Fun Money"], subCategoryIds, budgetKnowledge) );

		// Create the hidden master category
		queriesList = queriesList.concat( this.createHiddenMasterCategory(budget.entityId, 80000, budgetKnowledge) );

		// Create the monthly budgets and the monthly subcategory budgets for previous,current and next month.
		var month = DateWithoutTime.createForCurrentMonth().subtractMonths(1);
		for(var i:number = 0; i < 2; i++) {

			var query = this.createMonthlyBudgetForMonth(budget.entityId, month, null, budgetKnowledge);
			if(query)
				queriesList.push(query);

			queriesList = queriesList.concat( this.createMonthlySubCategoryBudgetsForMonth(budget.entityId, month, subCategoryIds, null, budgetKnowledge) );
			month.addMonths(1);
		}

		// Create the starting balance and balance adjustment payees
		queriesList = queriesList.concat( this.createStartingBalancePayee(budget.entityId, budgetKnowledge) );
		queriesList = queriesList.concat( this.createManualBalanceAdjustmentPayee(budget.entityId, budgetKnowledge) );
		queriesList = queriesList.concat( this.createReconciliationBalanceAdjustmentPayee(budget.entityId, budgetKnowledge) );

		// Queue a full calculation for this budget
		queriesList.push( miscQueries.CalculationQueries.getQueueCompleteCalculationQuery(budget.entityId) );

		queriesList.push( miscQueries.KnowledgeValueQueries.getSaveCatalogKnowledgeValueQuery(catalogKnowledge) );

		return executeSqlQueriesAndSaveKnowledge(queriesList, budget.entityId, budgetKnowledge)
			.then((result:any)=>{

				return budget;
			});
	}

	public createMonthlyBudgetDataForMonth(budgetId:string, 
										month:DateWithoutTime,
										queueCalculations:boolean,
										budgetKnowledge:BudgetKnowledge):Promise<any> {

		var referenceData:IReferenceDataForEnsuringMonthlyDataExists;
		
		return this.getReferenceDataForEnsuringMonthlyDataExists(budgetId, month)
			.then((data:IReferenceDataForEnsuringMonthlyDataExists)=> {
				
				referenceData = data;
				
				// We need to load all the subcategories from the database so we can create
				// monthly subcategory budget entities for the month.
				var query = budgetQueries.SubCategoryQueries.getAllSubCategories(budgetId, true);
				return executeSqlQueries([query])
			}).then((result:any)=>{

				var query:IDatabaseQuery;
				var queriesList:Array<IDatabaseQuery> = [];
				var subCategories:Array<budgetEntities.ISubCategory> = result.subCategories;
				var subCategoryIds:Array<string>  = _.map(_.filter(subCategories, (subCategory)=>{
					return subCategory.internalName != InternalCategories.SplitSubCategory;
				}), "entityId") as Array<string>;

				var query = this.createMonthlyBudgetForMonth(budgetId, month, referenceData, budgetKnowledge);
				if(query)
					queriesList.push(query);

				queriesList = queriesList.concat( this.createMonthlySubCategoryBudgetsForMonth(budgetId, month, subCategoryIds, referenceData, budgetKnowledge) );

				if(queueCalculations) {

					// Iterate through all the subcategories and queue a monthly subcategory budget calculation for each of them
					_.forEach(subCategoryIds, (subCategoryId:string)=>{

						query = miscQueries.CalculationQueries.getQueueMonthlySubCategoryBudgetCalculationQuery(budgetId, subCategoryId, month.toISOString());
						queriesList.push(query);
					});
				}

				return executeSqlQueriesAndSaveKnowledge(queriesList, budgetId, budgetKnowledge);
			});
	}

	public cloneBudget(budgetIdOfOriginalBudget:string,
						clonedBudgetName:string,
						catalogKnowledge:CatalogKnowledge):Promise<string> {

		var queriesList:Array<IDatabaseQuery> = [];
		var budgetKnowledge = new BudgetKnowledge();
		var budgetId = KeyGenerator.generateUUID();
		var userBudgetId = KeyGenerator.generateUUID();

		// Let's first load all the entities for this budget
		queriesList.push(catalogQueries.BudgetQueries.findBudgetById(budgetIdOfOriginalBudget));
		queriesList.push(budgetQueries.AccountMappingQueries.getAllAccountMappings(budgetIdOfOriginalBudget));
		queriesList.push(budgetQueries.AccountQueries.getAllAccounts(budgetIdOfOriginalBudget));
		queriesList.push(budgetQueries.AccountQueries.getAllAccountMonthlyCalculations(budgetIdOfOriginalBudget));
		queriesList.push(budgetQueries.MasterCategoryQueries.getAllMasterCategories(budgetIdOfOriginalBudget));
		queriesList.push(budgetQueries.MonthlyBudgetQueries.getAllMonthlyBudgets(budgetIdOfOriginalBudget));
		queriesList.push(budgetQueries.MonthlySubCategoryBudgetQueries.getAllMonthlySubCategoryBudgets(budgetIdOfOriginalBudget));
		queriesList.push(budgetQueries.PayeeLocationQueries.getAllPayeeLocations(budgetIdOfOriginalBudget));
		queriesList.push(budgetQueries.PayeeQueries.getAllPayees(budgetIdOfOriginalBudget));
		queriesList.push(budgetQueries.PayeeRenameConditionQueries.getAllPayeeRenameConditions(budgetIdOfOriginalBudget));
		queriesList.push(budgetQueries.ScheduledSubTransactionQueries.getAllScheduledSubTransactions(budgetIdOfOriginalBudget));
		queriesList.push(budgetQueries.ScheduledTransactionQueries.getAllScheduledTransactions(budgetIdOfOriginalBudget));
		queriesList.push(budgetQueries.SettingQueries.getAllSettings(budgetIdOfOriginalBudget));
		queriesList.push(budgetQueries.SubCategoryQueries.getAllSubCategories(budgetIdOfOriginalBudget));
		queriesList.push(budgetQueries.SubTransactionQueries.getAllSubTransactions(budgetIdOfOriginalBudget));
		queriesList.push(budgetQueries.TransactionQueries.getAllTransactions(budgetIdOfOriginalBudget));

		return executeSqlQueries(queriesList)
			.then((result:any)=>{

				var existingBudget = result.budgets && result.budgets[0] ? result.budgets[0] : null;
				if(!existingBudget)
					Promise.reject("Existing budget for cloning was not found.");

				queriesList = [];
				var entityIdsMap = {};

				// Create the budget entity
				queriesList.push(catalogQueries.BudgetQueries.insertDatabaseObject({
					entityId: budgetId,
					budgetName: clonedBudgetName,
					dataFormat: existingBudget.dataFormat,
					lastAccessedOn: null,
					firstMonth: existingBudget.firstMonth,
					lastMonth: existingBudget.lastMonth,
					isTombstone: 0,
					deviceKnowledge: catalogKnowledge.getNextValue()
				}));

				var cloningFunction = (dbObjects:Array<commonInterfaces.IBudgetEntity>,
										queryFunc:(dbObject:commonInterfaces.IBudgetEntity, deviceKnowledge:number)=>IDatabaseQuery,
										additionalProcessingFunction:(dbObject:commonInterfaces.IBudgetEntity)=>void = null)=>{

					if(dbObjects && dbObjects.length > 0) {

						_.forEach(dbObjects, (dbObject:commonInterfaces.IBudgetEntity)=>{

							// Generate a new entityId value for this entity
							let newEntityId = KeyGenerator.generateUUID();
							// Put this new entityId against the original entityId of the entity
							entityIdsMap[dbObject.entityId] = newEntityId;
							// Update the budgetId and the entityId of this entity
							dbObject.budgetId = budgetId;
							dbObject.entityId = newEntityId;
							dbObject.deviceKnowledge = 1;
							// If there is some additional processing that needs to be done, then do that here
							if(additionalProcessingFunction)
								additionalProcessingFunction(dbObject);
							// Generate the query to insert this entity into the database
							queriesList.push(queryFunc(dbObject, 1));
						});
					}
				}

				// Iterate through the setting entities and clone them
				cloningFunction(result.settings, budgetQueries.SettingQueries.insertDatabaseObject);

				// Iterate through the master category entities and clone them
				cloningFunction(result.masterCategories, budgetQueries.MasterCategoryQueries.insertDatabaseObject);

				// Iterate through the subcategory entities and clone them
				cloningFunction(result.subCategories, budgetQueries.SubCategoryQueries.insertDatabaseObject, (subCategory:budgetEntities.ISubCategory)=>{

					// Lookup and replace the old master category id with the new id from the map
					subCategory.masterCategoryId = entityIdsMap[subCategory.masterCategoryId];
					if(subCategory.accountId)
						subCategory.accountId = entityIdsMap[subCategory.accountId];
					if(subCategory.isHidden == 1 && subCategory.internalName)
						subCategory.internalName = entityIdsMap[subCategory.internalName];
				});

				// Iterate through the account entities and clone them
				cloningFunction(result.accounts, budgetQueries.AccountQueries.insertDatabaseObject);

				// Iterate through the accounts mapping entities and clone them
				cloningFunction(result.accountMappings, budgetQueries.AccountMappingQueries.insertDatabaseObject, (accountMapping:budgetEntities.IAccountMapping)=>{

					// Lookup and replace the old account id with the new id from the map
					accountMapping.accountId = entityIdsMap[accountMapping.accountId];
				});

				// Iterate through the payee entities and clone them
				cloningFunction(result.payees, budgetQueries.PayeeQueries.insertDatabaseObject, (payee:budgetEntities.IPayee)=>{

					// Lookup and replace the old account id with the new id from the map
					if(payee.accountId)
						payee.accountId = entityIdsMap[payee.accountId];

					// Lookup and replace the old autoFillSubCategoryId with the new id from the map
					if(payee.autoFillSubCategoryId)
						payee.autoFillSubCategoryId = entityIdsMap[payee.autoFillSubCategoryId];
				});

				// Iterate through the payee location entities and clone them
				cloningFunction(result.payeeLocations, budgetQueries.PayeeLocationQueries.insertDatabaseObject, (payeeLocation:budgetEntities.IPayeeLocation)=>{

					// Lookup and replace the old payee id with the new id from the map
					payeeLocation.payeeId = entityIdsMap[payeeLocation.payeeId];
				});

				// Iterate through the payee rename conditions entities and clone them
				cloningFunction(result.payeeRenameConditions, budgetQueries.PayeeRenameConditionQueries.insertDatabaseObject, (payeeRenameCondition:budgetEntities.IPayeeRenameCondition)=>{

					// Lookup and replace the old payee id with the new id from the map
					payeeRenameCondition.payeeId = entityIdsMap[payeeRenameCondition.payeeId];
				});

				// Iterate through the scheduled transaction entities and clone them
				cloningFunction(result.scheduledTransactions, budgetQueries.ScheduledTransactionQueries.insertDatabaseObject, (scheduledTransaction:budgetEntities.IScheduledTransaction)=>{

					// Lookup and replace the old ids with the new ids from the map
					scheduledTransaction.accountId = entityIdsMap[scheduledTransaction.accountId];
					scheduledTransaction.payeeId = entityIdsMap[scheduledTransaction.payeeId];
					scheduledTransaction.subCategoryId = entityIdsMap[scheduledTransaction.subCategoryId];
					scheduledTransaction.transferAccountId = entityIdsMap[scheduledTransaction.transferAccountId];
				});

				// Iterate through the scheduled sub-transaction entities and clone them
				cloningFunction(result.scheduledSubTransactions, budgetQueries.ScheduledSubTransactionQueries.insertDatabaseObject, (scheduledSubTransaction:budgetEntities.IScheduledSubTransaction)=>{

					// Lookup and replace the old ids with the new ids from the map
					scheduledSubTransaction.scheduledTransactionId = entityIdsMap[scheduledSubTransaction.scheduledTransactionId];
					scheduledSubTransaction.payeeId = entityIdsMap[scheduledSubTransaction.payeeId];
					scheduledSubTransaction.subCategoryId = entityIdsMap[scheduledSubTransaction.subCategoryId];
					scheduledSubTransaction.transferAccountId = entityIdsMap[scheduledSubTransaction.transferAccountId];
				});

				// Iterate through the transaction entities and clone them
				cloningFunction(result.transactions, budgetQueries.TransactionQueries.insertDatabaseObject, (transaction:budgetEntities.ITransaction)=>{

					// Lookup and replace the old ids with the new ids from the map
					transaction.accountId = entityIdsMap[transaction.accountId];
					transaction.payeeId = entityIdsMap[transaction.payeeId];
					transaction.subCategoryId = entityIdsMap[transaction.subCategoryId];
					transaction.transferAccountId = entityIdsMap[transaction.transferAccountId];
					transaction.transferTransactionId = entityIdsMap[transaction.transferTransactionId];
					transaction.transferSubTransactionId = entityIdsMap[transaction.transferSubTransactionId];
					transaction.scheduledTransactionId = entityIdsMap[transaction.scheduledTransactionId];
					transaction.matchedTransactionId = entityIdsMap[transaction.matchedTransactionId];
				});

				// Iterate through the sub-transaction entities and clone them
				cloningFunction(result.subTransactions, budgetQueries.SubTransactionQueries.insertDatabaseObject, (subTransaction:budgetEntities.ISubTransaction)=>{

					// Lookup and replace the old ids with the new ids from the map
					subTransaction.transactionId = entityIdsMap[subTransaction.transactionId];
					subTransaction.payeeId = entityIdsMap[subTransaction.payeeId];
					subTransaction.subCategoryId = entityIdsMap[subTransaction.subCategoryId];
					subTransaction.transferAccountId = entityIdsMap[subTransaction.transferAccountId];
					subTransaction.transferTransactionId = entityIdsMap[subTransaction.transferTransactionId];
				});

				// Iterate through the accounts monthly calculation entities and clone them
				if(result.accountMonthlyCalculations && result.accountMonthlyCalculations.length > 0) {

					_.forEach(result.accountMonthlyCalculations, (accountMonthlyCalculation:budgetEntities.IAccountMonthlyCalculation)=>{

						let accountId = entityIdsMap[accountMonthlyCalculation.accountId];
						let month = DateWithoutTime.createFromISOString(accountMonthlyCalculation.month);
						// Generate a new entityId value for this entity
						let newEntityId = KeyGenerator.getAccountMonthlyCalculationIdentity(accountId, month);
						// Update the budgetId and the entityId of this entity
						accountMonthlyCalculation.budgetId = budgetId;
						accountMonthlyCalculation.entityId = newEntityId;
						accountMonthlyCalculation.deviceKnowledge = 1;
						// Generate the query to insert this entity into the database
						queriesList.push(budgetQueries.AccountQueries.insertMonthlyCalculationDatabaseObject(accountMonthlyCalculation));
					});
				}

				// Iterate through the monthly budget entities and clone them
				if(result.monthlyBudgets && result.monthlyBudgets.length > 0) {

					_.forEach(result.monthlyBudgets, (monthlyBudget:budgetEntities.IMonthlyBudget)=>{

						let month = DateWithoutTime.createFromISOString(monthlyBudget.month);
						// Generate a new entityId value for this entity
						let newEntityId = KeyGenerator.getMonthlyBudgetIdentity(budgetId, month);
						// Update the budgetId and the entityId of this entity
						monthlyBudget.budgetId = budgetId;
						monthlyBudget.entityId = newEntityId;
						monthlyBudget.deviceKnowledge = 1;
						// Generate the query to insert this entity into the database
						queriesList.push(budgetQueries.MonthlyBudgetQueries.insertDatabaseObject(monthlyBudget));
					});
				}

				// Iterate through the monthly subcategory budget entities and clone them
				if(result.monthlySubCategoryBudgets && result.monthlySubCategoryBudgets.length > 0) {

					_.forEach(result.monthlySubCategoryBudgets, (monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget)=>{

						let month = KeyGenerator.extractMonthFromMonthlySubCategoryBudgetIdentity(monthlySubCategoryBudget.entityId);
						let subCategoryId = entityIdsMap[monthlySubCategoryBudget.subCategoryId];
						// Generate a new entityId value for this entity
						let newEntityId = KeyGenerator.getMonthlySubCategoryBudgetIdentity(subCategoryId, month);
						let newParentEntityId = KeyGenerator.getMonthlyBudgetIdentity(budgetId, month);
						// Update the budgetId and the entityId of this entity
						monthlySubCategoryBudget.budgetId = budgetId;
						monthlySubCategoryBudget.entityId = newEntityId;
						monthlySubCategoryBudget.monthlyBudgetId = newParentEntityId;
						monthlySubCategoryBudget.subCategoryId = subCategoryId;
						monthlySubCategoryBudget.deviceKnowledge = 1;
						// Generate the query to insert this entity into the database
						queriesList.push(budgetQueries.MonthlySubCategoryBudgetQueries.insertDatabaseObject(monthlySubCategoryBudget));
					});
				}

				// Update the budget knowledge object for this budget and save that
				// DeviceKnowledge is stored on both the clients and the server on a per-budget basis, so we'll start this
				// budget's knowledge off at 1.
				budgetKnowledge.currentDeviceKnowledge = 1;
				budgetKnowledge.deviceKnowledgeOfServer = 0;
				budgetKnowledge.serverKnowledgeOfDevice = 0;

				queriesList.push( miscQueries.KnowledgeValueQueries.getSaveCatalogKnowledgeValueQuery(catalogKnowledge) );

				// Execute the queries
				return executeSqlQueriesAndSaveKnowledge(queriesList, budgetId, budgetKnowledge);
			})
			.then((result:any)=>{

				return budgetId;
			});
	}
	
	private getReferenceDataForEnsuringMonthlyDataExists(budgetId:string, month:DateWithoutTime):Promise<IReferenceDataForEnsuringMonthlyDataExists> {

		var queriesList:Array<IDatabaseQuery> = [
			budgetQueries.MasterCategoryQueries.getAllMasterCategories(budgetId),
			budgetQueries.SubCategoryQueries.getAllSubCategories(budgetId),
			budgetQueries.MonthlyBudgetQueries.findMonthlyBudgetByMonth(budgetId, month),
			budgetQueries.MonthlySubCategoryBudgetQueries.findMonthlySubCategoryBudgetByMonth(budgetId, month)
		];

		return executeSqlQueries(queriesList)
			.then((result:IReferenceDataForEnsuringMonthlyDataExists)=>{

				// Build maps for the loaded entities
				result.masterCategoriesMap = _.keyBy<budgetEntities.IMasterCategory>(result.masterCategories, 'entityId');
				result.subCategoriesMap = _.keyBy<budgetEntities.ISubCategory>(result.subCategories, 'entityId');
				result.monthlyBudgetsMap = _.keyBy<budgetEntities.IMonthlyBudget>(result.monthlyBudgets, 'entityId');
				result.monthlySubCategoryBudgetsMap = _.keyBy<budgetEntities.IMonthlySubCategoryBudget>(result.monthlySubCategoryBudgets, 'entityId');
				return result;
			});
	}

	// *************************************************************************************************************
	// Internal Methods to create budget entities
	// *************************************************************************************************************
	private createSettings(budgetId:string, budgetKnowledge:BudgetKnowledge):Array<IDatabaseQuery> {

		return [];
	}

	private createInternalMasterAndSubCategories(budgetId:string, sortableIndex:number, subCategoryIds:Array<string>, budgetKnowledge:BudgetKnowledge):Array<IDatabaseQuery> {

		var queriesList:Array<IDatabaseQuery> = [];
		var internalMasterCategoryId:string = KeyGenerator.generateUUID();
		var immediateIncomeSubCategoryId:string = KeyGenerator.generateUUID();
		var splitSubCategoryId:string = KeyGenerator.generateUUID();
		var uncategorizedSubCategoryId:string = KeyGenerator.generateUUID();

		// Save these sub-category ids in the static array so that we can later generate monthly subcategory budget entities for these
		subCategoryIds.push(immediateIncomeSubCategoryId);
		subCategoryIds.push(splitSubCategoryId);
		subCategoryIds.push(uncategorizedSubCategoryId);

		// Create the internal master category entity
		queriesList = queriesList.concat(budgetQueries.MasterCategoryQueries.insertDatabaseObject({
			budgetId: budgetId,
			entityId: internalMasterCategoryId,
			isTombstone: 0,
			internalName: InternalCategories.InternalMasterCategory,
			deletable: 0,
			sortableIndex: sortableIndex,
			name: InternalCategoryNames.InternalMasterCategory,
			note: null,
			isHidden: 0,
			deviceKnowledge: budgetKnowledge.getNextValue()
		}));

		// Create the immediate income subcategory
		queriesList = queriesList.concat(budgetQueries.SubCategoryQueries.insertDatabaseObject({
			budgetId: budgetId,
			entityId: immediateIncomeSubCategoryId,
			isTombstone: 0,
			masterCategoryId: internalMasterCategoryId,
			accountId: null,
			internalName: InternalCategories.ImmediateIncomeSubCategory,
			sortableIndex: 10000,
			pinnedIndex: null,
			name: InternalCategoryNames.ImmediateIncomeSubCategory,
			type: null,
			note: null,
			isHidden: 0,
			goalType: null,
			goalCreationMonth:null,
			targetBalance:null,
			targetBalanceMonth:null,
			monthlyFunding:null,
			deviceKnowledge: budgetKnowledge.getNextValue()
		}));

		// Create the split subcategory
		queriesList = queriesList.concat(budgetQueries.SubCategoryQueries.insertDatabaseObject({
			budgetId: budgetId,
			entityId: splitSubCategoryId,
			isTombstone: 0,
			masterCategoryId: internalMasterCategoryId,
			accountId: null,
			internalName: InternalCategories.SplitSubCategory,
			sortableIndex: 30000,
			pinnedIndex: null,
			name: InternalCategoryNames.SplitSubCategory,
			type: null,
			note: null,
			isHidden: 0,
			goalType: null,
			goalCreationMonth:null,
			targetBalance:null,
			targetBalanceMonth:null,
			monthlyFunding:null,
			deviceKnowledge: budgetKnowledge.getNextValue()
		}));

		// Create the uncategorized subcategory
		queriesList = queriesList.concat(budgetQueries.SubCategoryQueries.insertDatabaseObject({
			budgetId: budgetId,
			entityId: uncategorizedSubCategoryId,
			isTombstone: 0,
			masterCategoryId: internalMasterCategoryId,
			accountId: null,
			internalName: InternalCategories.UncategorizedSubCategory,
			sortableIndex: 40000,
			pinnedIndex: null,
			name: InternalCategoryNames.UncategorizedSubCategory,
			type: null,
			note: null,
			isHidden: 0,
			goalType: null,
			goalCreationMonth:null,
			targetBalance:null,
			targetBalanceMonth:null,
			monthlyFunding:null,
			deviceKnowledge: budgetKnowledge.getNextValue()
		}));

		return queriesList;
	}

	private createDebtPaymentMasterCategory(budgetId:string, sortableIndex:number, budgetKnowledge:BudgetKnowledge):IDatabaseQuery {

		var debtMasterCategoryId:string = KeyGenerator.generateUUID();
		var query = budgetQueries.MasterCategoryQueries.insertDatabaseObject({
			budgetId: budgetId,
			entityId: debtMasterCategoryId,
			isTombstone: 0,
			internalName: InternalCategories.DebtPaymentMasterCategory,
			deletable: 0,
			sortableIndex: sortableIndex,
			name: InternalCategoryNames.DebtPaymentMasterCategory,
			note: null,
			isHidden: 0,
			deviceKnowledge: budgetKnowledge.getNextValue()
		});

		return query;
	}

	private createHiddenMasterCategory(budgetId:string, sortableIndex:number, budgetKnowledge:BudgetKnowledge):IDatabaseQuery {

		var hiddenMasterCategoryId:string = KeyGenerator.generateUUID();
		var query = budgetQueries.MasterCategoryQueries.insertDatabaseObject({
			budgetId: budgetId,
			entityId: hiddenMasterCategoryId,
			isTombstone: 0,
			internalName: InternalCategories.HiddenMasterCategory,
			deletable: 0,
			sortableIndex: sortableIndex,
			name: InternalCategoryNames.HiddenMasterCategory,
			note: null,
			isHidden: 0,
			deviceKnowledge: budgetKnowledge.getNextValue()
		});

		return query;
	}

	private createMasterAndSubCategories(budgetId:string, masterCategoryName:string, sortableIndex:number, subCategoryNames:Array<string>,
											subCategoryIds:Array<string>, budgetKnowledge:BudgetKnowledge):Array<IDatabaseQuery> {

		var queriesList:Array<IDatabaseQuery> = [];

		// Create the master category entity
		var masterCategoryId:string = KeyGenerator.generateUUID();
		queriesList.push(budgetQueries.MasterCategoryQueries.insertDatabaseObject({
			budgetId: budgetId,
			entityId: masterCategoryId,
			isTombstone: 0,
			internalName: null,
			deletable: 1,
			sortableIndex: sortableIndex,
			name: masterCategoryName,
			note: null,
			isHidden: 0,
			deviceKnowledge: budgetKnowledge.getNextValue()
		}));

		var subCategorySortableIndex = 0;
		subCategoryNames.forEach((subCategoryName:string)=>{

			// Create the subcategory
			var subCategoryId:string = KeyGenerator.generateUUID();
			queriesList.push(budgetQueries.SubCategoryQueries.insertDatabaseObject({
				budgetId: budgetId,
				entityId: subCategoryId,
				isTombstone: 0,
				masterCategoryId: masterCategoryId,
				accountId: null,
				internalName: null,
				sortableIndex: subCategorySortableIndex,
				pinnedIndex: null,
				name: subCategoryName,
				type: SubCategoryType.Default,
				note: null,
				isHidden: 0,
				goalType: null,
				goalCreationMonth: null,
				targetBalance: null,
				targetBalanceMonth: null,
				monthlyFunding: null,
				deviceKnowledge: budgetKnowledge.getNextValue()
			}));

			subCategorySortableIndex += 10000;

			// Save this sub-category id in the static array so that we can later generate monthly subcategory budget entity for this
			subCategoryIds.push(subCategoryId);
		});

		return queriesList;
	}

	private createMonthlyBudgetForMonth(budgetId:string, month:DateWithoutTime, referenceData:IReferenceDataForEnsuringMonthlyDataExists, budgetKnowledge:BudgetKnowledge):IDatabaseQuery {

		var query:IDatabaseQuery;
		var monthlyBudgetId = KeyGenerator.getMonthlyBudgetIdentity(budgetId, month);
		var existingMonthlyBudget:budgetEntities.IMonthlyBudget = referenceData ? referenceData.monthlyBudgetsMap[monthlyBudgetId] : null;

		// Create the monthly budget only if it doesn't already exist
		if(!existingMonthlyBudget) {

			query = budgetQueries.MonthlyBudgetQueries.insertDatabaseObject({
				budgetId: budgetId,
				entityId: monthlyBudgetId,
				isTombstone: 0,
				month: month.toISOString(),
				note: null,
				previousIncome: 0,
				immediateIncome: 0,
				budgeted: 0,
				cashOutflows: 0,
				creditOutflows: 0,
				balance: 0,
				overSpent: 0,
				availableToBudget: 0,
				uncategorizedCashOutflows: 0,
				uncategorizedCreditOutflows: 0,
				uncategorizedBalance: 0,
				hiddenBudgeted: 0,
				hiddenCashOutflows: 0,
				hiddenCreditOutflows: 0,
				hiddenBalance: 0,
				additionalToBeBudgeted: 0,
				ageOfMoney: null,
				deviceKnowledge: budgetKnowledge.getNextValue(),
				deviceKnowledgeForCalculatedFields: 0
			});
		}

		return query;
	}

	private createMonthlySubCategoryBudgetsForMonth(budgetId:string, 
													month:DateWithoutTime, 
													subCategoryIds:Array<string>, 
													referenceData:IReferenceDataForEnsuringMonthlyDataExists, 
													budgetKnowledge:BudgetKnowledge):Array<IDatabaseQuery> {

		var queriesList:Array<IDatabaseQuery> = [];
		var monthlyBudgetId = KeyGenerator.getMonthlyBudgetIdentity(budgetId, month);
		// Iterate through all the subCategoryIds and generate monthly subcategory budget entities for all of them
		subCategoryIds.forEach((subCategoryId:string)=>{

			var monthlySubCategoryBudgetId = KeyGenerator.getMonthlySubCategoryBudgetIdentity(subCategoryId, month);
			var existingMonthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget = referenceData ? referenceData.monthlySubCategoryBudgetsMap[monthlySubCategoryBudgetId] : null;

			// Create the monthly subcategory budget only if it doesn't already exist
			if(!existingMonthlySubCategoryBudget) {

				var subCategory:budgetEntities.ISubCategory = referenceData ? referenceData.subCategoriesMap[subCategoryId] : null;
				var masterCategory:budgetEntities.IMasterCategory = subCategory ? referenceData.masterCategoriesMap[subCategory.masterCategoryId] : null;

				queriesList.push(budgetQueries.MonthlySubCategoryBudgetQueries.insertDatabaseObject({
					budgetId: budgetId,
					entityId: monthlySubCategoryBudgetId,
					isTombstone: 0,
					monthlyBudgetId: monthlyBudgetId,
					month: month.toISOString(),
					subCategoryId: subCategoryId,
					budgeted: 0,
					note: null,
					cashOutflows: 0,
					positiveCashOutflows: 0,
					creditOutflows: 0,
					balance: 0,
					budgetedCashOutflows: 0,
					budgetedCreditOutflows: 0,
					unBudgetedCashOutflows: 0,
					unBudgetedCreditOutflows: 0,
					budgetedPreviousMonth: 0,
					spentPreviousMonth: 0,
					paymentPreviousMonth: 0,
					balancePreviousMonth: 0,
					budgetedAverage: 0,
					paymentAverage: 0,
					spentAverage: 0,
					budgetedSpending: 0,
					allSpending: 0,
					allSpendingSinceLastPayment: 0,
					additionalToBeBudgeted: 0,
					upcomingTransactions: 0,
					upcomingTransactionsCount: 0,
					goalTarget: 0,
					goalOverallFunded: 0,
					goalOverallLeft: 0,
					goalUnderFunded: 0,
					goalExpectedCompletion: 0,
					deviceKnowledge: budgetKnowledge.getNextValue(),
					deviceKnowledgeForCalculatedFields: 0
				}));
			}
		});

		return queriesList;
	}

	private createStartingBalancePayee(budgetId:string, budgetKnowledge:BudgetKnowledge):IDatabaseQuery {

		var payeeId:string = KeyGenerator.generateUUID();
		var query = budgetQueries.PayeeQueries.insertDatabaseObject({
			budgetId: budgetId,
			entityId: payeeId,
			isTombstone: 0,
			accountId: null,
			enabled: 0,
			autoFillSubCategoryId: null,
			name: "Starting Balance",
			internalName: InternalPayees.StartingBalance,
			deviceKnowledge: budgetKnowledge.getNextValue()
		});

		return query;
	}

	private createManualBalanceAdjustmentPayee(budgetId:string, budgetKnowledge:BudgetKnowledge):IDatabaseQuery {

		var payeeId:string = KeyGenerator.generateUUID();
		var query = budgetQueries.PayeeQueries.insertDatabaseObject({
			budgetId: budgetId,
			entityId: payeeId,
			isTombstone: 0,
			accountId: null,
			enabled: 0,
			autoFillSubCategoryId: null,
			name: "Manual Balance Adjustment",
			internalName: InternalPayees.ManualBalanceAdjustment,
			deviceKnowledge: budgetKnowledge.getNextValue()
		});

		return query;
	}

	private createReconciliationBalanceAdjustmentPayee(budgetId:string, budgetKnowledge:BudgetKnowledge):IDatabaseQuery {

		var payeeId:string = KeyGenerator.generateUUID();
		var query = budgetQueries.PayeeQueries.insertDatabaseObject({
			budgetId: budgetId,
			entityId: payeeId,
			isTombstone: 0,
			accountId: null,
			enabled: 0,
			autoFillSubCategoryId: null,
			name: "Reconciliation Balance Adjustment",
			deviceKnowledge: budgetKnowledge.getNextValue(),
			internalName: InternalPayees.ReconciliationBalanceAdjustment,
		});

		return query;
	}
}