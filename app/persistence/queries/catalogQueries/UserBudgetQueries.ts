/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class UserBudgetQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static insertDatabaseObject(dbObject:ynab.interfaces.catalogEntities.IDatabaseUserBudget):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                query: "REPLACE INTO UserBudgets (entityId, userId, budgetId, permissions, isTombstone, deviceKnowledge) VALUES (?,?,?,?,?,?)",
                arguments: [
                    dbObject.entityId,
                    dbObject.userId,
                    dbObject.budgetId,
                    dbObject.permissions,
                    dbObject.isTombstone,
                    dbObject.deviceKnowledge
                ]
            };

            return query;
        }

        public static loadDatabaseObject(deviceKnowledge:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "ce_user_budgets",
                query: "SELECT * FROM UserBudgets WHERE deviceKnowledge = 0 OR deviceKnowledge > ?",
                arguments: [
                    deviceKnowledge
                ]
            };

            return query;
        }

        // *********************************************************************************************************
        // Queries for reading data from the database
        // *********************************************************************************************************
        public static findUserBudgetByUserIdAndBudgetVersionId(userId:string, budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "userBudgets",
                query: "SELECT * FROM UserBudgets WHERE userId = ? AND budgetId = (SELECT budgetId FROM BudgetVersions WHERE entityId = ?)",
                arguments: [userId, budgetVersionId]
            }
        }
    }
}