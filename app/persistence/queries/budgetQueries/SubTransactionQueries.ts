/// <reference path='../../../_includes.ts' />

import { DateWithoutTime } from '../../../utilities';
import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export class SubTransactionQueries {

	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:budgetEntities.ISubTransaction):IDatabaseQuery {

		// Note: If you update the query here because of change in columns, be sure to modify the insertion
		// queries in the MobileScheduledTransactionCalculations as well.
		var query:IDatabaseQuery = {

			name: "subTransactions",
			query: `REPLACE INTO SubTransactions (
						budgetId, 
						entityId, 
						isTombstone, 
						transactionId, 
						payeeId, 
						subCategoryId, 
						amount, 
						cashAmount, 
						creditAmount, 
						subCategoryCreditAmountPreceding, 
						memo, 
						checkNumber, 
						transferAccountId, 
						transferTransactionId, 
						sortableIndex, 
						deviceKnowledge,
						deviceKnowledgeForCalculatedFields
					) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
			arguments: [
				dbObject.budgetId,
				dbObject.entityId,
				dbObject.isTombstone,
				dbObject.transactionId,
				dbObject.payeeId ? dbObject.payeeId : null,
				dbObject.subCategoryId ? dbObject.subCategoryId : null,
				dbObject.amount,
				dbObject.cashAmount,
				dbObject.creditAmount,
				dbObject.subCategoryCreditAmountPreceding,
				dbObject.memo ? dbObject.memo : null,
				dbObject.checkNumber ? dbObject.checkNumber : null,
				dbObject.transferAccountId ? dbObject.transferAccountId : null,
				dbObject.transferTransactionId ? dbObject.transferTransactionId : null,
				dbObject.sortableIndex,
				dbObject.deviceKnowledge,
				dbObject.deviceKnowledgeForCalculatedFields
			]
		};

		return query;
	}

	public static loadDatabaseObject(budgetId:string, deviceKnowledge:number, deviceKnowledgeForCalculations:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "be_subtransactions",
			query: `SELECT * FROM SubTransactions WHERE budgetId = ?1 AND 
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
	public static getAllSubTransactions(budgetId:string, includeTombstonedEntities:boolean = false):IDatabaseQuery {

		if(includeTombstonedEntities) {
			return {
				name: "subTransactions",
				query: "Select * FROM SubTransactions WHERE budgetId = ?",
				arguments: [budgetId]
			};
		}
		else {
			return {
				name: "subTransactions",
				query: "Select * FROM SubTransactions WHERE budgetId = ? AND isTombstone = 0",
				arguments: [budgetId]
			};
		}
	}

	public static findSubTransactionByEntityId(budgetId:string, entityId:string):IDatabaseQuery {

		return {
			name: "subTransactions",
			query: "Select * FROM SubTransactions WHERE budgetId = ? AND entityId = ?",
			arguments: [budgetId, entityId]
		};
	}

	public static findSubTransactionsByParentEntityId(budgetId:string, parentEntityId:string):IDatabaseQuery {

		return {
			name: "subTransactions",
			query: "Select * FROM SubTransactions WHERE budgetId = ? AND transactionId = ?",
			arguments: [budgetId, parentEntityId]
		};
	}

	public static findSubTransactionsForAccountSinceDateOrderedBySortableIndex(budgetId:string, accountId:string, sinceDate:DateWithoutTime):IDatabaseQuery {

		return {
			name: "subTransactions",
			query: `SELECT *
					FROM SubTransactions ST
					WHERE ST.budgetId = ?1 AND ST.isTombstone = 0 AND ST.transactionId IN (
						SELECT entityId
						FROM Transactions T
						WHERE T.budgetId = ?1 AND T.accountId = ?2 AND T.date >= ?3 AND T.isTombstone = 0 AND
							(T.source IS NULL OR T.source IN ('', 'Scheduler', 'Matched', 'Imported'))
					)
					ORDER BY ST.sortableIndex`,
			arguments: [budgetId, accountId, sinceDate.getUTCTime()]
		};
	}

	// Returns the transaction database objects, if any, that are the transfer counterparts
	// of the split sub transactions of the specified parent transaction.
	public static findSubTransactionsTransferCounterpartsByParentEntityId(budgetId:string, parentEntityId:string):IDatabaseQuery {

		return {
			name: "transactions",
			query: `SELECT * FROM Transactions WHERE budgetId = ?1 AND entityId IN
						(SELECT transferTransactionId FROM SubTransactions WHERE budgetId = ?1 AND transactionId = ?2)`,
			arguments: [budgetId, parentEntityId]
		};
	}
}