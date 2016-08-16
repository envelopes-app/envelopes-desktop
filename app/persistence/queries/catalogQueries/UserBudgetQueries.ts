/// <reference path='../../../_includes.ts' />

import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as catalogEntities from '../../../interfaces/catalogEntities';

export class UserBudgetQueries {

	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:catalogEntities.IUserBudget):IDatabaseQuery {

		var query:IDatabaseQuery = {

			query: "REPLACE INTO UserBudgets (entityId, userId, budgetId, isTombstone, deviceKnowledge) VALUES (?,?,?,?,?)",
			arguments: [
				dbObject.entityId,
				dbObject.userId,
				dbObject.budgetId,
				dbObject.isTombstone,
				dbObject.deviceKnowledge
			]
		};

		return query;
	}

	public static loadDatabaseObject(deviceKnowledge:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "userBudgets",
			query: "SELECT * FROM UserBudgets WHERE deviceKnowledge = 0 OR deviceKnowledge > ?",
			arguments: [
				deviceKnowledge
			]
		};

		return query;
	}

	// *********************************************************************************************************
	// Queries for reading data from the database
	// *********************************************************************************************************
	public static findUserBudgetByUserIdAndBudgetId(userId:string, budgetId:string):IDatabaseQuery {

		return {
			name: "userBudgets",
			query: "SELECT * FROM UserBudgets WHERE userId = ? AND budgetId = ?",
			arguments: [userId, budgetId]
		}
	}
}