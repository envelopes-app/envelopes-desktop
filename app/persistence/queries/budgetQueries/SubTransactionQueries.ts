/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class SubTransactionQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static insertDatabaseObject(dbObject:ynab.interfaces.budgetEntities.IDatabaseSubTransaction):ynab.interfaces.adapters.IDatabaseQuery {

            // Note: If you update the query here because of change in columns, be sure to modify the insertion
            // queries in the MobileScheduledTransactionCalculations as well.
            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "subTransactions",
                query: `REPLACE INTO SubTransactions (
                            budgetVersionId, 
                            entityId, 
                            isTombstone, 
                            transactionId, 
                            payeeId, 
                            subCategoryId, 
                            amount, 
                            cashAmount, 
                            creditAmount, 
                            subCategoryCreditAmountPreceding, 
                            memo, 
                            checkNumber, 
                            transferAccountId, 
                            transferTransactionId, 
                            sortableIndex, 
                            deviceKnowledge,
                            deviceKnowledgeForCalculatedFields
                        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                arguments: [
                    dbObject.budgetVersionId,
                    dbObject.entityId,
                    dbObject.isTombstone,
                    dbObject.transactionId,
                    dbObject.payeeId ? dbObject.payeeId : null,
                    dbObject.subCategoryId ? dbObject.subCategoryId : null,
                    dbObject.amount,
                    dbObject.cashAmount,
                    dbObject.creditAmount,
                    dbObject.subCategoryCreditAmountPreceding,
                    dbObject.memo ? dbObject.memo : null,
                    dbObject.checkNumber ? dbObject.checkNumber : null,
                    dbObject.transferAccountId ? dbObject.transferAccountId : null,
                    dbObject.transferTransactionId ? dbObject.transferTransactionId : null,
                    dbObject.sortableIndex,
                    dbObject.deviceKnowledge,
                    dbObject.deviceKnowledgeForCalculatedFields
                ]
            };

            return query;
        }

        public static loadDatabaseObject(budgetVersionId:string, deviceKnowledge:number, deviceKnowledgeForCalculations:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "be_subtransactions",
                query: `SELECT * FROM SubTransactions WHERE budgetVersionId = ?1 AND 
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
        public static getAllSubTransactions(budgetVersionId:string, includeTombstonedEntities:boolean = false):ynab.interfaces.adapters.IDatabaseQuery {

            if(includeTombstonedEntities) {
                return {
                    name: "subTransactions",
                    query: "Select * FROM SubTransactions WHERE budgetVersionId = ?",
                    arguments: [budgetVersionId]
                };
            }
            else {
                return {
                    name: "subTransactions",
                    query: "Select * FROM SubTransactions WHERE budgetVersionId = ? AND isTombstone = 0",
                    arguments: [budgetVersionId]
                };
            }
        }

        public static findSubTransactionByEntityId(budgetVersionId:string, entityId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "subTransactions",
                query: "Select * FROM SubTransactions WHERE budgetVersionId = ? AND entityId = ?",
                arguments: [budgetVersionId, entityId]
            };
        }

        public static findSubTransactionsByParentEntityId(budgetVersionId:string, parentEntityId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "subTransactions",
                query: "Select * FROM SubTransactions WHERE budgetVersionId = ? AND transactionId = ?",
                arguments: [budgetVersionId, parentEntityId]
            };
        }

        public static findSubTransactionsForAccountSinceDateOrderedBySortableIndex(budgetVersionId:string, accountId:string, sinceDate:ynab.utilities.DateWithoutTime):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "subTransactions",
                query: `SELECT *
                        FROM SubTransactions ST
                        WHERE ST.budgetVersionId = ?1 AND ST.isTombstone = 0 AND ST.transactionId IN (
                            SELECT entityId
                            FROM Transactions T
                            WHERE T.budgetVersionId = ?1 AND T.accountId = ?2 AND T.date >= ?3 AND T.isTombstone = 0 AND
                                (T.source IS NULL OR T.source IN ('', 'Scheduler', 'Matched', 'Imported'))
                        )
                        ORDER BY ST.sortableIndex`,
                arguments: [budgetVersionId, accountId, sinceDate.getUTCTime()]
            };
        }

        // Returns the transaction database objects, if any, that are the transfer counterparts
        // of the split sub transactions of the specified parent transaction.
        public static findSubTransactionsTransferCounterpartsByParentEntityId(budgetVersionId:string, parentEntityId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "transactions",
                query: `SELECT * FROM Transactions WHERE budgetVersionId = ?1 AND entityId IN
                            (SELECT transferTransactionId FROM SubTransactions WHERE budgetVersionId = ?1 AND transactionId = ?2)`,
                arguments: [budgetVersionId, parentEntityId]
            };
        }
    }
}
