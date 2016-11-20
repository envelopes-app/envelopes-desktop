/// <reference path='../_includes.ts' />

import * as _ from 'lodash';

import { Logger, DateWithoutTime } from '../utilities'; 
import { IDatabaseQuery } from '../interfaces/persistence';
import { IReferenceDataForCalculations, IScheduledTransactionCalculationsResult, ICalculationQueueSummary } from '../interfaces/calculations';
import { CatalogKnowledge, BudgetKnowledge } from './KnowledgeObjects';
import { executeSqlQueries, executeSqlQueriesAndSaveKnowledge } from './QueryExecutionUtility';
import { AccountCalculations, TransactionCalculations, SubCategoryCalculations, MonthlyCalculations, ScheduledTransactionCalculations } from './calculations';
import { BudgetDateQueries, CalculationQueries } from './queries/miscQueries';
import { AccountQueries, MasterCategoryQueries, SubCategoryQueries, CommonQueries } from './queries/budgetQueries';
import * as budgetEntities from '../interfaces/budgetEntities';

export class CalculationsManager {

	protected _transactionCalculations:TransactionCalculations;
	protected _accountCalculations:AccountCalculations;
	protected _subCategoryCalculations:SubCategoryCalculations;
	protected _monthlyCalculations:MonthlyCalculations;
	protected _scheduledTransactionCalculations:ScheduledTransactionCalculations;

	public get transactionCalculations():TransactionCalculations { return this._transactionCalculations; }
	public get accountCalculations():AccountCalculations { return this._accountCalculations; }
	public get subCategoryCalculations():SubCategoryCalculations { return this._subCategoryCalculations; }
	public get monthlyCalculations():MonthlyCalculations { return this._monthlyCalculations; }
	public get scheduledTransactionCalculations():ScheduledTransactionCalculations { return this._scheduledTransactionCalculations; }

	constructor() {

		this._transactionCalculations = new TransactionCalculations();
		this._accountCalculations = new AccountCalculations();
		this._subCategoryCalculations = new SubCategoryCalculations();
		this._monthlyCalculations = new MonthlyCalculations();
		this._scheduledTransactionCalculations = new ScheduledTransactionCalculations();
	}

	public finalize():void {

		// Null out the saved references
		this._transactionCalculations = null;
		this._accountCalculations = null;
		this._subCategoryCalculations = null;
		this._monthlyCalculations = null;
		this._scheduledTransactionCalculations = null;
	}
	
	public hasPendingCalculations(budgetId:string):Promise<boolean> {

		return this.getCalculationQueueSummary(budgetId)
			.then((calculationQueueSummary:ICalculationQueueSummary)=>{
				var hasPendingCalculations = (calculationQueueSummary.queueCount > 0);
				return hasPendingCalculations;
			});
	}
	
	public performFullCalculations(budgetId:string, budgetKnowledge:BudgetKnowledge):Promise<boolean> {
		return this.performCalculations(budgetId, budgetKnowledge, true);
	}

	public performPendingCalculations(budgetId:string, budgetKnowledge:BudgetKnowledge):Promise<boolean> {
		return this.performCalculations(budgetId, budgetKnowledge);
	}
	
	public performScheduledTransactionCalculations(budgetId:string, budgetKnowledge:BudgetKnowledge, forceFullCalcs:boolean = false):Promise<IScheduledTransactionCalculationsResult> {

		if(forceFullCalcs) {
			Logger.info("CalculationsManager::performScheduledTransactionsCalculations::Performing scheduled transaction calculations for all scheduled transactions.");
			// Perform Scheduled Transaction Calculations on all the scheduled transactions 
			return this.scheduledTransactionCalculations.performCalculations(budgetId, budgetKnowledge, DateWithoutTime.createForToday(), null);
		}
		else {

			Logger.info("CalculationsManager::performScheduledTransactionsCalculations::Checking if there are any queued scheduled transaction calculations.");
			// Get the calculation queue summary to check if there are any queued scheduled transaction calculations
			return this.getCalculationQueueSummary(budgetId, false)
				.then((calculationQueueSummary:ICalculationQueueSummary)=>{

					if(calculationQueueSummary.scheduledTransactionCalculationIds) {

						Logger.info(`CalculationsManager::performScheduledTransactionsCalculations::Performing scheduled transaction calculations for ${calculationQueueSummary.scheduledTransactionCalculationIds}.`);
						let scheduledTransactionCalculationIds = calculationQueueSummary.scheduledTransactionCalculationIds.split(",");
						// Perform queued scheduled transaction calculations
						return this.scheduledTransactionCalculations.performCalculations(budgetId, budgetKnowledge, DateWithoutTime.createForToday(), scheduledTransactionCalculationIds);
					}
					else {
						Logger.info("CalculationsManager::performScheduledTransactionsCalculations::No queued scheduled transaction calculations were found.");
						// There are no queued scheduled transactions
						return Promise.resolve(null);
					}
				});
		}
	}

	protected performCalculations(budgetId:string, budgetKnowledge:BudgetKnowledge, forceFullCalcs:boolean=false):Promise<boolean> {

		var referenceData:IReferenceDataForCalculations;
			
		return this.performScheduledTransactionCalculations(budgetId, budgetKnowledge, forceFullCalcs)
			.then((result:IScheduledTransactionCalculationsResult)=>{

				Logger.info("CalculationsManager::performCalculations::Checking if there are any queued calculations.");
				// Get the calculation queue summary
				return this.getCalculationQueueSummary(budgetId, forceFullCalcs);
			})
			.then((calculationQueueSummary:ICalculationQueueSummary)=>{
				
				var hasPendingCalculations = (calculationQueueSummary.queueCount > 0);
				if (!hasPendingCalculations) {
					Logger.info("CalculationsManager::performCalculations::No queued calculations were found.");
					// There are no pending calculations to run. We can return immediately.
					return Promise.resolve(true);
				}
				else {
					Logger.info("CalculationsManager::performCalculations::Loading reference data required to perform calculations.");
					return this.getReferenceDataForCalculations(budgetId, calculationQueueSummary)
						.then((data:IReferenceDataForCalculations)=>{

							referenceData = data;
							
							// Transaction Calculations
							var cacheStartMonth = DateWithoutTime.earliest(referenceData.queuedAccountCalculationsStartMonth, referenceData.queuedSubCategoryCalculationsStartMonth, referenceData.queuedTransactionCalculationsStartMonth);
							if (cacheStartMonth == null) {
								cacheStartMonth = referenceData.firstMonth;   
							}
							
							Logger.info("CalculationsManager::performCalculations::Performing transactions calculations.");
							return this.transactionCalculations.performCalculations(budgetId, budgetKnowledge, referenceData, referenceData.queuedTransactionCalculationsStartMonth, cacheStartMonth, referenceData.runCalcsThroughMonth);
						})
						.then((retVal:any)=>{

							// Account Calculations
							if (referenceData.queuedAccountCalculationsStartMonth || referenceData.queuedAccountCalculationAccountIds) {
								Logger.info("CalculationsManager::performCalculations::Performing account calculations.");
								var startMonth:DateWithoutTime = (referenceData.queuedAccountCalculationsStartMonth || referenceData.firstMonth);
								return this.accountCalculations.performCalculations(budgetId, budgetKnowledge, referenceData, referenceData.queuedAccountCalculationAccountIds, startMonth, referenceData.runCalcsThroughMonth);
							} 
							else {
								Logger.info("CalculationsManager::performCalculations::Skipping account calculations.");
								return Promise.resolve(true);
							}
						})
						.then((retVal:boolean)=>{
							
							// SubCategory Calculations
							if (referenceData.queuedSubCategoryCalculationsStartMonth || referenceData.queuedSubCategoryCalculationIds) {
								Logger.info("CalculationsManager::performCalculations::Performing subcategory calculations.");
								var startMonth:DateWithoutTime = (referenceData.queuedSubCategoryCalculationsStartMonth || referenceData.firstMonth);
								return this.subCategoryCalculations.performCalculations(budgetId, budgetKnowledge, referenceData, referenceData.queuedSubCategoryCalculationIds, startMonth, referenceData.runCalcsThroughMonth);
							} 
							else {
								Logger.info("CalculationsManager::performCalculations::Skipping subcategory calculations.");
								return Promise.resolve(true);
							}
						})
						.then((retVal:boolean)=>{
							
							// Monthly Calculations
							if (referenceData.queuedSubCategoryCalculationsStartMonth || referenceData.queuedSubCategoryCalculationIds) {
								Logger.info("CalculationsManager::performCalculations::Performing monthly calculations.");
								var startMonth:DateWithoutTime = (referenceData.queuedSubCategoryCalculationsStartMonth || referenceData.firstMonth);
								return this.monthlyCalculations.performCalculations(budgetId, budgetKnowledge, referenceData, startMonth, referenceData.runCalcsThroughMonth);
							} 
							else {
								Logger.info("CalculationsManager::performCalculations::Skipping monthly calculations.");
								return Promise.resolve(true);
							}
						})
						.then((retVal:boolean)=>{
							
							Logger.info("CalculationsManager::performCalculations::Calculations completed. Clearing calculation queue.");
							return executeSqlQueriesAndSaveKnowledge([
								// Get the query for clearing the calculation queue
								CalculationQueries.getClearCalculationQueueQuery(budgetId)
							], budgetId, budgetKnowledge);
						});
				}
			});
	}
	
	public getCalculationQueueSummary(budgetId:string, forceFullCalcs:boolean=false):Promise<ICalculationQueueSummary> {

		var calculationQueueSummary:ICalculationQueueSummary = null;
		if (forceFullCalcs) {
			calculationQueueSummary = {
				queueCount: 1,
				runFullCalculations: true,
			};
			
			return Promise.resolve(calculationQueueSummary);
		} else {
			return executeSqlQueries([
				CalculationQueries.getQueuedCalculationSummaryQuery(budgetId)
			]).then((result:any)=>{
				if(result.calculationQueueSummary && result.calculationQueueSummary.length > 0) {
					calculationQueueSummary = (<any>result).calculationQueueSummary[0];
					return calculationQueueSummary;
				} else {
					calculationQueueSummary = {
						queueCount: 0
					};
				}
				
				return calculationQueueSummary;
			});
		}
	}

	public getReferenceDataForCalculations(budgetId:string, calculationQueueSummary:ICalculationQueueSummary):Promise<IReferenceDataForCalculations> {

		var queriesList:Array<IDatabaseQuery> = [
			BudgetDateQueries.getFirstAndLastBudgetMonthQuery(budgetId),
			AccountQueries.getAllAccounts(budgetId),
			MasterCategoryQueries.getAllMasterCategories(budgetId),
			SubCategoryQueries.getAllSubCategories(budgetId),
			CommonQueries.fetchReferenceIdsForCalculations(budgetId)
		];
		
		return executeSqlQueries(queriesList)
			.then((result:IReferenceDataForCalculations)=>{

				// Get the min/max dates, convert them to DateWithoutTime, and store back in the result object
				var firstLastBudgetMonth = (<any>result).firstLastBudgetMonth[0];
				result.firstMonth = DateWithoutTime.createFromISOString(firstLastBudgetMonth.firstMonth);
				result.lastMonth = DateWithoutTime.createFromISOString(firstLastBudgetMonth.lastMonth);
				
				result.accountsMap = _.keyBy<budgetEntities.IAccount>(result.accounts, 'entityId');
				result.subCategoriesMap = _.keyBy<budgetEntities.ISubCategory>(result.subCategories, 'entityId');
				result.masterCategoriesMap = _.keyBy<budgetEntities.IMasterCategory>(result.masterCategories, 'entityId');
				
				// account balances by accountId
				result.accountBalanacesByAccountId = {};
				_.forEach(result.accounts, (account:budgetEntities.IAccount) => {
					result.accountBalanacesByAccountId[account.entityId] = (account.unclearedBalance + account.clearedBalance);
				});
				
				result.paymentCategories = _.filter(result.subCategories, function(s) { return s.accountId != null && result.accountsMap[s.accountId] && result.accountsMap[s.accountId].onBudget == 1 && result.accountsMap[s.accountId].isTombstone == 0 });
				result.paymentCategoriesMap = _.keyBy<budgetEntities.ISubCategory>(result.paymentCategories, 'accountId');
				
				var referenceIdsForCalculations = (<any>result).referenceIds[0];
				result.splitSubCategoryId = referenceIdsForCalculations.splitSubCategoryId;
				result.uncategorizedSubCategoryId = referenceIdsForCalculations.uncategorizedSubCategoryId;
				result.immediateIncomeSubCategoryId = referenceIdsForCalculations.immediateIncomeSubCategoryId;;
				result.startingBalancePayeeId = referenceIdsForCalculations.startingBalancePayeeId;
				
				if (calculationQueueSummary) {
					result.runFullCalculations = calculationQueueSummary.runFullCalculations;
					
					if (!result.runFullCalculations){
						if (calculationQueueSummary.transactionCalculationsMinMonth){
							result.queuedTransactionCalculationsStartMonth = DateWithoutTime.createFromISOString(calculationQueueSummary.transactionCalculationsMinMonth).startOfMonth();
						}
						
						if (calculationQueueSummary.transactionCalculationAccountIds){
							result.queuedTransactionCalculationAccountIds = _.uniq(calculationQueueSummary.transactionCalculationAccountIds.split(",")); 
						}
						
						if (calculationQueueSummary.accountCalculationsMinMonth){
							result.queuedAccountCalculationsStartMonth = DateWithoutTime.createFromISOString(calculationQueueSummary.accountCalculationsMinMonth).startOfMonth();
						}
						
						if (calculationQueueSummary.accountCalculationIds){
							result.queuedAccountCalculationAccountIds = _.uniq(calculationQueueSummary.accountCalculationIds.split(",")); 
						}
						
						if (calculationQueueSummary.subCategoryCalculationsMinMonth){
							result.queuedSubCategoryCalculationsStartMonth = DateWithoutTime.createFromISOString(calculationQueueSummary.subCategoryCalculationsMinMonth).startOfMonth();
						}
						
						if (calculationQueueSummary.subCategoryCalculationIds){
							result.queuedSubCategoryCalculationIds = _.uniq(calculationQueueSummary.subCategoryCalculationIds.split(",")); 
						}
						
						if (calculationQueueSummary.unCategoriedSubCategoryQueued){
							if (result.queuedSubCategoryCalculationIds == null) {
								result.queuedSubCategoryCalculationIds = [];
							}
							result.queuedSubCategoryCalculationIds.push(result.uncategorizedSubCategoryId);
						}
						
						if (calculationQueueSummary.scheduledTransactionCalculationIds){
							result.queuedScheduledTransactionCalculationIds = _.uniq(calculationQueueSummary.scheduledTransactionCalculationIds.split(",")); 
						}
					}
				}
				
				if (result.runFullCalculations){
					result.queuedTransactionCalculationsStartMonth = result.firstMonth;
					result.queuedTransactionCalculationAccountIds = _.map(result.accounts, 'entityId') as Array<string>;
					result.queuedAccountCalculationsStartMonth = result.firstMonth;
					result.queuedAccountCalculationAccountIds = _.map(result.accounts, 'entityId') as Array<string>;
					result.queuedSubCategoryCalculationsStartMonth = result.firstMonth;
					result.queuedSubCategoryCalculationIds = _.map(result.subCategories, 'entityId') as Array<string>;
					result.queuedScheduledTransactionCalculationIds = null;
				}
				
				// We will run calculations through the last budget month
				result.runCalcsThroughMonth = result.lastMonth;
				
				return result;
			});
	}
}