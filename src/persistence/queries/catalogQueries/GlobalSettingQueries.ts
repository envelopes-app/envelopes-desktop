/// <reference path='../../../_includes.ts' />

import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as catalogEntities from '../../../interfaces/catalogEntities';

export class GlobalSettingQueries {

	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:catalogEntities.IGlobalSetting):IDatabaseQuery {

		var query:IDatabaseQuery = {

			query: "REPLACE INTO GlobalSettings (entityId, settingName, settingValue, deviceKnowledge) VALUES (?,?,?,?)",
			arguments: [
				dbObject.entityId,
				dbObject.settingName,
				dbObject.settingValue,
				dbObject.deviceKnowledge
			]
		};

		return query;
	}

	public static loadDatabaseObject(deviceKnowledge:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "globalSettings",
			query: "SELECT * FROM GlobalSettings WHERE deviceKnowledge = 0 OR deviceKnowledge > ?",
			arguments: [
				deviceKnowledge
			]
		};

		return query;
	}

	// *********************************************************************************************************
	// Queries for reading data from the database
	// *********************************************************************************************************
	public static findSettingByName(settingName:string):IDatabaseQuery {

		return {
			name: "globalSettings",
			query: "Select * FROM GlobalSettings WHERE settingName = ?",
			arguments: [settingName]
		};
	}
}