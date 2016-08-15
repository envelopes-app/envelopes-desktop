/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class ScheduledTransactionQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static insertDatabaseObject(dbObject:ynab.interfaces.budgetEntities.IDatabaseScheduledTransaction):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "scheduledTransactions",
                query: `REPLACE INTO ScheduledTransactions (
                            budgetVersionId, 
                            entityId, 
                            isTombstone, 
                            accountId, 
                            payeeId, 
                            subCategoryId, 
                            date, 
                            frequency, 
                            amount, 
                            memo, 
                            flag, 
                            transferAccountId, 
                            upcomingInstances, 
                            deviceKnowledge,
                            deviceKnowledgeForCalculatedFields
                        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                arguments: [
                    dbObject.budgetVersionId,
                    dbObject.entityId,
                    dbObject.isTombstone,
                    dbObject.accountId,
                    dbObject.payeeId ? dbObject.payeeId : null,
                    dbObject.subCategoryId ? dbObject.subCategoryId : null,
                    dbObject.date,
                    dbObject.frequency ? dbObject.frequency : null,
                    dbObject.amount,
                    dbObject.memo ? dbObject.memo : null,
                    dbObject.flag ? dbObject.flag : null,
                    dbObject.transferAccountId ? dbObject.transferAccountId : null,
                    dbObject.upcomingInstances ? dbObject.upcomingInstances : null,
                    dbObject.deviceKnowledge,
                    dbObject.deviceKnowledgeForCalculatedFields
                ]
            };

            return query;
        }

        public static loadDatabaseObject(budgetVersionId:string, deviceKnowledge:number, deviceKnowledgeForCalculations:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "be_scheduled_transactions",
                query: `SELECT * FROM ScheduledTransactions WHERE budgetVersionId = ?1 AND 
                            (deviceKnowledge = 0 OR deviceKnowledge > ?2 OR deviceKnowledgeForCalculatedFields = 0 OR
                            deviceKnowledgeForCalculatedFields > ?3) AND isTombstone = 0`,
                arguments: [
                    budgetVersionId,
                    deviceKnowledge,
                    deviceKnowledgeForCalculations
                ]
            };

            return query;
        }

        // *********************************************************************************************************
        // Queries for reading data from the database
        // *********************************************************************************************************
        public static getAllScheduledTransactions(budgetVersionId:string, includeTombstonedEntities:boolean = false):ynab.interfaces.adapters.IDatabaseQuery {

            if(includeTombstonedEntities) {
                return {
                    name: "scheduledTransactions",
                    query: "Select * FROM ScheduledTransactions WHERE budgetVersionId = ?",
                    arguments: [budgetVersionId]
                };
            }
            else {
                return {
                    name: "scheduledTransactions",
                    query: `SELECT * FROM ScheduledTransactions WHERE budgetVersionId = ?1 AND isTombstone = 0 AND accountId IN (
                       SELECT entityId FROM Accounts WHERE budgetVersionId = ?1 AND isTombstone = 0 AND hidden = 0
                    )`,
                    arguments: [budgetVersionId]
                };
            }
        }

        public static findScheduledTransactionByEntityId(budgetVersionId:string, entityId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "scheduledTransactions",
                query: "Select * FROM ScheduledTransactions WHERE budgetVersionId = ? AND entityId = ?",
                arguments: [budgetVersionId, entityId]
            };
        }

        public static findScheduledTransactionsByDate(budgetVersionId:string, date:ynab.utilities.DateWithoutTime):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "scheduledTransactions",
                query: "Select * FROM ScheduledTransactions WHERE budgetVersionId = ? AND date = ?",
                arguments: [budgetVersionId, date.getUTCTime()]
            };
        }
    }
}