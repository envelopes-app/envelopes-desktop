/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class ScheduledSubTransactionQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static insertDatabaseObject(dbObject:ynab.interfaces.budgetEntities.IDatabaseScheduledSubTransaction):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "scheduledSubTransactions",
                query: `REPLACE INTO ScheduledSubTransactions (
                            budgetVersionId, 
                            entityId, 
                            isTombstone, 
                            scheduledTransactionId, 
                            payeeId, 
                            subCategoryId, 
                            amount, 
                            memo, 
                            transferAccountId, 
                            sortableIndex, 
                            deviceKnowledge
                        ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
                arguments: [
                    dbObject.budgetVersionId,
                    dbObject.entityId,
                    dbObject.isTombstone,
                    dbObject.scheduledTransactionId,
                    dbObject.payeeId ? dbObject.payeeId : null,
                    dbObject.subCategoryId ? dbObject.subCategoryId : null,
                    dbObject.amount,
                    dbObject.memo ? dbObject.memo : null,
                    dbObject.transferAccountId ? dbObject.transferAccountId : null,
                    dbObject.sortableIndex,
                    dbObject.deviceKnowledge
                ]
            };

            return query;
        }

        public static loadDatabaseObject(budgetVersionId:string, deviceKnowledge:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "be_scheduled_subtransactions",
                query: "SELECT * FROM ScheduledSubTransactions WHERE budgetVersionId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?) AND isTombstone = 0",
                arguments: [
                    budgetVersionId,
                    deviceKnowledge
                ]
            };

            return query;
        }

        // *********************************************************************************************************
        // Queries for reading data from the database
        // *********************************************************************************************************
        public static getAllScheduledSubTransactions(budgetVersionId:string, includeTombstonedEntities:boolean = false):ynab.interfaces.adapters.IDatabaseQuery {

            if(includeTombstonedEntities) {
                return {
                    name: "scheduledSubTransactions",
                    query: "Select * FROM ScheduledSubTransactions WHERE budgetVersionId = ?",
                    arguments: [budgetVersionId]
                };
            }
            else {
                return {
                    name: "scheduledSubTransactions",
                    query: "Select * FROM ScheduledSubTransactions WHERE budgetVersionId = ? AND isTombstone = 0",
                    arguments: [budgetVersionId]
                };
            }
        }

        public static findScheduledSubTransactionByEntityId(budgetVersionId:string, entityId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "scheduledSubTransactions",
                query: "Select * FROM ScheduledSubTransactions WHERE budgetVersionId = ? AND entityId = ?",
                arguments: [budgetVersionId, entityId]
            };
        }

        public static findScheduledSubTransactionsByParentEntityId(budgetVersionId:string, parentEntityId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "scheduledSubTransactions",
                query: "Select * FROM ScheduledSubTransactions WHERE budgetVersionId = ? AND scheduledTransactionId = ? AND isTombstone = 0",
                arguments: [budgetVersionId, parentEntityId]
            };
        }
    }
}