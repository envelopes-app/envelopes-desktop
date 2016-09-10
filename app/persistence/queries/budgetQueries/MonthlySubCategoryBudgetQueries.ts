/// <reference path='../../../_includes.ts' />

import { DateWithoutTime, KeyGenerator } from '../../../utilities';
import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export class MonthlySubCategoryBudgetQueries {

	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:budgetEntities.IMonthlySubCategoryBudget):IDatabaseQuery {

		var month:string;
		if(!dbObject.month)
			month = KeyGenerator.extractMonthFromMonthlySubCategoryBudgetIdentity(dbObject.entityId).toISOString();
		else
			month = dbObject.month;

		var query:IDatabaseQuery = {
			query: `REPLACE INTO MonthlySubCategoryBudgets
				(
					budgetId,
					entityId,
					isTombstone,
					monthlyBudgetId,
					subCategoryId,
					budgeted,
					note,
					month,
					cashOutflows,
					positiveCashOutflows,
					creditOutflows,
					balance,
					budgetedCashOutflows,
					budgetedCreditOutflows,
					unBudgetedCashOutflows,
					unBudgetedCreditOutflows,
					budgetedPreviousMonth,
					spentPreviousMonth,
					paymentPreviousMonth,
					balancePreviousMonth,
					budgetedAverage,
					spentAverage,
					paymentAverage,
					budgetedSpending,
					allSpending,
					allSpendingSinceLastPayment,
					additionalToBeBudgeted,
					upcomingTransactions,
					upcomingTransactionsCount,
					goalTarget,
					goalOverallFunded,
					goalUnderFunded,
					goalOverallLeft,
					goalExpectedCompletion,
					deviceKnowledge,
					deviceKnowledgeForCalculatedFields
				) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
			arguments: [
				dbObject.budgetId,
				dbObject.entityId,
				dbObject.isTombstone,
				dbObject.monthlyBudgetId,
				dbObject.subCategoryId,
				dbObject.budgeted,
				dbObject.note ? dbObject.note : null,
				month,
				dbObject.cashOutflows,
				dbObject.positiveCashOutflows,
				dbObject.creditOutflows,
				dbObject.balance,
				dbObject.budgetedCashOutflows ? dbObject.budgetedCashOutflows : null,
				dbObject.budgetedCreditOutflows ? dbObject.budgetedCreditOutflows : null,
				dbObject.unBudgetedCashOutflows ? dbObject.unBudgetedCashOutflows : null,
				dbObject.unBudgetedCreditOutflows ? dbObject.unBudgetedCreditOutflows : null,
				dbObject.budgetedPreviousMonth ? dbObject.budgetedPreviousMonth : null,
				dbObject.spentPreviousMonth ? dbObject.spentPreviousMonth : null,
				dbObject.paymentPreviousMonth ? dbObject.paymentPreviousMonth : null,
				dbObject.balancePreviousMonth ? dbObject.balancePreviousMonth : null,
				dbObject.budgetedAverage ? dbObject.budgetedAverage : null,
				dbObject.spentAverage ? dbObject.spentAverage : null,
				dbObject.paymentAverage ? dbObject.paymentAverage : null,
				dbObject.budgetedSpending ? dbObject.budgetedSpending : null,
				dbObject.allSpending ? dbObject.allSpending : null,
				dbObject.allSpendingSinceLastPayment,
				dbObject.additionalToBeBudgeted ? dbObject.additionalToBeBudgeted : null,
				dbObject.upcomingTransactions ? dbObject.upcomingTransactions : null,
				dbObject.upcomingTransactionsCount ? dbObject.upcomingTransactionsCount : 0,
				dbObject.goalTarget ? dbObject.goalTarget : null,
				dbObject.goalOverallFunded ? dbObject.goalOverallFunded : null,
				dbObject.goalUnderFunded ? dbObject.goalUnderFunded : null,
				dbObject.goalOverallLeft ? dbObject.goalOverallLeft : null,
				dbObject.goalExpectedCompletion ? dbObject.goalExpectedCompletion : null,
				dbObject.deviceKnowledge,
				dbObject.deviceKnowledgeForCalculatedFields
			]
		};

		return query;
	}

	// *********************************************************************************************************
	// Queries for reading data from the database
	// *********************************************************************************************************
	public static loadDatabaseObject(budgetId:string, deviceKnowledge:number, deviceKnowledgeForCalculations:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "monthlySubCategoryBudgets",
			query: `SELECT * FROM MonthlySubCategoryBudgets WHERE budgetId = ?1 AND 
						(deviceKnowledge = 0 OR deviceKnowledge > ?2 OR deviceKnowledgeForCalculatedFields = 0 OR
						deviceKnowledgeForCalculatedFields > ?3) AND isTombstone = 0`,
			arguments: [
				budgetId,
				deviceKnowledge,
				deviceKnowledgeForCalculations
			]
		};

		return query;
	}

	public static getAllMonthlySubCategoryBudgets(budgetId:string, includeTombstonedEntities:boolean = false):IDatabaseQuery {

		if(includeTombstonedEntities) {
			return {
				name: "monthlySubCategoryBudgets",
				query: "Select * FROM MonthlySubCategoryBudgets WHERE budgetId = ?",
				arguments: [budgetId]
			};
		}
		else {
			return {
				name: "monthlySubCategoryBudgets",
				query: "Select * FROM MonthlySubCategoryBudgets WHERE budgetId = ? AND isTombstone = 0",
				arguments: [budgetId]
			};
		}
	}

	public static getMonthlySubCategoryBudgetsForScheduledCalculations(budgetId:string):IDatabaseQuery {

		return {
			name: "monthlySubCategoryBudgets",
			query: "Select entityId, month, upcomingTransactions, upcomingTransactionsCount FROM MonthlySubCategoryBudgets WHERE budgetId = ?",
			arguments: [budgetId]
		};
	}

	public static findMonthlySubCategoryBudgetByMonth(budgetId:string, month:DateWithoutTime):IDatabaseQuery {

		var monthString = month.toISOString();
		return {
			name: "monthlySubCategoryBudgets",
			query: "Select * FROM MonthlySubCategoryBudgets WHERE budgetId = ? AND month = ?",
			arguments: [budgetId, monthString]
		};
	}

	public static findMonthlySubCategoryBudgetByMonthAndSubCategoryId(budgetId:string, month:DateWithoutTime, subCategoryId:string):IDatabaseQuery {

		var entityId = KeyGenerator.getMonthlySubCategoryBudgetIdentity(subCategoryId, month);
		return {
			name: "monthlySubCategoryBudgets",
			query: "Select * FROM MonthlySubCategoryBudgets WHERE budgetId = ? AND entityId = ?",
			arguments: [budgetId, entityId]
		};
	}

	public static findMonthlySubCategoryBudgetDbtExtended(budgetId:string, subCategoryId:string, month:DateWithoutTime):IDatabaseQuery {

		var monthString = month ? month.toISOString() : null;
		return {
			name: "monthlySubCategoryBudgets",
			query: `
-- ?1 is the budget id
-- ?2 is the subCategoryId
-- ?3 is the month in the form of 2016-01-01

SELECT 
MSCB.*,
ACC.clearedBalance + ACC.unclearedBalance as dbt_accountBalance,
SQ.lastPaymentDate as dbt_lastPaymentDate,
SQ.lastPaymentAmount as dbt_lastPaymentAmount,
SC.accountId as dbt_accountId
FROM SubCategories SC 
LEFT JOIN MonthlySubCategoryBudgets MSCB
ON MSCB.subCategoryId = SC.entityId
LEFT JOIN Accounts ACC
ON ACC.entityId = SC.accountId
LEFT JOIN
(
SELECT
MAX(date) as lastPaymentDate,
amount as lastPaymentAmount,
accountId
FROM
Transactions TR 
WHERE 
budgetId = ?1 AND isTombstone = 0 AND amount > 0 AND (transferTransactionId IS NOT NULL OR transferSubTransactionId IS NOT NULL) 
GROUP BY
accountId
) AS SQ
ON SQ.accountId = SC.accountId

WHERE MSCB.budgetId = ?1
AND MSCB.subCategoryId = ?2
AND MSCB.month = ?3
			`,              
			arguments: [budgetId, subCategoryId, monthString]
		};
	}
}