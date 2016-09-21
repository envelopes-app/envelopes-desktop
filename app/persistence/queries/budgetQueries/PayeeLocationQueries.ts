/// <reference path='../../../_includes.ts' />

import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export class PayeeLocationQueries {

	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:budgetEntities.IPayeeLocation):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "payeeLocations",
			query: `REPLACE INTO PayeeLocations (
						budgetId, 
						entityId, 
						isTombstone, 
						payeeId, 
						latitude, 
						longitude, 
						deviceKnowledge
					) VALUES (?,?,?,?,?,?,?)`,
			arguments: [
				dbObject.budgetId,
				dbObject.entityId,
				dbObject.isTombstone,
				dbObject.payeeId,
				dbObject.latitude,
				dbObject.longitude,
				dbObject.deviceKnowledge
			]
		};

		return query;
	}

	public static loadDatabaseObject(budgetId:string, deviceKnowledge:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "payeeLocations",
			query: "SELECT * FROM PayeeLocations WHERE budgetId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?)",
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
	public static getAllPayeeLocations(budgetId:string, includeTombstonedEntities:boolean = false):IDatabaseQuery {

		if(includeTombstonedEntities) {
			return {
				name: "payeeLocations",
				query: "Select * FROM PayeeLocations WHERE budgetId = ?",
				arguments: [budgetId]
			};
		}
		else {
			return {
				name: "payeeLocations",
				query: "Select * FROM PayeeLocations WHERE budgetId = ? AND isTombstone = 0",
				arguments: [budgetId]
			};
		}
	}

	public static findPayeeLocationsByPayeeEntityId(budgetId:string, payeeEntityId:string):IDatabaseQuery {

		return {
			name: "payeeLocations",
			query: "Select * FROM PayeeLocations WHERE budgetId = ? AND payeeId = ?",
			arguments: [budgetId, payeeEntityId]
		};
	}
}
