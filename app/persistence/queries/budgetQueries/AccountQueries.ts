import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export function insertDatabaseObject(dbObject:budgetEntities.IAccount):IDatabaseQuery {

	var query:IDatabaseQuery = {

		name: "accounts",
		query: `REPLACE INTO Accounts (
					budgetVersionId, 
					entityId, 
					isTombstone, 
					accountType, 
					accountName, 
					note, 
					lastEnteredCheckNumber, 
					lastReconciledDate, 
					lastReconciledBalance, 
					hidden, 
					sortableIndex, 
					onBudget, 
					directConnectEnabled, 
					clearedBalance, 
					unclearedBalance, 
					infoCount, 
					warningCount, 
					errorCount, 
					transactionCount, 
					deviceKnowledge,
					deviceKnowledgeForCalculatedFields
				) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
		arguments: [
			dbObject.budgetVersionId,
			dbObject.entityId,
			dbObject.isTombstone,
			dbObject.accountType,
			dbObject.accountName,
			dbObject.note ? dbObject.note : null,
			dbObject.lastEnteredCheckNumber,
			dbObject.lastReconciledDate,
			dbObject.lastReconciledBalance,
			dbObject.hidden,
			dbObject.sortableIndex,
			dbObject.onBudget,
			dbObject.directConnectEnabled,
			dbObject.clearedBalance,
			dbObject.unclearedBalance,
			dbObject.infoCount,
			dbObject.warningCount,
			dbObject.errorCount,
			dbObject.transactionCount,
			dbObject.deviceKnowledge,
			dbObject.deviceKnowledgeForCalculatedFields
		]
	};

	return query;
}

public static insertMonthlyCalculationDatabaseObject(dbObject:ynab.interfaces.budgetEntities.IDatabaseAccountMonthlyCalculation):ynab.interfaces.adapters.IDatabaseQuery {

	var query:ynab.interfaces.adapters.IDatabaseQuery = {

		name: "accountMonthlyCalculations",
		query: "REPLACE INTO AccountMonthlyCalculations (budgetVersionId, entityId, isTombstone, month, accountId, clearedBalance, unclearedBalance, infoCount, warningCount, errorCount, transactionCount, deviceKnowledge) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
		arguments: [
			dbObject.budgetVersionId,
			dbObject.entityId,
			dbObject.isTombstone,
			dbObject.month,
			dbObject.accountId,
			dbObject.clearedBalance,
			dbObject.unclearedBalance,
			dbObject.infoCount,
			dbObject.warningCount,
			dbObject.errorCount,
			dbObject.transactionCount,
			dbObject.deviceKnowledge
		]
	};

	return query;
}

public static loadDatabaseObject(budgetVersionId:string, deviceKnowledge:number, deviceKnowledgeForCalculations:number):ynab.interfaces.adapters.IDatabaseQuery {

	var query:ynab.interfaces.adapters.IDatabaseQuery = {

		name: "be_accounts",
		query: `SELECT * FROM Accounts WHERE budgetVersionId = ?1 AND (
					deviceKnowledge = 0 OR deviceKnowledge > ?2 OR deviceKnowledgeForCalculatedFields = 0 OR 
					deviceKnowledgeForCalculatedFields > ?3) AND isTombstone = 0`,
		arguments: [
			budgetVersionId,
			deviceKnowledge,
			deviceKnowledgeForCalculations
		]
	};

	return query;
}

public static loadDatabaseCalculationObject(budgetVersionId:string, deviceKnowledge:number):ynab.interfaces.adapters.IDatabaseQuery {

	var query:ynab.interfaces.adapters.IDatabaseQuery = {

		name: "be_monthly_account_calculations",
		query: "SELECT * FROM AccountMonthlyCalculations WHERE budgetVersionId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?) AND isTombstone = 0",
		arguments: [
			budgetVersionId,
			deviceKnowledge
		]
	};

	return query;
}

// *********************************************************************************************************
// Queries for reading data from the database
// *********************************************************************************************************
public static getAllAccounts(budgetVersionId:string, includeTombstonedEntities:boolean = false):ynab.interfaces.adapters.IDatabaseQuery {

	if(includeTombstonedEntities) {
		return {
			name: "accounts",
			query: "Select * FROM Accounts WHERE budgetVersionId = ?",
			arguments: [budgetVersionId]
		};
	}
	else {
		return {
			name: "accounts",
			query: "Select * FROM Accounts WHERE budgetVersionId = ? AND isTombstone = 0",
			arguments: [budgetVersionId]
		};
	}
}

public static getAllAccountMonthlyCalculations(budgetVersionId:string, includeTombstonedEntities:boolean = false):ynab.interfaces.adapters.IDatabaseQuery {

	if(includeTombstonedEntities) {
		return {
			name: "accountMonthlyCalculations",
			query: "Select * FROM AccountMonthlyCalculations WHERE budgetVersionId = ?",
			arguments: [budgetVersionId]
		};
	}
	else {
		return {
			name: "accountMonthlyCalculations",
			query: "Select * FROM AccountMonthlyCalculations WHERE budgetVersionId = ? AND isTombstone = 0",
			arguments: [budgetVersionId]
		};
	}
}

public static getAccountMonthlyCalculation(budgetVersionId:string, accountId:string, month:string):ynab.interfaces.adapters.IDatabaseQuery {

	return {
		name: "accountMonthlyCalculations",
		query: "SELECT * FROM AccountMonthlyCalculations WHERE budgetVersionId = ? AND accountId = ? AND month = ?",
		arguments: [budgetVersionId, accountId, month]
	};
}

public static getAccountBalanceAtStartOfMonth(budgetVersionId:string, accountId:string, asOfMonth:ynab.utilities.DateWithoutTime):ynab.interfaces.adapters.IDatabaseQuery {

	var upToMonth = asOfMonth.clone().addMonths(-1).startOfMonth().toString();

	//To get the account balance "at start of month", we will sum balances of AccountMonthlyCalculations records up to (but not including) the asOfMonth.
	return {
		name: "accountBalanceAtStartOfMonth",
		query: "SELECT COALESCE(SUM(clearedBalance),0) AS clearedBalance, COALESCE(SUM(unclearedBalance),0) AS unclearedBalance, COALESCE(SUM(clearedBalance + unclearedBalance),0) AS balance FROM AccountMonthlyCalculations WHERE budgetVersionId = ? AND accountId = ? AND month <= ?",
		arguments: [budgetVersionId, accountId, upToMonth]
	};
}

public static getOnBudgetAccounts(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

	return {
		name: "accounts",
		query: "Select * FROM Accounts WHERE budgetVersionId = ? AND onBudget = 1 AND hidden = 0 AND isTombstone = 0",
		arguments: [budgetVersionId]
	};
}

public static getOffBudgetAccounts(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

	return {
		name: "accounts",
		query: "Select * FROM Accounts WHERE budgetVersionId = ? AND onBudget = 0 AND hidden = 0 AND isTombstone = 0",
		arguments: [budgetVersionId]
	};
}

public static getLiabilityAccounts(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

	return {
		name: "liabilityAccounts",
		query: "Select * FROM Accounts WHERE budgetVersionId = ? AND isTombstone = 0 AND accountType = ?",
		arguments: [budgetVersionId, ynab.constants.SubCategoryType.Debt]
	};
}

public static getClosedAccounts(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

	return {
		name: "accounts",
		query: "Select * FROM Accounts WHERE budgetVersionId = ? AND hidden = 1 AND isTombstone = 0",
		arguments: [budgetVersionId]
	};
}

public static findAccountByEntityId(budgetVersionId:string, entityId:string):ynab.interfaces.adapters.IDatabaseQuery {

	return {
		name: "accounts",
		query: "Select * FROM Accounts WHERE budgetVersionId = ? AND entityId = ?",
		arguments: [budgetVersionId, entityId]
	};
}

public static findAccountByName(budgetVersionId:string, accountName:string):ynab.interfaces.adapters.IDatabaseQuery {

	return {
		name: "accounts",
		query: "Select * FROM Accounts WHERE budgetVersionId = ? AND accountName = ?",
		arguments: [budgetVersionId, accountName]
	};
}

public static debtPaymentActivityHeader(budgetVersionId:string, debtPaymentAccountId:string, startDateUTCTime:number, endDateUTCTime:number):ynab.interfaces.adapters.IDatabaseQuery {

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
?1 is the budgetVersionId
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
MSCB.budgetVersionId = ?1

`,
		arguments: [budgetVersionId, debtPaymentAccountId, startDateUTCTime, endDateUTCTime]
	};
}