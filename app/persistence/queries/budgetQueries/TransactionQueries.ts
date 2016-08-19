/// <reference path='../../../_includes.ts' />

import { AccountTypes, TransactionSources } from '../../../constants';
import { DateWithoutTime, MathUtilities } from '../../../utilities';
import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export class TransactionQueries {

	public static get TransactionSourcesINClause():string { return `'', '${TransactionSources.Scheduler}', '${TransactionSources.Matched}', '${TransactionSources.Imported}'`; }
	public static get TransactionLiabilityAccountTypesINClause():string { return `'${AccountTypes.CreditCard}', '${AccountTypes.LineOfCredit}', '${AccountTypes.Mortgage}', '${AccountTypes.OtherLiability}'`; }
			
	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:budgetEntities.ITransaction):IDatabaseQuery {

		// Note: If you update the query here because of change in columns, be sure to modify the insertion
		// queries in the MobileScheduledTransactionCalculations as well.
		var query:IDatabaseQuery = {

			name: "transactions",
			query: `REPLACE INTO Transactions (
						budgetId, 
						entityId, 
						isTombstone, 
						accountId, 
						payeeId, 
						subCategoryId, 
						date, 
						dateEnteredFromSchedule, 
						amount, 
						cashAmount, 
						creditAmount, 
						subCategoryCreditAmountPreceding, 
						memo, 
						cleared, 
						accepted, 
						flag, 
						transferAccountId, 
						transferTransactionId, 
						transferSubTransactionId, 
						scheduledTransactionId, 
						matchedTransactionId, 
						importId, 
						importedPayee, 
						importedDate, 
						deviceKnowledge,
						deviceKnowledgeForCalculatedFields
					) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
			arguments: [
				dbObject.budgetId,
				dbObject.entityId,
				dbObject.isTombstone,
				dbObject.accountId,
				dbObject.payeeId ? dbObject.payeeId : null,
				dbObject.subCategoryId ? dbObject.subCategoryId : null,
				dbObject.date,
				dbObject.dateEnteredFromSchedule ? dbObject.dateEnteredFromSchedule : null,
				dbObject.amount,
				dbObject.cashAmount,
				dbObject.creditAmount,
				dbObject.subCategoryCreditAmountPreceding,
				dbObject.memo ? dbObject.memo : null,
				dbObject.cleared,
				dbObject.accepted,
				dbObject.flag ? dbObject.flag : null,
				dbObject.transferAccountId ? dbObject.transferAccountId : null,
				dbObject.transferTransactionId ? dbObject.transferTransactionId : null,
				dbObject.transferSubTransactionId ? dbObject.transferSubTransactionId : null,
				dbObject.scheduledTransactionId ? dbObject.scheduledTransactionId : null,
				dbObject.matchedTransactionId ? dbObject.matchedTransactionId : null,
				dbObject.importId ? dbObject.importId : null,
				dbObject.importedPayee ? dbObject.importedPayee : null,
				dbObject.importedDate ? dbObject.importedDate : null,
				dbObject.deviceKnowledge,
				dbObject.deviceKnowledgeForCalculatedFields
			]
		};

		return query;
	}

	public static loadDatabaseObject(budgetId:string, deviceKnowledge:number, deviceKnowledgeForCalculations:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "be_transactions",
			query: `SELECT * FROM Transactions WHERE budgetId = ?1 AND 
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

	// *********************************************************************************************************
	// Queries for reading data from the database
	// *********************************************************************************************************
	public static getAllTransactions(budgetId:string, includeTombstonedEntities:boolean = false):IDatabaseQuery {

		if(includeTombstonedEntities) {
			return {
				name: "transactions",
				query: "Select * FROM Transactions WHERE budgetId = ?",
				arguments: [budgetId]
			};
		}
		else {
			return {
				name: "transactions",
				query: "Select * FROM Transactions WHERE budgetId = ? AND isTombstone = 0",
				arguments: [budgetId]
			};
		}
	}

	public static findTransactionByEntityId(budgetId:string, entityId:string):IDatabaseQuery {

		return {
			name: "transactions",
			query: "Select * FROM Transactions WHERE budgetId = ? AND entityId = ?",
			arguments: [budgetId, entityId]
		};
	}

	public static findTransactionsByDate(budgetId:string, date:DateWithoutTime):IDatabaseQuery {

		return {
			name: "transactions",
			query: `SELECT * 
					FROM Transactions T
					WHERE T.budgetId = ?1
					AND T.date = ?2
					AND T.isTombstone = 0
					AND COALESCE(T.source,'') IN (${TransactionQueries.TransactionSourcesINClause})`,
			arguments: [budgetId, date.getUTCTime()]
		};
	}

	public static findTransactionsForAccountSinceDateOrderedByDateThenAmount(budgetId:string, accountId:string, sinceDate:DateWithoutTime):IDatabaseQuery {

		return {
			name: "transactions",
			query: `SELECT *
					FROM Transactions T
					WHERE T.budgetId = ?1 
						AND T.accountId = ?2
						AND T.date >= ?3
						AND T.isTombstone = 0
						AND COALESCE(T.source,'') IN (${TransactionQueries.TransactionSourcesINClause})
					ORDER BY T.date, T.amount`,
			arguments: [budgetId, accountId, sinceDate.getUTCTime()]
		};
	}
	
	public static findTransactionsForAccount(budgetId:string, accountId:string):IDatabaseQuery {
		return TransactionQueries.findTransactions(budgetId, 0, 0, accountId, null);
	}

	// This method will return both transactions and split sub transactions matching the category.
	public static findTransactionsForCategory(budgetId:string, subCategoryId:string):IDatabaseQuery {
		return TransactionQueries.findTransactions(budgetId, 0, 0, null, subCategoryId);
	}

	public static findTransactionsForAllAccounts(budgetId:string):IDatabaseQuery {
		return TransactionQueries.findTransactions(budgetId, 0, 0, null, null);
	}

	// If subCategoryId is specified, will return both transactions and sub transactions matching the category.
	// If '__uncategorized__' is specified as the subCategoryId, then will return transactions and sub transactions without a category.
	//
	public static findTransactions(budgetId:string, startDateUTCTime:number, endDateUTCTime:number, accountId:string, subCategoryId:string):IDatabaseQuery {
		return {
			name: "transactions",
			query: `

/* START main transactions */
${TransactionQueries.findTransactionsSELECTForMainTransactions()}
${TransactionQueries.findTransactionsFROMAndJOINsForMainTransactions()}
${TransactionQueries.findTransactionsWHEREForMainTransactions()}
/* Optional Account Filter */
AND
(?4 = '' OR T.accountId = ?4)

/* Optional Category Filter */
AND
((?5 = '' OR (T.subCategoryId = ?5 AND A.onBudget = 1)) OR (?5 = '__uncategorized__' AND T.subCategoryId IS NULL AND A.onBudget = 1 AND (TA.onBudget = 0 OR TA.onBudget IS NULL)))

/* END main transactions */

UNION ALL

/* START category sub-transactions */
${TransactionQueries.findTransactionsSELECTForSubTransactions()}
${TransactionQueries.findTransactionsFROMAndJOINsForSubTransactions()}
${TransactionQueries.findTransactionsWHEREForSubTransactions()}
/* Optional Account Filter */
AND
(?4 = '' OR T.accountId = ?4)

/* Category is required */
AND
((?5 != '' AND ST.subCategoryId = ?5 AND A.onBudget = 1) OR (?5 = '__uncategorized__' AND ST.subCategoryId IS NULL AND A.onBudget = 1 AND (TA.onBudget = 0 OR TA.onBudget IS NULL)))

/* END category sub-transactions */

${TransactionQueries.findTransactionsORDER()}
		`,
		arguments: [budgetId, startDateUTCTime, endDateUTCTime == 0 ? MathUtilities.MAX_JS_INT : endDateUTCTime, accountId == null ? '' : accountId, subCategoryId == null ? '' : subCategoryId]
		};
	}

	static findTransactionsSELECTForMainTransactions():string {
		return `
SELECT
T.entityId as transactionId,

T.date as date,

T.amount as amount,

T.accountId as accountId,
A.accountName as accountName,

CASE WHEN A.onBudget = 1 THEN T.subCategoryId ELSE NULL END as categoryId,
CASE WHEN A.onBudget = 1 THEN SC.name ELSE NULL END as categoryName,
CASE WHEN A.onBudget = 1 THEN SC.internalName ELSE NULL END as categoryInternalName,

T.payeeId as payeeId,
P.name as payeeName,

T.memo as memo,
T.cleared as cleared,
T.checkNumber as checkNumber,
T.flag as flag,

T.transferAccountId as transferAccountId,
TA.accountName as transferAccountName,

T.transferTransactionId as transferTransactionId,
T.transferSubTransactionId as transferSubTransactionId,

CASE WHEN SC.internalName = 'Category/__Split__' THEN 1 ELSE 0 END as isSplit
`;
	}

	static findTransactionsSELECTForSubTransactions():string {
		return `
SELECT
ST.transactionId as transactionId,

T.date as date,

ST.amount as amount,

T.accountId as accountId,
A.accountName as accountName,

CASE WHEN A.onBudget = 1 THEN ST.subCategoryId ELSE NULL END as categoryId,
CASE WHEN A.onBudget = 1 THEN SC.name ELSE NULL END as categoryName,
CASE WHEN A.onBudget = 1 THEN SC.internalName ELSE NULL END as categoryInternalName,

COALESCE(ST.payeeId, T.payeeId) as payeeId,
COALESCE(SP.name, P.name) as payeeName,

ST.memo as memo,
T.cleared as cleared,
ST.checkNumber as checkNumber,
T.flag as flag,

ST.transferAccountId as transferAccountId,
TA.accountName as transferAccountName,

T.transferTransactionId as transferTransactionId,
T.transferSubTransactionId as transferSubTransactionId,

0 as isSplit
`;
	}

	static findTransactionsFROMAndJOINsForMainTransactions():string {
		return`
FROM
Transactions T

LEFT JOIN
Accounts A
ON
T.accountId = A.entityId

LEFT JOIN
SubCategories SC
ON
T.subCategoryId = SC.entityId

LEFT JOIN
Payees P
ON
T.payeeId = P.entityId

LEFT JOIN
Accounts TA
ON
T.transferAccountId = TA.entityId
`;
	}

	static findTransactionsFROMAndJOINsForSubTransactions():string {
		return `
FROM
SubTransactions ST

LEFT JOIN
Transactions T
ON ST.transactionId = T.entityId

LEFT JOIN
Accounts A
ON
T.accountId = A.entityId

LEFT JOIN
SubCategories SC
ON
ST.subCategoryId = SC.entityId

LEFT JOIN
Payees P
ON
T.payeeId = P.entityId

LEFT JOIN
Payees SP
ON
ST.payeeId = SP.entityId

LEFT JOIN
Accounts TA
ON
ST.transferAccountId = TA.entityId
`;
	}

	static findTransactionsWHEREForMainTransactions():string {
		return `
WHERE
T.budgetId = ?1
AND
T.isTombstone = 0
AND
COALESCE(T.source,'') IN (${TransactionQueries.TransactionSourcesINClause})
AND
(A.isTombstone = 0 OR A.isTombstone IS NULL)
AND
(TA.isTombstone = 0 OR TA.isTombstone IS NULL)
AND
T.date >= ?2 /* Start date is inclusive */
AND
T.date < ?3 /* End date is exclusive */
`;
	}

	static findTransactionsWHEREForSubTransactions():string {
		return `
WHERE
T.budgetId = ?1
AND
T.isTombstone = 0
AND
ST.isTombstone = 0
AND
COALESCE(T.source,'') IN (${TransactionQueries.TransactionSourcesINClause})
AND
(A.isTombstone = 0 OR A.isTombstone IS NULL)
AND
(TA.isTombstone = 0 OR TA.isTombstone IS NULL)

AND
T.date >= ?2 /* Start date is inclusive */

AND
T.date < ?3 /* End date is exclusive */
`;
	}

	static findTransactionsORDER():string {
		return `
ORDER BY
date DESC,
amount DESC,
transactionId
`;
	}

}
