/// <reference path='../../../_includes.ts' />

import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export class PayeeRenameConditionQueries {

	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:budgetEntities.IPayeeRenameCondition):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "payeeRenameConditions",
			query: `REPLACE INTO PayeeRenameConditions (
						budgetId, 
						entityId, 
						isTombstone, 
						payeeId, 
						operator, 
						operand, 
						deviceKnowledge
					) VALUES (?,?,?,?,?,?,?)`,
			arguments: [
				dbObject.budgetId,
				dbObject.entityId,
				dbObject.isTombstone,
				dbObject.payeeId,
				dbObject.operator ? dbObject.operator : null,
				dbObject.operand ? dbObject.operand : null,
				dbObject.deviceKnowledge
			]
		};

		return query;
	}

	public static loadDatabaseObject(budgetId:string, deviceKnowledge:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "payeeRenameConditions",
			query: "SELECT * FROM PayeeRenameConditions WHERE budgetId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?) AND isTombstone = 0",
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
	public static getAllPayeeRenameConditions(budgetId:string, includeTombstonedEntities:boolean = false):IDatabaseQuery {

		if(includeTombstonedEntities) {
			return {
				name: "payeeRenameConditions",
				query: "Select * FROM PayeeRenameConditions WHERE budgetId = ?",
				arguments: [budgetId]
			};
		}
		else {
			return {
				name: "payeeRenameConditions",
				query: "Select * FROM PayeeRenameConditions WHERE budgetId = ? AND isTombstone = 0",
				arguments: [budgetId]
			};
		}
	}
}