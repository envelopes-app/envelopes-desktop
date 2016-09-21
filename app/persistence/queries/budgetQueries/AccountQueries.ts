/// <reference path='../../../_includes.ts' />

import { DateWithoutTime } from '../../../utilities';
import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { SubCategoryType } from '../../../constants';

export class AccountQueries {

	public static insertDatabaseObject(dbObject:budgetEntities.IAccount):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "accounts",
			query: `REPLACE INTO Accounts (
						budgetId, 
						entityId, 
						isTombstone, 
						accountType, 
						accountName, 
						note, 
						lastEnteredCheckNumber, 
						lastReconciledDate, 
						lastReconciledBalance, 
						closed, 
						sortableIndex, 
						onBudget, 
						clearedBalance, 
						unclearedBalance, 
						infoCount, 
						warningCount, 
						errorCount, 
						deviceKnowledge,
						deviceKnowledgeForCalculatedFields
					) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
			arguments: [
				dbObject.budgetId,
				dbObject.entityId,
				dbObject.isTombstone,
				dbObject.accountType,
				dbObject.accountName,
				dbObject.note ? dbObject.note : null,
				dbObject.lastEnteredCheckNumber,
				dbObject.lastReconciledDate,
				dbObject.lastReconciledBalance,
				dbObject.closed,
				dbObject.sortableIndex,
				dbObject.onBudget,
				dbObject.clearedBalance,
				dbObject.unclearedBalance,
				dbObject.infoCount,
				dbObject.warningCount,
				dbObject.errorCount,
				dbObject.deviceKnowledge,
				dbObject.deviceKnowledgeForCalculatedFields
			]
		};

		return query;
	}

	public static insertMonthlyCalculationDatabaseObject(dbObject:budgetEntities.IAccountMonthlyCalculation):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "accountMonthlyCalculations",
			query: `REPLACE INTO AccountMonthlyCalculations (
				budgetId, 
				entityId, 
				isTombstone, 
				month, 
				accountId, 
				clearedBalance, 
				unclearedBalance, 
				infoCount, 
				warningCount, 
				errorCount, 
				deviceKnowledge
			) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
			arguments: [
				dbObject.budgetId,
				dbObject.entityId,
				dbObject.isTombstone,
				dbObject.month,
				dbObject.accountId,
				dbObject.clearedBalance,
				dbObject.unclearedBalance,
				dbObject.infoCount,
				dbObject.warningCount,
				dbObject.errorCount,
				dbObject.deviceKnowledge
			]
		};

		return query;
	}

	public static loadDatabaseObject(budgetId:string, deviceKnowledge:number, deviceKnowledgeForCalculations:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "accounts",
			query: `SELECT * FROM Accounts WHERE budgetId = ?1 AND (
						deviceKnowledge = 0 OR deviceKnowledge > ?2 OR deviceKnowledgeForCalculatedFields = 0 OR 
						deviceKnowledgeForCalculatedFields > ?3)`,
			arguments: [
				budgetId,
				deviceKnowledge,
				deviceKnowledgeForCalculations
			]
		};

		return query;
	}

	public static loadDatabaseCalculationObject(budgetId:string, deviceKnowledge:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "accountMonthlyCalculations",
			query: "SELECT * FROM AccountMonthlyCalculations WHERE budgetId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?) AND isTombstone = 0",
			arguments: [
				budgetId,
				deviceKnowledge
			]
		};

		return query;
	}

	// *********************************************************************************************************
	// Queries for reading data from the database
	// *********************************************************************************************************
	public static getAllAccounts(budgetId:string, includeTombstonedEntities:boolean = false):IDatabaseQuery {

		if(includeTombstonedEntities) {
			return {
				name: "accounts",
				query: "Select * FROM Accounts WHERE budgetId = ?",
				arguments: [budgetId]
			};
		}
		else {
			return {
				name: "accounts",
				query: "Select * FROM Accounts WHERE budgetId = ? AND isTombstone = 0",
				arguments: [budgetId]
			};
		}
	}

	public static getAllAccountMonthlyCalculations(budgetId:string, includeTombstonedEntities:boolean = false):IDatabaseQuery {

		if(includeTombstonedEntities) {
			return {
				name: "accountMonthlyCalculations",
				query: "Select * FROM AccountMonthlyCalculations WHERE budgetId = ?",
				arguments: [budgetId]
			};
		}
		else {
			return {
				name: "accountMonthlyCalculations",
				query: "Select * FROM AccountMonthlyCalculations WHERE budgetId = ? AND isTombstone = 0",
				arguments: [budgetId]
			};
		}
	}

	public static getAccountMonthlyCalculation(budgetId:string, accountId:string, month:string):IDatabaseQuery {

		return {
			name: "accountMonthlyCalculations",
			query: "SELECT * FROM AccountMonthlyCalculations WHERE budgetId = ? AND accountId = ? AND month = ?",
			arguments: [budgetId, accountId, month]
		};
	}

	public static getAccountBalanceAtStartOfMonth(budgetId:string, accountId:string, asOfMonth:DateWithoutTime):IDatabaseQuery {

		var upToMonth = asOfMonth.clone().addMonths(-1).startOfMonth().toString();

		//To get the account balance "at start of month", we will sum balances of AccountMonthlyCalculations records up to (but not including) the asOfMonth.
		return {
			name: "accountBalanceAtStartOfMonth",
			query: "SELECT COALESCE(SUM(clearedBalance),0) AS clearedBalance, COALESCE(SUM(unclearedBalance),0) AS unclearedBalance, COALESCE(SUM(clearedBalance + unclearedBalance),0) AS balance FROM AccountMonthlyCalculations WHERE budgetId = ? AND accountId = ? AND month <= ?",
			arguments: [budgetId, accountId, upToMonth]
		};
	}

	public static getOnBudgetAccounts(budgetId:string):IDatabaseQuery {

		return {
			name: "accounts",
			query: "Select * FROM Accounts WHERE budgetId = ? AND onBudget = 1 AND closed = 0 AND isTombstone = 0",
			arguments: [budgetId]
		};
	}

	public static getOffBudgetAccounts(budgetId:string):IDatabaseQuery {

		return {
			name: "accounts",
			query: "Select * FROM Accounts WHERE budgetId = ? AND onBudget = 0 AND closed = 0 AND isTombstone = 0",
			arguments: [budgetId]
		};
	}

	public static getLiabilityAccounts(budgetId:string):IDatabaseQuery {

		return {
			name: "liabilityAccounts",
			query: "Select * FROM Accounts WHERE budgetId = ? AND isTombstone = 0 AND accountType = ?",
			arguments: [budgetId, SubCategoryType.Debt]
		};
	}

	public static getClosedAccounts(budgetId:string):IDatabaseQuery {

		return {
			name: "accounts",
			query: "Select * FROM Accounts WHERE budgetId = ? AND closed = 1 AND isTombstone = 0",
			arguments: [budgetId]
		};
	}

	public static findAccountByEntityId(budgetId:string, entityId:string):IDatabaseQuery {

		return {
			name: "accounts",
			query: "Select * FROM Accounts WHERE budgetId = ? AND entityId = ?",
			arguments: [budgetId, entityId]
		};
	}

	public static findAccountByName(budgetId:string, accountName:string):IDatabaseQuery {

		return {
			name: "accounts",
			query: "Select * FROM Accounts WHERE budgetId = ? AND accountName = ?",
			arguments: [budgetId, accountName]
		};
	}

	public static debtPaymentActivityHeader(budgetId:string, debtPaymentAccountId:string, startDateUTCTime:number, endDateUTCTime:number):IDatabaseQuery {

		return {
			name: "debtPaymentActivityHeader",
			query: `
	/*

	Values to populate the header for the  debt payment
	(i.e. credit card) category activity transaction list.

	Returns:
	spent - sum of _credit_ spending for the debt payment account (doesn't include cash spending or transfers)
	budgetedFor - amount of credit spending that was budgeted for

	Query Paramaters:
	?1 is the budgetId
	?2 is the debt payment subCategoryId
	?3 is the month you want to get the spent and budgetedFor balances
	*/

	SELECT
	COALESCE(allSpending, 0) * -1 as spent, 
	COALESCE(budgetedSpending, 0) * -1 as budgetedFor
	FROM
	MonthlySubCategoryBudgets MSCB
	WHERE
	MSCB.subCategoryId = ?2
	AND
	MSCB.month = ?3
	AND
	MSCB.budgetId = ?1

	`,
			arguments: [budgetId, debtPaymentAccountId, startDateUTCTime, endDateUTCTime]
		};
	}
}
