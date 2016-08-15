/// <reference path='../../../_includes.ts' />

import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export class SettingQueries {

	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:budgetEntities.ISetting):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "settings",
			query: `REPLACE INTO Settings (
						budgetId, 
						entityId, 
						settingName, 
						settingValue, 
						deviceKnowledge
					) VALUES (?,?,?,?,?)`,
			arguments: [
				dbObject.budgetId,
				dbObject.entityId,
				dbObject.settingName,
				dbObject.settingValue ? dbObject.settingValue : null,
				dbObject.deviceKnowledge
			]
		};

		return query;
	}

	public static loadDatabaseObject(budgetId:string, deviceKnowledge:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "settings",
			query: "SELECT * FROM Settings WHERE budgetId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?)",
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
	public static getAllSettings(budgetId:string, includeTombstonedEntities:boolean = false):IDatabaseQuery {

		// "includeTombstonedEntities" parameter added to the method just for consistency. Settings do not have a tombstone column.
		return {
			name: "settings",
			query: "Select * FROM Settings WHERE budgetId = ?",
			arguments: [budgetId]
		};
	}

	public static findSettingByName(budgetId:string, settingName:string):IDatabaseQuery {

		return {
			name: "settings",
			query: "Select * FROM Settings WHERE budgetId = ? AND settingName = ?",
			arguments: [budgetId, settingName]
		};
	}
}