/// <reference path='../../../_includes.ts' />

import * as _ from 'lodash';
import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export class MasterCategoryQueries {

	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:budgetEntities.IMasterCategory):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "masterCategories",
			query: "REPLACE INTO MasterCategories (budgetId, entityId, isTombstone, internalName, deletable, sortableIndex, name, note, isHidden, deviceKnowledge) VALUES (?,?,?,?,?,?,?,?,?,?)",
			arguments: [
				dbObject.budgetId,
				dbObject.entityId,
				dbObject.isTombstone,
				dbObject.internalName ? dbObject.internalName : null,
				dbObject.deletable,
				dbObject.sortableIndex,
				dbObject.name,
				dbObject.note ? dbObject.note : null,
				dbObject.isHidden,
				dbObject.deviceKnowledge
			]
		};

		return query;
	}

	public static loadDatabaseObject(budgetId:string, deviceKnowledge:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "masterCategories",
			query: "SELECT * FROM MasterCategories WHERE budgetId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?)",
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
	public static getAllMasterCategories(budgetId:string, includeTombstonedEntities:boolean = false):IDatabaseQuery {

		if(includeTombstonedEntities) {
			return {
				name: "masterCategories",
				query: "Select * FROM MasterCategories WHERE budgetId = ?",
				arguments: [budgetId]
			};
		}else {
			return {
				name: "masterCategories",
				query: "Select * FROM MasterCategories WHERE budgetId = ? AND isTombstone = 0",
				arguments: [budgetId]
			};
		}
	}

	public static getInternalMasterCategories(budgetId:string):IDatabaseQuery {

		return {
			name: "masterCategories",
			query: "Select * FROM MasterCategories WHERE budgetId = ? AND isTombstone = 0 AND internalName IS NOT NULL",
			arguments: [budgetId]
		};
	}

	public static findMasterCategoryByEntityId(budgetId:string, entityId:string):IDatabaseQuery {

		return {
			name: "masterCategories",
			query: "Select * FROM MasterCategories WHERE budgetId = ? AND entityId = ?",
			arguments: [budgetId, entityId]
		};
	}

	public static findMasterCategoriesByEntityId(budgetId:string, entityIds:Array<string>):Array<IDatabaseQuery> {

		var queriesList:Array<IDatabaseQuery> = [];

		for(var i = 0, j = entityIds.length; i < j; i += 50) {

			var tempArray = entityIds.slice(i, i + 50);

			var questionMarksStr = "";
			_.forEach(tempArray, function (entityId) {
				questionMarksStr += (questionMarksStr == "" ? "" : ", ") + "?";
			});
			var argumentsArray = [budgetId].concat(tempArray);

			var query = {
				name: "masterCategories",
				query: "Select * FROM MasterCategories WHERE budgetId = ? AND entityId IN (" + questionMarksStr + ")",
				arguments: argumentsArray
			};

			queriesList.push(query);
		}

		return queriesList;
	}

	public static findMasterCategoryByName(budgetId:string, masterCategoryName:string):IDatabaseQuery {

		return {
			name: "masterCategories",
			query: "Select * FROM MasterCategories WHERE budgetId = ? AND name = ?",
			arguments: [budgetId, masterCategoryName]
		};
	}
}