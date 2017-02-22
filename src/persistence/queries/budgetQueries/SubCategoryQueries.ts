/// <reference path='../../../_includes.ts' />

import { InternalCategories } from '../../../constants';
import { IDatabaseQuery } from '../../../interfaces/persistence';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export class SubCategoryQueries {

	// *********************************************************************************************************
	// Queries for inserting data into the database
	// *********************************************************************************************************
	public static insertDatabaseObject(dbObject:budgetEntities.ISubCategory):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "subCategories",
			query: `REPLACE INTO SubCategories (
						budgetId, 
						entityId, 
						isTombstone, 
						masterCategoryId, 
						accountId, 
						internalName, 
						sortableIndex, 
						pinnedIndex, 
						name, 
						type, 
						note, 
						isHidden, 
						goalType, 
						goalCreationMonth, 
						targetBalance, 
						targetBalanceMonth, 
						monthlyFunding, 
						deviceKnowledge
					) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
			arguments: [
				dbObject.budgetId,
				dbObject.entityId,
				dbObject.isTombstone,
				dbObject.masterCategoryId,
				dbObject.accountId ? dbObject.accountId : null,
				dbObject.internalName ? dbObject.internalName : null,
				dbObject.sortableIndex,
				dbObject.pinnedIndex ? dbObject.pinnedIndex : null,
				dbObject.name,
				dbObject.type ? dbObject.type : null,
				dbObject.note ? dbObject.note : null,
				dbObject.isHidden,
				dbObject.goalType ? dbObject.goalType : null,
				dbObject.goalCreationMonth ? dbObject.goalCreationMonth : null,
				dbObject.targetBalance ? dbObject.targetBalance : null,
				dbObject.targetBalanceMonth ? dbObject.targetBalanceMonth : null,
				dbObject.monthlyFunding ? dbObject.monthlyFunding : null,
				dbObject.deviceKnowledge
			]
		};

		return query;
	}

	public static loadDatabaseObject(budgetId:string, deviceKnowledge:number):IDatabaseQuery {

		var query:IDatabaseQuery = {

			name: "subCategories",
			query: "SELECT * FROM SubCategories WHERE budgetId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?)",
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
	public static getAllSubCategories(budgetId:string, includeTombstonedEntities:boolean = false):IDatabaseQuery {

		if(includeTombstonedEntities) {
			return {
				name: "subCategories",
				query: "Select * FROM SubCategories WHERE budgetId = ?",
				arguments: [budgetId]
			};
		}
		else {
			return {
				name: "subCategories",
				query: `Select * FROM SubCategories WHERE budgetId = ? AND isTombstone = 0 AND masterCategoryId NOT IN (SELECT entityId FROM MasterCategories WHERE isTombstone = 1)`,
				arguments: [budgetId]
			};
		}
	}

	public static findSubCategoryByEntityId(budgetId:string, entityId:string):IDatabaseQuery {

		return {
			name: "subCategories",
			query: "Select * FROM SubCategories WHERE budgetId = ? AND entityId = ?",
			arguments: [budgetId, entityId]
		};
	}

	public static findSubCategoryByName(budgetId:string, masterCategoryName:string, subCategoryName:string):IDatabaseQuery {

		return {
			name: "subCategories",
			query: "Select * FROM SubCategories WHERE budgetId = ? AND name = ? AND masterCategoryId = (SELECT entityId FROM MasterCategories WHERE budgetId = ? AND name = ?)",
			arguments: [budgetId, subCategoryName, budgetId, masterCategoryName]
		};
	}

	public static getInternalSubCategories(budgetId:string):IDatabaseQuery {

		return {
			name: "subCategories",
			query: "Select * FROM SubCategories WHERE budgetId = ? AND internalName IS NOT NULL",
			arguments: [budgetId]
		};
	}

	public static getImmediateIncomeSubCategory(budgetId:string):IDatabaseQuery {

		return {
			name: "subCategories",
			query: "Select * FROM SubCategories WHERE budgetId = ? AND internalName = ?",
			arguments: [budgetId, InternalCategories.ImmediateIncomeSubCategory]
		};
	}
}