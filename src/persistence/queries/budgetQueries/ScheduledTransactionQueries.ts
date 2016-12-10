/// <reference path='../../../_includes.ts' />

import { DateWithoutTime } from '../../../utilities';
import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export class ScheduledTransactionQueries {

	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:budgetEntities.IScheduledTransaction):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "scheduledTransactions",
			query: `REPLACE INTO ScheduledTransactions (
						budgetId, 
						entityId, 
						isTombstone, 
						accountId, 
						payeeId, 
						subCategoryId, 
						date, 
						frequency, 
						amount, 
						memo, 
						flag, 
						transferAccountId, 
						upcomingInstances, 
						deviceKnowledge,
						deviceKnowledgeForCalculatedFields
					) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
			arguments: [
				dbObject.budgetId,
				dbObject.entityId,
				dbObject.isTombstone,
				dbObject.accountId,
				dbObject.payeeId ? dbObject.payeeId : null,
				dbObject.subCategoryId ? dbObject.subCategoryId : null,
				dbObject.date,
				dbObject.frequency ? dbObject.frequency : null,
				dbObject.amount,
				dbObject.memo ? dbObject.memo : null,
				dbObject.flag ? dbObject.flag : null,
				dbObject.transferAccountId ? dbObject.transferAccountId : null,
				dbObject.upcomingInstances ? dbObject.upcomingInstances : null,
				dbObject.deviceKnowledge,
				dbObject.deviceKnowledgeForCalculatedFields
			]
		};

		return query;
	}

	public static loadDatabaseObject(budgetId:string, deviceKnowledge:number, deviceKnowledgeForCalculations:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "scheduledTransactions",
			query: `SELECT * FROM ScheduledTransactions WHERE budgetId = ?1 AND 
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
	public static getAllScheduledTransactions(budgetId:string, includeTombstonedEntities:boolean = false):IDatabaseQuery {

		if(includeTombstonedEntities) {
			return {
				name: "scheduledTransactions",
				query: "Select * FROM ScheduledTransactions WHERE budgetId = ?",
				arguments: [budgetId]
			};
		}
		else {
			return {
				name: "scheduledTransactions",
				query: `SELECT * FROM ScheduledTransactions WHERE budgetId = ?1 AND isTombstone = 0 AND accountId IN (
					SELECT entityId FROM Accounts WHERE budgetId = ?1 AND isTombstone = 0 AND closed = 0
				)`,
				arguments: [budgetId]
			};
		}
	}

	public static findScheduledTransactionByEntityId(budgetId:string, entityId:string):IDatabaseQuery {

		return {
			name: "scheduledTransactions",
			query: "Select * FROM ScheduledTransactions WHERE budgetId = ? AND entityId = ?",
			arguments: [budgetId, entityId]
		};
	}

	public static findScheduledTransactionsByDate(budgetId:string, date:DateWithoutTime):IDatabaseQuery {

		return {
			name: "scheduledTransactions",
			query: "Select * FROM ScheduledTransactions WHERE budgetId = ? AND date = ?",
			arguments: [budgetId, date.getUTCTime()]
		};
	}
}