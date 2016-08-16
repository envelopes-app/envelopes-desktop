/// <reference path='../../../_includes.ts' />

import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as catalogEntities from '../../../interfaces/catalogEntities';

export class UserQueries {

	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:catalogEntities.IUser):IDatabaseQuery {

		var query:IDatabaseQuery = {

			query: "REPLACE INTO Users (entityId, userName, email, deviceKnowledge) VALUES (?,?,?,?)",
			arguments: [
				dbObject.entityId,
				dbObject.userName,
				dbObject.email,
				dbObject.deviceKnowledge
			]
		};

		return query;
	}

	public static loadDatabaseObject(deviceKnowledge:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "users",
			query: "SELECT * FROM Users WHERE deviceKnowledge = 0 OR deviceKnowledge > ?",
			arguments: [
				deviceKnowledge
			]
		};

		return query;
	}

	// *********************************************************************************************************
	// Queries for reading data from the database
	// *********************************************************************************************************
	public static findUserForEmail(userEmail:string):IDatabaseQuery {

		return {
			name: "users",
			query: "SELECT * FROM Users WHERE email=?1",
			arguments: [userEmail]
		}
	}

	public static findUserForId(userId:string):IDatabaseQuery {

		return {
			name: "users",
			query: "SELECT * FROM Users WHERE entityId=?1",
			arguments: [userId]
		}
	}
}