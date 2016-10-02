/// <reference path='../../../_includes.ts' />

import * as _ from 'lodash';

import { IDatabaseQuery } from '../../../interfaces/persistence';
import { SimpleObjectMap } from '../../../utilities';
import { BudgetEntityType, CatalogEntityType, InternalCategories, InternalPayees } from '../../../constants';

export class CommonQueries {

	private static entityTypeToTableMapping:SimpleObjectMap<string>;

	private static getTableNameForEntityType(entityType:string):string {

		if(!CommonQueries.entityTypeToTableMapping) {

			var entityTypeToTableMapping = new SimpleObjectMap<string>();
			entityTypeToTableMapping[CatalogEntityType.Budget] = "Budgets";
			entityTypeToTableMapping[CatalogEntityType.User] = "Users";
			entityTypeToTableMapping[CatalogEntityType.UserBudget] = "UserBudgets";
			entityTypeToTableMapping[CatalogEntityType.UserSetting] = "UserSettings";

			entityTypeToTableMapping[BudgetEntityType.Account] = "Accounts";
			entityTypeToTableMapping[BudgetEntityType.AccountMapping] = "AccountMappings";
			entityTypeToTableMapping[BudgetEntityType.MasterCategory] = "MasterCategories";
			entityTypeToTableMapping[BudgetEntityType.MonthlyBudget] = "MonthlyBudgets";
			entityTypeToTableMapping[BudgetEntityType.MonthlySubCategoryBudget] = "MonthlySubCategoryBudgets";
			entityTypeToTableMapping[BudgetEntityType.Payee] = "Payees";
			entityTypeToTableMapping[BudgetEntityType.PayeeLocation] = "PayeeLocations";
			entityTypeToTableMapping[BudgetEntityType.PayeeRenameCondition] = "PayeeRenameConditions";
			entityTypeToTableMapping[BudgetEntityType.ScheduledSubTransaction] = "ScheduledSubTransactions";
			entityTypeToTableMapping[BudgetEntityType.ScheduledTransaction] = "ScheduledTransactions";
			entityTypeToTableMapping[BudgetEntityType.Setting] = "Settings";
			entityTypeToTableMapping[BudgetEntityType.SubCategory] = "SubCategories";
			entityTypeToTableMapping[BudgetEntityType.SubTransaction] = "SubTransactions";
			entityTypeToTableMapping[BudgetEntityType.Transaction] = "Transactions";
			CommonQueries.entityTypeToTableMapping = entityTypeToTableMapping;
		}

		return CommonQueries.entityTypeToTableMapping[entityType];
	}

	public static getUpdatedDatabaseObjects(entityType:string, budgetId:string, baseDeviceKnowledge:number = 0):IDatabaseQuery {

		var tableName = CommonQueries.getTableNameForEntityType(entityType);
		if(!tableName)
			throw new Error("Unknown EntityType.")

		var queryName = _.camelCase(tableName);

		if(baseDeviceKnowledge == 0) {

			return {
				name: queryName,
				query: `Select * FROM ${tableName} WHERE budgetId = ?`,
				arguments: [budgetId]
			};
		}
		else {

			return {
				name: queryName,
				query: `Select * FROM ${tableName} WHERE budgetId = ? AND deviceKnowledge > ?`,
				arguments: [budgetId, baseDeviceKnowledge]
			};
		}
	}

	public static findCatalogEntitiesByEntityId(entityType:string, entityIds:Array<string>, queryName:string):Array<IDatabaseQuery> {

		// The number of entities may be large and so we cannot just create one query to load them all
		// because there is a limit on the number of parameters we can pass to the query. So we are going to
		// split these up into multiple queries. The result of all the split up queries would be returned in the
		// same object in the result, so the consumer would be unaware of what we do here.
		var queriesList:Array<IDatabaseQuery> = [];
		var tableName = CommonQueries.getTableNameForEntityType(entityType);

		if(!tableName)
			throw new Error("Unknown EntityType.")

		for(var i = 0, j = entityIds.length; i < j; i += 50) {

			var tempArray = entityIds.slice(i, i + 50);

			var questionMarksStr = "";
			_.forEach(tempArray, function (entityId) {
				questionMarksStr += (questionMarksStr == "" ? "" : ", ") + "?";
			});

			var query = {
				name: queryName,
				query: `Select * FROM ${tableName} WHERE entityId IN (${questionMarksStr})`,
				arguments: tempArray
			};

			queriesList.push(query);
		}

		return queriesList;
	}

	public static findBudgetEntitiesByEntityId(entityType:string, budgetId:string, entityIds:Array<string>, queryName:string):Array<IDatabaseQuery> {

		// The number of entities may be large and so we cannot just create one query to load them all
		// because there is a limit on the number of parameters we can pass to the query. So we are going to
		// split these up into multiple queries. The result of all the split up queries would be returned in the
		// same object in the result, so the consumer would be unaware of what we do here.
		var queriesList:Array<IDatabaseQuery> = [];
		var tableName = CommonQueries.getTableNameForEntityType(entityType);

		if(!tableName)
			throw new Error("Unknown EntityType.")

		for(var i = 0, j = entityIds.length; i < j; i += 50) {

			var tempArray = entityIds.slice(i, i + 50);

			var questionMarksStr = "";
			_.forEach(tempArray, function (entityId) {
				questionMarksStr += (questionMarksStr == "" ? "" : ", ") + "?";
			});
			var argumentsArray = [budgetId].concat(tempArray);

			var query = {
				name: queryName,
				query: `Select * FROM ${tableName} WHERE budgetId = ? AND entityId IN (${questionMarksStr})`,
				arguments: argumentsArray
			};

			queriesList.push(query);
		}

		return queriesList;
	}
	
	public static fetchReferenceIdsForCalculations(budgetId:string):IDatabaseQuery {
		
		return {
			name: "referenceIds",
			query: `
SELECT splitSubCategoryId, uncategorizedSubCategoryId, immediateIncomeSubCategoryId, startingBalancePayeeId FROM
(SELECT entityId as splitSubCategoryId FROM SubCategories WHERE budgetId = ?1 AND internalName = '${InternalCategories.SplitSubCategory}'),
(SELECT entityId as uncategorizedSubCategoryId FROM SubCategories WHERE budgetId = ?1 AND internalName = '${InternalCategories.UncategorizedSubCategory}'),
(SELECT entityId as immediateIncomeSubCategoryId FROM SubCategories WHERE budgetId = ?1 AND internalName = '${InternalCategories.ImmediateIncomeSubCategory}'),
(SELECT entityId as startingBalancePayeeId FROM Payees WHERE budgetId = ?1 AND internalName = '${InternalPayees.StartingBalance}')
			`,
			arguments: [budgetId]
		};
	}  
}