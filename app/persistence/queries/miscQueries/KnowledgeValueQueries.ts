/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class KnowledgeValueQueries {

        public static getLoadCatalogKnowledgeValueQuery(userId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "catalogKnowledge",
                query: "SELECT currentDeviceKnowledge, serverKnowledgeOfDevice, deviceKnowledgeOfServer FROM UserKnowledge WHERE userId = ?",
                arguments: [userId]
            };
        }

        public static getSaveCatalogKnowledgeValueQuery(userId:string, catalogKnowledge:ynab.adapters.CatalogKnowledge):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                query: "REPLACE INTO UserKnowledge (userId, currentDeviceKnowledge, serverKnowledgeOfDevice, deviceKnowledgeOfServer) VALUES (?,?,?,?)",
                arguments: [userId, catalogKnowledge.currentDeviceKnowledge, catalogKnowledge.serverKnowledgeOfDevice, catalogKnowledge.deviceKnowledgeOfServer]
            };
        }

        public static getLoadBudgetKnowledgeValueQuery(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "budgetKnowledge",
                query: `SELECT currentDeviceKnowledge, 
                            currentDeviceKnowledgeForCalculations, 
                            serverKnowledgeOfDevice, 
                            deviceKnowledgeOfServer, 
                            queueCalculationsForServerEntities 
                        FROM BudgetVersionKnowledge WHERE budgetVersionId = ?`,
                arguments: [budgetVersionId]
            };
        }

        public static getSaveBudgetKnowledgeValueQuery(budgetVersionId:string, budgetKnowledge:ynab.adapters.BudgetKnowledge):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                query: `REPLACE INTO BudgetVersionKnowledge (
                            budgetVersionId,
                            currentDeviceKnowledge, 
                            currentDeviceKnowledgeForCalculations, 
                            serverKnowledgeOfDevice, 
                            deviceKnowledgeOfServer, 
                            queueCalculationsForServerEntities
                        ) 
                        VALUES (?,?,?,?,?,?)`,
                arguments: [
                    budgetVersionId,
                    budgetKnowledge.currentDeviceKnowledge,
                    budgetKnowledge.currentDeviceKnowledgeForCalculations,
                    budgetKnowledge.serverKnowledgeOfDevice,
                    budgetKnowledge.deviceKnowledgeOfServer,
                    budgetKnowledge.queueCalculationsForServerEntities
                ]
            };
        }

        public static getMaxDeviceKnowledgeFromBudgetEntities(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "budgetKnowledgeFromEntities",
                query: `SELECT MAX(deviceKnowledge) as deviceKnowledge FROM (
                    SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM Accounts WHERE budgetVersionId = ?1 UNION ALL
                    SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM AccountMonthlyCalculations WHERE budgetVersionId = ?1 UNION ALL
                    SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM AccountMappings WHERE budgetVersionId = ?1 UNION ALL
                    SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM MasterCategories WHERE budgetVersionId = ?1 UNION ALL
                    SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM MonthlyBudgets WHERE budgetVersionId = ?1 UNION ALL
                    SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM MonthlySubCategoryBudgets WHERE budgetVersionId = ?1 UNION ALL
                    SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM Payees WHERE budgetVersionId = ?1 UNION ALL
                    SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM PayeeLocations WHERE budgetVersionId = ?1 UNION ALL
                    SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM PayeeRenameConditions WHERE budgetVersionId = ?1 UNION ALL
                    SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM ScheduledSubTransactions WHERE budgetVersionId = ?1 UNION ALL
                    SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM ScheduledTransactions WHERE budgetVersionId = ?1 UNION ALL
                    SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM Settings WHERE budgetVersionId = ?1 UNION ALL
                    SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM SubCategories WHERE budgetVersionId = ?1 UNION ALL
                    SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM SubTransactions WHERE budgetVersionId = ?1 UNION ALL
                    SELECT COALESCE(MAX(deviceKnowledge), 0) as deviceKnowledge FROM Transactions WHERE budgetVersionId = ?1
                )`,
                arguments: [budgetVersionId]
            }
        }
    }
}