/// <reference path='../../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class CommonQueries {

        private static entityTypeToTableMapping:ynab.utilities.SimpleObjectMap<string>;

        private static getTableNameForEntityType(entityType:string):string {

            if(!CommonQueries.entityTypeToTableMapping) {

                var entityTypeToTableMapping = new ynab.utilities.SimpleObjectMap<string>();
                entityTypeToTableMapping[ynab.constants.CatalogEntityType.Budget] = "Budgets";
                entityTypeToTableMapping[ynab.constants.CatalogEntityType.BudgetVersion] = "BudgetVersions";
                entityTypeToTableMapping[ynab.constants.CatalogEntityType.User] = "Users";
                entityTypeToTableMapping[ynab.constants.CatalogEntityType.UserBudget] = "UserBudgets";
                entityTypeToTableMapping[ynab.constants.CatalogEntityType.UserSetting] = "UserSettings";

                entityTypeToTableMapping[ynab.constants.BudgetEntityType.Account] = "Accounts";
                entityTypeToTableMapping[ynab.constants.BudgetEntityType.AccountMapping] = "AccountMappings";
                entityTypeToTableMapping[ynab.constants.BudgetEntityType.MasterCategory] = "MasterCategories";
                entityTypeToTableMapping[ynab.constants.BudgetEntityType.MonthlyBudget] = "MonthlyBudgets";
                entityTypeToTableMapping[ynab.constants.BudgetEntityType.MonthlySubCategoryBudget] = "MonthlySubCategoryBudgets";
                entityTypeToTableMapping[ynab.constants.BudgetEntityType.Payee] = "Payees";
                entityTypeToTableMapping[ynab.constants.BudgetEntityType.PayeeLocation] = "PayeeLocations";
                entityTypeToTableMapping[ynab.constants.BudgetEntityType.PayeeRenameCondition] = "PayeeRenameConditions";
                entityTypeToTableMapping[ynab.constants.BudgetEntityType.ScheduledSubTransaction] = "ScheduledSubTransactions";
                entityTypeToTableMapping[ynab.constants.BudgetEntityType.ScheduledTransaction] = "ScheduledTransactions";
                entityTypeToTableMapping[ynab.constants.BudgetEntityType.Setting] = "Settings";
                entityTypeToTableMapping[ynab.constants.BudgetEntityType.SubCategory] = "SubCategories";
                entityTypeToTableMapping[ynab.constants.BudgetEntityType.SubTransaction] = "SubTransactions";
                entityTypeToTableMapping[ynab.constants.BudgetEntityType.Transaction] = "Transactions";
                CommonQueries.entityTypeToTableMapping = entityTypeToTableMapping;
            }

            return CommonQueries.entityTypeToTableMapping[entityType];
        }

        public static getUpdatedDatabaseObjects(entityType:string, budgetVersionId:string, baseDeviceKnowledge:number = 0):ynab.interfaces.adapters.IDatabaseQuery {

            var tableName = CommonQueries.getTableNameForEntityType(entityType);
            if(!tableName)
                throw new Error("Unknown EntityType.")

            var queryName = _.camelCase(tableName);

            if(baseDeviceKnowledge == 0) {

                return {
                    name: queryName,
                    query: `Select * FROM ${tableName} WHERE budgetVersionId = ?`,
                    arguments: [budgetVersionId]
                };
            }
            else {

                return {
                    name: queryName,
                    query: `Select * FROM ${tableName} WHERE budgetVersionId = ? AND deviceKnowledge > ?`,
                    arguments: [budgetVersionId, baseDeviceKnowledge]
                };
            }
        }

        public static findEntitiesForServerBudgetObjects(entityType:string, budgetVersionId:string, entities:Array<ynab.interfaces.budgetEntities.IYNABServerBudgetEntity>, queryName:string):Array<ynab.interfaces.adapters.IDatabaseQuery> {

            // Extract the ids from the entities and pass them to the findEntitiesByEntityId method
            var entityIds = _.map(entities, (entity) => entity.id);
            return CommonQueries.findBudgetEntitiesByEntityId(entityType, budgetVersionId, entityIds, queryName);
        }

        public static findEntitiesForDatabaseCatalogObjects(entityType:string, entities:Array<ynab.interfaces.common.IYNABDatabaseEntity>, queryName:string):Array<ynab.interfaces.adapters.IDatabaseQuery> {

            // Extract the ids from the entities and pass them to the findEntitiesByEntityId method
            var entityIds = _.map(entities, (entity) => entity.entityId);
            return CommonQueries.findCatalogEntitiesByEntityId(entityType, entityIds, queryName);
        }

        public static findEntitiesForDatabaseBudgetObjects(entityType:string, budgetVersionId:string, entities:Array<ynab.interfaces.common.IYNABDatabaseEntity>, queryName:string):Array<ynab.interfaces.adapters.IDatabaseQuery> {

            // Extract the ids from the entities and pass them to the findEntitiesByEntityId method
            var entityIds = _.map(entities, (entity) => entity.entityId);
            return CommonQueries.findBudgetEntitiesByEntityId(entityType, budgetVersionId, entityIds, queryName);
        }

        public static findCatalogEntitiesByEntityId(entityType:string, entityIds:Array<string>, queryName:string):Array<ynab.interfaces.adapters.IDatabaseQuery> {

            // The number of entities may be large and so we cannot just create one query to load them all
            // because there is a limit on the number of parameters we can pass to the query. So we are going to
            // split these up into multiple queries. The result of all the split up queries would be returned in the
            // same object in the result, so the consumer would be unaware of what we do here.
            var queriesList:Array<ynab.interfaces.adapters.IDatabaseQuery> = [];
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

        public static findBudgetEntitiesByEntityId(entityType:string, budgetVersionId:string, entityIds:Array<string>, queryName:string):Array<ynab.interfaces.adapters.IDatabaseQuery> {

            // The number of entities may be large and so we cannot just create one query to load them all
            // because there is a limit on the number of parameters we can pass to the query. So we are going to
            // split these up into multiple queries. The result of all the split up queries would be returned in the
            // same object in the result, so the consumer would be unaware of what we do here.
            var queriesList:Array<ynab.interfaces.adapters.IDatabaseQuery> = [];
            var tableName = CommonQueries.getTableNameForEntityType(entityType);

            if(!tableName)
                throw new Error("Unknown EntityType.")

            for(var i = 0, j = entityIds.length; i < j; i += 50) {

                var tempArray = entityIds.slice(i, i + 50);

                var questionMarksStr = "";
                _.forEach(tempArray, function (entityId) {
                    questionMarksStr += (questionMarksStr == "" ? "" : ", ") + "?";
                });
                var argumentsArray = [budgetVersionId].concat(tempArray);

                var query = {
                    name: queryName,
                    query: `Select * FROM ${tableName} WHERE budgetVersionId = ? AND entityId IN (${questionMarksStr})`,
                    arguments: argumentsArray
                };

                queriesList.push(query);
            }

            return queriesList;
        }
        
        public static fetchReferenceIdsForCalculations(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {
            
            return {
                name: "referenceIds",
                query: `
SELECT splitSubCategoryId, uncategorizedSubCategoryId, immediateIncomeSubCategoryId, deferredIncomeSubCategoryId, startingBalancePayeeId
FROM
	(SELECT entityId as splitSubCategoryId FROM SubCategories WHERE budgetVersionId = ?1 AND internalName = '${ynab.constants.InternalCategories.SplitSubCategory}'),
	(SELECT entityId as uncategorizedSubCategoryId FROM SubCategories WHERE budgetVersionId = ?1 AND internalName = '${ynab.constants.InternalCategories.UncategorizedSubCategory}'),
    (SELECT entityId as immediateIncomeSubCategoryId FROM SubCategories WHERE budgetVersionId = ?1 AND internalName = '${ynab.constants.InternalCategories.ImmediateIncomeSubCategory}'),
    (SELECT entityId as deferredIncomeSubCategoryId FROM SubCategories WHERE budgetVersionId = ?1 AND internalName = '${ynab.constants.InternalCategories.DeferredIncomeSubCategory}'),
    (SELECT entityId as startingBalancePayeeId FROM Payees WHERE budgetVersionId = ?1 AND internalName = '${ynab.constants.InternalPayees.StartingBalance}')
                `,
                arguments: [budgetVersionId]
            };
        }  
    }
}