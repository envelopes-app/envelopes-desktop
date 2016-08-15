/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class BudgetQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static insertDatabaseObject(dbObject:ynab.interfaces.catalogEntities.IDatabaseBudget):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                query: "REPLACE INTO Budgets (entityId, budgetName, isTombstone, deviceKnowledge) VALUES (?,?,?,?)",
                arguments: [
                    dbObject.entityId,
                    dbObject.budgetName,
                    dbObject.isTombstone,
                    dbObject.deviceKnowledge
                ]
            };

            return query;
        }

        public static loadDatabaseObject(deviceKnowledge:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "ce_budgets",
                query: "SELECT * FROM Budgets WHERE deviceKnowledge = 0 OR deviceKnowledge > ?",
                arguments: [
                    deviceKnowledge
                ]
            };

            return query;
        }

        // *********************************************************************************************************
        // Queries for reading data from the database
        // *********************************************************************************************************
        public static findBudgetByBudgetVersionId(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "budgets",
                query: "SELECT * FROM Budgets WHERE entityId = (SELECT budgetId FROM BudgetVersions WHERE entityId = ?)",
                arguments: [budgetVersionId]
            }
        }
     }
}