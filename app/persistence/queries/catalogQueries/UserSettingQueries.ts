/// <reference path='../../../_includes.ts' />

import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as catalogEntities from '../../../interfaces/catalogEntities';

export class UserSettingQueries {

	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:catalogEntities.IUserSetting):IDatabaseQuery {

		var query:IDatabaseQuery = {

			query: "REPLACE INTO UserSettings (entityId, userId, settingName, settingValue, deviceKnowledge) VALUES (?,?,?,?,?)",
			arguments: [
				dbObject.entityId,
				dbObject.userId,
				dbObject.settingName,
				dbObject.settingValue,
				dbObject.deviceKnowledge
			]
		};

		return query;
	}

	public static loadDatabaseObject(deviceKnowledge:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "ce_user_settings",
			query: "SELECT * FROM UserSettings WHERE deviceKnowledge = 0 OR deviceKnowledge > ?",
			arguments: [
				deviceKnowledge
			]
		};

		return query;
	}

	// *********************************************************************************************************
	// Queries for reading data from the database
	// *********************************************************************************************************
	public static findSettingByName(userId:string, settingName:string):IDatabaseQuery {

		return {
			name: "userSettings",
			query: "Select * FROM UserSettings WHERE userId = ? AND settingName = ?",
			arguments: [userId, settingName]
		};
	}
}