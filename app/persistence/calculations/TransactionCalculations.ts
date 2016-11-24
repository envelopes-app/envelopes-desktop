/// <reference path='../../_includes.ts' />

import * as _ from 'lodash';

import { AccountTypes, ClearedFlag } from '../../constants';
import { BudgetKnowledge } from '../KnowledgeObjects'; 
import * as budgetEntities from '../../interfaces/budgetEntities';
import { IDatabaseQuery } from '../../interfaces/persistence';
import { DateWithoutTime, Logger } from '../../utilities';
import { ISimpleEntitiesCollection } from '../../interfaces/state';
import { TransactionQueries } from '../queries/budgetQueries';
import { executeSqlQueries, executeSqlQueriesAndSaveKnowledge } from '../QueryExecutionUtility';
import { IReferenceDataForCalculations, ICalculationTransactionAmount, ITransactionCalculationsData, IAccountMonthlyBalance } from '../../interfaces/calculations';

export class TransactionCalculations {

	// *************************************************************************************************************
	// Methods for loading and saving the data
	// *************************************************************************************************************
	protected loadData(budgetId:string,
		referenceData:IReferenceDataForCalculations,
		startMonth:DateWithoutTime):Promise<ITransactionCalculationsData> {

            var queryList:Array<IDatabaseQuery> = [
                this.getAccountBalancesAtStartOfMonth(budgetId, startMonth),
                this.fetchTransactionAmountsForCalculations(budgetId, startMonth, referenceData.uncategorizedSubCategoryId, referenceData.splitSubCategoryId),
            ];
            
            // These are data read queries. No need to persist the budget knowledge values.
            return executeSqlQueries(queryList);
	}

	protected saveData(budgetId:string,
		transactions:Array<ICalculationTransactionAmount>,
		budgetKnowledge:BudgetKnowledge):Promise<boolean> {

		var queryList:Array<IDatabaseQuery> = [];
		// Iterate through all the passed data and generate queries for persisting them
		_.forEach(transactions, (transaction:ICalculationTransactionAmount)=>{
			queryList.push(this.updateTransactionAmounts(budgetId, transaction, budgetKnowledge.getNextValueForCalculations()));
		});

		return executeSqlQueriesAndSaveKnowledge(queryList, budgetId, budgetKnowledge);
	}
	
	protected generateTransactionCache(budgetId:string,
		budgetKnowledge:BudgetKnowledge,
		referenceData:IReferenceDataForCalculations,
		startMonth:DateWithoutTime, endMonth:DateWithoutTime):Promise<boolean> {

		return executeSqlQueries([
			this.clearTransactionCalculationsTable(budgetId),
			this.populateTransactionCalculationsTable(budgetId, startMonth, referenceData.splitSubCategoryId, referenceData.uncategorizedSubCategoryId, referenceData.startingBalancePayeeId, referenceData.immediateIncomeSubCategoryId)
		]);
	}
	        
	private getAccountBalancesAtStartOfMonth(budgetId:string, asOfMonth:DateWithoutTime):IDatabaseQuery {

		// To get the account balance "at start of month", we will sum balances of AccountMonthlyCalculations 
		// up to (but not including) the asOfMonth.
		var upToMonth = asOfMonth.clone().addMonths(-1).startOfMonth();

		return {
			name: "accountBalancesAtStartOfMonth",
			query: `SELECT accountId, ?2 as asOfMonth,
						COALESCE(SUM(clearedBalance + unclearedBalance),0) AS balance 
					FROM AccountMonthlyCalculations
					WHERE budgetId = ?1 AND month <= ?3
					GROUP BY accountId`,
			arguments: [budgetId, asOfMonth.toISOString(), upToMonth.toISOString()]
		};
	}
        
	private fetchTransactionAmountsForCalculations(budgetId:string, 
			startMonth:DateWithoutTime, uncategorizedSubCategoryId:string, splitSubCategoryId:string):IDatabaseQuery {
		
		return {
			name: "transactions",
			query: `WITH e_transactions AS (
						SELECT t.accountId, t.entityId as transactionId, NULL as subTransactionId, 1 as isTransaction, 0 as isSubTransaction, COALESCE(t.subcategoryId, '${uncategorizedSubCategoryId}') as subCategoryId,
							t.date, t.amount, t.cashAmount, t.creditAmount, t.subCategoryCreditAmountPreceding, NULL sortableIndex
						FROM Transactions t
						WHERE t.budgetId = ?1
						AND t.isTombstone = 0
						AND t.accountId IN (SELECT entityId FROM Accounts WHERE budgetId = ?1 AND onBudget = 1)
						AND t.date >= ?2
						AND COALESCE(T.source,'') IN (${TransactionQueries.TransactionSourcesINClause})
					)
					SELECT *, CASE WHEN ts.subcategoryId = '${splitSubCategoryId}' THEN 1 ELSE 0 END as isSplit
					FROM (
						SELECT * FROM e_transactions
					) ts
					ORDER BY ts.accountId, ts.date, ts.amount, ts.transactionId, ts.isSubTransaction, ts.sortableIndex`,
			arguments: [budgetId, startMonth.getUTCTime()]
		};
	}

	private updateTransactionAmounts(budgetId:string, transaction:ICalculationTransactionAmount, deviceKnowledge:number):IDatabaseQuery {
			
		return {
			query: `UPDATE Transactions
						SET cashAmount = ?,
						creditAmount = ?,
						subCategoryCreditAmountPreceding = ?,
						deviceKnowledgeForCalculatedFields = ? 
					WHERE budgetId = ? AND entityId = ?`,
			arguments: [
				transaction.cashAmount,
				transaction.creditAmount,
				transaction.subCategoryCreditAmountPreceding,
				deviceKnowledge,
				budgetId,
				transaction.transactionId
			]
		};
	}
        
	private clearTransactionCalculationsTable(budgetId:string):IDatabaseQuery {
		return {
			name: "DeleteFromTransactionCalculations",
			query: "DELETE FROM TransactionCalculations WHERE budgetId = ?1",
			arguments: [budgetId]
		};
	}
	
	private populateTransactionCalculationsTable(budgetId:string, startMonth:DateWithoutTime,
		splitSubCategoryId:string, uncategorizedSubCategoryId:string, startingBalancePayeeId:string, immediateIncomeSubCategoryId:string):IDatabaseQuery {

		return {
			name: "TransactionCalculations",
			query: `
WITH e_transactions AS (
 SELECT t.entityId as transactionId, NULL as subTransactionId, 1 as isTransaction, 0 as isSubTransaction,
	NULL as parentTransactionId, t.transferAccountId, t.date, t.amount, t.cashAmount, t.creditAmount, t.subCategoryCreditAmountPreceding, t.accountId, COALESCE(t.subCategoryId, '${uncategorizedSubCategoryId}') as subCategoryId, t.payeeId,
	CASE WHEN t.cleared = '${ClearedFlag.Cleared}' THEN 1 ELSE 0 END as isCleared,
    CASE WHEN t.cleared = '${ClearedFlag.Reconciled}' THEN 1 ELSE 0 END as isReconciled, 
    t.accepted as isAccepted,
	NULL as sortableIndex, transferTransactionId
 FROM Transactions t
 WHERE t.budgetId = ?1
    AND t.date >= ?2
	AND t.isTombstone = 0
    AND COALESCE(T.source,'') IN (${TransactionQueries.TransactionSourcesINClause})
)
INSERT INTO TransactionCalculations
SELECT ?1 as budgetId, ts.transactionId, ts.subTransactionId, ts.isTransaction, ts.isSubTransaction, 
    ts.date, CAST(strftime('%s', date(datetime(ts.date * 0.001, 'unixepoch'),'start of month')) as NUMERIC) as month_epoch,
    ts.amount, ts.cashAmount, ts.creditAmount, ts.subCategoryCreditAmountPreceding, ts.accountId, ts.subCategoryId, ts.payeeId, 
    ts.isCleared, ts.isAccepted,
	CASE WHEN ts.subCategoryId = '${splitSubCategoryId}' THEN 1 ELSE 0 END as isSplit,
    CASE WHEN ts.subCategoryId = '${uncategorizedSubCategoryId}' THEN 1 ELSE 0 END as isUncategorized,
    CASE WHEN ts.payeeId = '${startingBalancePayeeId}' THEN 1 ELSE 0 END as isPayeeStartingBalance,
    CASE WHEN ts.subCategoryId = '${immediateIncomeSubCategoryId}' THEN 1 ELSE 0 END as isImmediateIncomeSubCategory,
    CASE WHEN (a.onBudget = 1) THEN 1 ELSE 0 END AS onBudget, ts.transferAccountId,
	CASE WHEN (a.onBudget = 1 AND (ts.transferAccountId IS NULL OR ta.onBudget = 0)) THEN 1 ELSE 0 END as affectsBudget,
	ta.onBudget as isTransferAccountOnBudget,
    CASE WHEN ta.entityId IS NULL THEN NULL WHEN ta.accountType NOT IN (${TransactionQueries.TransactionLiabilityAccountTypesINClause}) THEN 1 ELSE 0 END as isTransferAccountAsset,
	CASE WHEN a.accountType IN (${TransactionQueries.TransactionLiabilityAccountTypesINClause}) THEN 1 ELSE 0 END as isLiabilityAccount, 
    transferTransactionId, ts.isReconciled
FROM (
	SELECT * FROM e_transactions
) ts
INNER JOIN Accounts a ON a.entityId = ts.accountId
LEFT JOIN Accounts ta ON ta.entityId = ts.transferAccountId
ORDER BY ts.date, ts.amount, ts.transactionId, ts.isSubTransaction, ts.sortableIndex
                `,
                arguments: [budgetId, startMonth.getUTCTime()]
            };
        } 

	// *************************************************************************************************************
	// Main Calculation Performing Method
	// *************************************************************************************************************
	public performCalculations(budgetId:string,
		budgetKnowledge:BudgetKnowledge,
		referenceData:IReferenceDataForCalculations,
		amountsStartMonth:DateWithoutTime, cacheStartMonth:DateWithoutTime, endMonth:DateWithoutTime):Promise<boolean> {

		var queueSubCategoryIds:{ [subCategoryId: string] : boolean } = {};
		var updatedTransactions:Array<ICalculationTransactionAmount> = [];

		// Load the data required for performing the calculations
		var promise:Promise<boolean>;
		if (amountsStartMonth) {
			Logger.info(`TransactionCalculations::Performing calculations (startMonth: ${amountsStartMonth})`);
		
			promise = this.loadData(budgetId, referenceData, amountsStartMonth)
			.then((data:ITransactionCalculationsData)=>{
				
				var accountBalancesAtStartOfMonthIndexByAccountId:_.Dictionary<IAccountMonthlyBalance> = _.keyBy<IAccountMonthlyBalance>(data.accountBalancesAtStartOfMonth, 'accountId');
				
				var rollingSubcategoryCreditOutflows:{ [monthSubcategory: string] :number } = {};
				var transactionsByAccountId:_.Dictionary<ICalculationTransactionAmount[]> = _.groupBy(data.transactions, 'accountId');
				
				_.forEach(_.keys(transactionsByAccountId), (accountId)=>{
					var account = referenceData.accountsMap[accountId];
					// Get the balance for this account at the start of the "start month"
					var accountBalanceAtStartOfMonth:number = 0;
					if (accountBalancesAtStartOfMonthIndexByAccountId[accountId]) {
						accountBalanceAtStartOfMonth = accountBalancesAtStartOfMonthIndexByAccountId[accountId].balance;    
					}

					this.performCalculationsForAccount(budgetId, referenceData, account, accountBalanceAtStartOfMonth, transactionsByAccountId[accountId], rollingSubcategoryCreditOutflows, updatedTransactions, referenceData.queuedSubCategoryCalculationsStartMonth, queueSubCategoryIds);    
				});
				
				var queueSubCategoryIdArray:string[] = _.keys(queueSubCategoryIds);
				if (queueSubCategoryIdArray.length > 0) {
					// additional subCategoryIds need to have calcs run on them
					referenceData.queuedSubCategoryCalculationIds = queueSubCategoryIdArray.concat(referenceData.queuedSubCategoryCalculationIds);
				}
				
				Logger.info(`TransactionCalculations::Saving updated Transaction entities (count: ${updatedTransactions.length})`);
				
				// Save all the updated entities
				return this.saveData(budgetId, updatedTransactions, budgetKnowledge);
			});
		}
		else {
			promise = Promise.resolve(true);
		}
		
		return promise.then((retVal:boolean) => {
			Logger.info(`TransactionCalculations::Generating transaction cache (startMonth: ${cacheStartMonth.toISOString()})`);
			
			return this.generateTransactionCache(budgetId, budgetKnowledge, referenceData, cacheStartMonth, endMonth);
		});
		
	}
	
	public performCalculationsForAccount(budgetId:string,
		referenceData:IReferenceDataForCalculations,
		account:budgetEntities.IAccount,
		accountBalanceAtStartOfMonth:number,
		accountTransactions:Array<ICalculationTransactionAmount>, 
		rollingSubcategoryCreditOutflows:{ [monthSubcategory: string] :number },
		updatedTransactions:Array<ICalculationTransactionAmount>,
		queueSubCategoryMonth:DateWithoutTime,
		queueSubCategoryIds:{ [subCategoryId: string] : boolean }){
		
		var rollingAccountBalance:number = accountBalanceAtStartOfMonth;
		var accountBalanceBeforeSplitParents:{ [transactionId: string] :number } = {};
		
		// Iterate through all the transactions, and update their cash and credit amounts
			
		// NOTE: The following code ASSUMES data.transactions are ordered by: 
		//    (date, amount, transactionId, isSubTransaction, sortableIndex)
				
		_.forEach(accountTransactions, (transaction:ICalculationTransactionAmount)=>{

				var month = DateWithoutTime.createFromUTCTime(transaction.date).startOfMonth();
				
				var calculatedCashAmount:number = 0;
				var calculatedCreditAmount:number = 0;
				
				// calculatedSubcategoryCreditPrecedingAmount: The total credit outflows preceeding a transaction in a given budget month.  This
				//    is used during during payment category calculations (see: SubCategoryCalculations::fetchMonthlyPaymentCategoriesForCalculations)
				//    to determine [un]BudgetedCreditOutflows for a particular subcategory.
				var calculatedSubcategoryCreditPrecedingAmount:number = 0;
				
				var currentAccountBalance:number = null;
				currentAccountBalance = rollingAccountBalance;
				
				var isLiabilityAccount:boolean = !AccountTypes.isAssetAccount(account.accountType);
				if(isLiabilityAccount) {                        
					if (currentAccountBalance >= 0) {
						calculatedCreditAmount = Math.min(currentAccountBalance + transaction.amount, 0);
						calculatedCashAmount = (transaction.amount - calculatedCreditAmount);
					}
					else {
						calculatedCashAmount = Math.max(currentAccountBalance + transaction.amount,0);
						calculatedCreditAmount = (transaction.amount - calculatedCashAmount);
					}
					
					if (transaction.subCategoryId) {
						var monthSubCategory:string = `${month.toISOString()}_${transaction.subCategoryId}`;
						calculatedSubcategoryCreditPrecedingAmount = (rollingSubcategoryCreditOutflows[monthSubCategory] || 0);
					}
				}
				else {
					// not a liability account so everything is cash
					calculatedCashAmount = transaction.amount;
					calculatedCreditAmount = 0;
				}
				
				// Increment the rollingAccountBalance by the amount of the transaction
				rollingAccountBalance = (currentAccountBalance + transaction.amount);
				
				if (transaction.subCategoryId) {
					// Increment the rollingSubcategoryCreditOutflows by the amount of the transaction
					var monthSubCategory:string = `${month.toISOString()}_${transaction.subCategoryId}`;
					rollingSubcategoryCreditOutflows[monthSubCategory] = (calculatedSubcategoryCreditPrecedingAmount + calculatedCreditAmount); 
				}
				
				/* If the cash/credit distribution for this transaction just changed (because of another transaction change) 
					we need to run calculations for the transaction subcategory.
				*/
				if (transaction.cashAmount != calculatedCashAmount 
					|| transaction.creditAmount != calculatedCreditAmount
					|| transaction.subCategoryCreditAmountPreceding != calculatedSubcategoryCreditPrecedingAmount) {
					
					queueSubCategoryIds[transaction.subCategoryId] = true;
					
					if (!queueSubCategoryMonth || month.isBefore(queueSubCategoryMonth)) {
						queueSubCategoryMonth = month;
					}
					
					// Add this transaction to the list of transactions that need to be updated
					transaction.cashAmount = calculatedCashAmount;
					transaction.creditAmount = calculatedCreditAmount;
					transaction.subCategoryCreditAmountPreceding = calculatedSubcategoryCreditPrecedingAmount;
					
					updatedTransactions.push(transaction);
				}
			});
		
		//update reference data accountBalanacesByAccountId so we have the latest for other calcs 
		referenceData.accountBalanacesByAccountId[account.entityId] = rollingAccountBalance;
	}
}