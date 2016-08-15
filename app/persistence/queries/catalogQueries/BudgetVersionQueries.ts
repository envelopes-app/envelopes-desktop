/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class BudgetVersionQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static insertDatabaseObject(dbObject:ynab.interfaces.catalogEntities.IDatabaseBudgetVersion):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                query: "REPLACE INTO BudgetVersions (entityId, budgetId, versionName, dateFormat, currencyFormat, lastAccessedOn, source, isTombstone, deviceKnowledge) VALUES (?,?,?,?,?,?,?,?,?)",
                arguments: [
                    dbObject.entityId,
                    dbObject.budgetId,
                    dbObject.versionName,
                    dbObject.dateFormat,
                    dbObject.currencyFormat,
                    dbObject.lastAccessedOn,
                    dbObject.source,
                    dbObject.isTombstone,
                    dbObject.deviceKnowledge
                ]
            };

            return query;
        }

        public static loadDatabaseObject(deviceKnowledge:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "ce_budget_versions",
                query: "SELECT * FROM BudgetVersions WHERE deviceKnowledge = 0 OR deviceKnowledge > ?",
                arguments: [
                    deviceKnowledge
                ]
            };

            return query;
        }

        // *********************************************************************************************************
        // Queries for reading data from the database
        // *********************************************************************************************************
        public static findBudgetVersionByEntityId(entityId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "budgetVersions",
                query: "SELECT * FROM BudgetVersions WHERE entityId = ?",
                arguments: [entityId]
            }
        }

        public static findBudgetVersionByName(name:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "budgetVersions",
                query: "SELECT * FROM BudgetVersions WHERE versionName = ?",
                arguments: [name]
            }
        }
    }
}