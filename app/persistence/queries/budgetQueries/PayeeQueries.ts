/// <reference path='../../../_includes.ts' />

import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export class PayeeQueries {

	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:budgetEntities.IPayee):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "payees",
			query: `REPLACE INTO Payees (
						budgetId, 
						entityId, 
						isTombstone, 
						accountId, 
						enabled, 
						autoFillSubCategoryId, 
						name, 
						internalName, 
						deviceKnowledge
					) VALUES (?,?,?,?,?,?,?,?,?)`,
			arguments: [
				dbObject.budgetId,
				dbObject.entityId,
				dbObject.isTombstone,
				dbObject.accountId ? dbObject.accountId : null,
				dbObject.enabled,
				dbObject.autoFillSubCategoryId ? dbObject.autoFillSubCategoryId : null,
				dbObject.name,
				dbObject.internalName ? dbObject.internalName : null,
				dbObject.deviceKnowledge
			]
		};

		return query;
	}

	public static loadDatabaseObject(budgetId:string, deviceKnowledge:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "payees",
			query: "SELECT * FROM Payees WHERE budgetId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?)",
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
	public static getAllPayees(budgetId:string, includeTombstonedEntities:boolean = false):IDatabaseQuery {

		if(includeTombstonedEntities) {
			return {
				name: "payees",
				query: "Select * FROM Payees WHERE budgetId = ?",
				arguments: [budgetId]
			};
		}
		else {
			return {
				name: "payees",
				query: "Select * FROM Payees WHERE budgetId = ? AND isTombstone = 0",
				arguments: [budgetId]
			};
		}
	}

	public static getInternalPayees(budgetId:string):IDatabaseQuery {

		return {
			name: "payees",
			query: "Select * FROM Payees WHERE budgetId = ? AND isTombstone = 0 AND internalName IS NOT NULL",
			arguments: [budgetId]
		};
	}

	public static getTransferPayees(budgetId:string):IDatabaseQuery {

		return {
			name: "payees",
			query: "Select * FROM Payees WHERE budgetId = ? AND isTombstone = 0 AND accountId IS NOT NULL",
			arguments: [budgetId]
		};
	}

	public static findPayeeByEntityId(budgetId:string, entityId:string):IDatabaseQuery {

		return {
			name: "payees",
			query: "Select * FROM Payees WHERE budgetId = ? AND entityId = ?",
			arguments: [budgetId, entityId]
		};
	}

	public static findPayeeByName(budgetId:string, payeeName:string):IDatabaseQuery {

		return {
			name: "payees",
			query: "Select * FROM Payees WHERE budgetId = ? AND name = ?",
			arguments: [budgetId, payeeName]
		};
	}

	public static findTransferPayees(budgetId:string):IDatabaseQuery {
		return {
			name: "payees",
			query: "Select * FROM Payees WHERE budgetId = ? AND isTombstone = 0 AND accountId IS NOT NULL",
			arguments: [budgetId]
		};
	}
}