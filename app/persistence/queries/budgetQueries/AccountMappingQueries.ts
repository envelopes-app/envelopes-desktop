/// <reference path='../../../_includes.ts' />

import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export class AccountMappingQueries {

	public static insertDatabaseObject(dbObject:budgetEntities.IAccountMapping):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "accountMappings",
			query: `REPLACE INTO AccountMappings (
				budgetId, 
				entityId, 
				isTombstone, 
				accountId, 
				fid, 
				shortenedAccountId, 
				hash, 
				salt, 
				dateSequence, 
				shouldFlipPayeesMemos, 
				shouldImportMemos, 
				skipImport, 
				deviceKnowledge
			) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
			arguments: [
				dbObject.budgetId,
				dbObject.entityId,
				dbObject.isTombstone ? 1 : 0,
				dbObject.accountId,
				dbObject.fid ? dbObject.fid : null,
				dbObject.shortenedAccountId ? dbObject.shortenedAccountId : null,
				dbObject.hash ? dbObject.hash : null,
				dbObject.salt ? dbObject.salt : null,
				dbObject.dateSequence ? dbObject.dateSequence : null,
				dbObject.shouldFlipPayeesMemos,
				dbObject.shouldImportMemos,
				dbObject.skipImport,
				dbObject.deviceKnowledge
			]
		};

		return query;
	}

	public static loadDatabaseObject(budgetId:string, deviceKnowledge:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "accountMappings",
			query: "SELECT * FROM AccountMappings WHERE budgetId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?)",
			arguments: [
				budgetId,
				deviceKnowledge
			]
		};

		return query;
	}

	public static getAllAccountMappings(budgetId:string, includeTombstonedEntities:boolean = false):IDatabaseQuery {

		if(includeTombstonedEntities) {
			return {
				name: "accountMappings",
				query: "Select * FROM AccountMappings WHERE budgetId = ?",
				arguments: [budgetId]
			};
		}
		else {
			return {
				name: "accountMappings",
				query: "Select * FROM AccountMappings WHERE budgetId = ? AND isTombstone = 0",
				arguments: [budgetId]
			};
		}
	}
}
