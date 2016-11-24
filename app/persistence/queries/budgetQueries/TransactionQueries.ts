/// <reference path='../../../_includes.ts' />

import { AccountTypes, TransactionSources } from '../../../constants';
import { DateWithoutTime, MathUtilities } from '../../../utilities';
import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export class TransactionQueries {

	public static get TransactionSourcesINClause():string { return `'', '${TransactionSources.Scheduler}', '${TransactionSources.Imported}'`; }
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
						checkNumber,
						cleared, 
						accepted, 
						flag, 
						source,
						transferAccountId, 
						transferTransactionId, 
						scheduledTransactionId, 
						matchedTransactionId, 
						importId, 
						deviceKnowledge,
						deviceKnowledgeForCalculatedFields
					) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
				dbObject.checkNumber ? dbObject.checkNumber : null,
				dbObject.cleared,
				dbObject.accepted,
				dbObject.flag ? dbObject.flag : null,
				dbObject.source,
				dbObject.transferAccountId ? dbObject.transferAccountId : null,
				dbObject.transferTransactionId ? dbObject.transferTransactionId : null,
				dbObject.scheduledTransactionId ? dbObject.scheduledTransactionId : null,
				dbObject.matchedTransactionId ? dbObject.matchedTransactionId : null,
				dbObject.importId ? dbObject.importId : null,
				dbObject.deviceKnowledge,
				dbObject.deviceKnowledgeForCalculatedFields
			]
		};

		return query;
	}

	public static loadDatabaseObject(budgetId:string, deviceKnowledge:number, deviceKnowledgeForCalculations:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "transactions",
			query: `SELECT * FROM Transactions WHERE budgetId = ?1 AND 
						(deviceKnowledge = 0 OR deviceKnowledge > ?2 OR deviceKnowledgeForCalculatedFields = 0 OR
						deviceKnowledgeForCalculatedFields > ?3)`,
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
}
