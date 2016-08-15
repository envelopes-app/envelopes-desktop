/// <reference path='../../../_includes.ts' />

import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export class ScheduledSubTransactionQueries {

	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:budgetEntities.IScheduledSubTransaction):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "scheduledSubTransactions",
			query: `REPLACE INTO ScheduledSubTransactions (
						budgetId, 
						entityId, 
						isTombstone, 
						scheduledTransactionId, 
						payeeId, 
						subCategoryId, 
						amount, 
						memo, 
						transferAccountId, 
						sortableIndex, 
						deviceKnowledge
					) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
			arguments: [
				dbObject.budgetId,
				dbObject.entityId,
				dbObject.isTombstone,
				dbObject.scheduledTransactionId,
				dbObject.payeeId ? dbObject.payeeId : null,
				dbObject.subCategoryId ? dbObject.subCategoryId : null,
				dbObject.amount,
				dbObject.memo ? dbObject.memo : null,
				dbObject.transferAccountId ? dbObject.transferAccountId : null,
				dbObject.sortableIndex,
				dbObject.deviceKnowledge
			]
		};

		return query;
	}

	public static loadDatabaseObject(budgetId:string, deviceKnowledge:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "scheduledSubTransactions",
			query: "SELECT * FROM ScheduledSubTransactions WHERE budgetId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?) AND isTombstone = 0",
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
	public static getAllScheduledSubTransactions(budgetId:string, includeTombstonedEntities:boolean = false):IDatabaseQuery {

		if(includeTombstonedEntities) {
			return {
				name: "scheduledSubTransactions",
				query: "Select * FROM ScheduledSubTransactions WHERE budgetId = ?",
				arguments: [budgetId]
			};
		}
		else {
			return {
				name: "scheduledSubTransactions",
				query: "Select * FROM ScheduledSubTransactions WHERE budgetId = ? AND isTombstone = 0",
				arguments: [budgetId]
			};
		}
	}

	public static findScheduledSubTransactionByEntityId(budgetId:string, entityId:string):IDatabaseQuery {

		return {
			name: "scheduledSubTransactions",
			query: "Select * FROM ScheduledSubTransactions WHERE budgetId = ? AND entityId = ?",
			arguments: [budgetId, entityId]
		};
	}

	public static findScheduledSubTransactionsByParentEntityId(budgetId:string, parentEntityId:string):IDatabaseQuery {

		return {
			name: "scheduledSubTransactions",
			query: "Select * FROM ScheduledSubTransactions WHERE budgetId = ? AND scheduledTransactionId = ? AND isTombstone = 0",
			arguments: [budgetId, parentEntityId]
		};
	}
}