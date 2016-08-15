/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class PayeeQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static insertDatabaseObject(dbObject:ynab.interfaces.budgetEntities.IDatabasePayee):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "payees",
                query: `REPLACE INTO Payees (
                            budgetVersionId, 
                            entityId, 
                            isTombstone, 
                            accountId, 
                            enabled, 
                            autoFillSubCategoryId, 
                            autoFillMemo, 
                            autoFillAmount, 
                            name, 
                            internalName, 
                            deviceKnowledge
                        ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
                arguments: [
                    dbObject.budgetVersionId,
                    dbObject.entityId,
                    dbObject.isTombstone,
                    dbObject.accountId ? dbObject.accountId : null,
                    dbObject.enabled,
                    dbObject.autoFillSubCategoryId ? dbObject.autoFillSubCategoryId : null,
                    dbObject.autoFillMemo ? dbObject.autoFillMemo : null,
                    dbObject.autoFillAmount ? dbObject.autoFillAmount : null,
                    dbObject.name,
                    dbObject.internalName ? dbObject.internalName : null,
                    dbObject.deviceKnowledge
                ]
            };

            return query;
        }

        public static loadDatabaseObject(budgetVersionId:string, deviceKnowledge:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "be_payees",
                query: "SELECT * FROM Payees WHERE budgetVersionId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?) AND isTombstone = 0",
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
        public static getAllPayees(budgetVersionId:string, includeTombstonedEntities:boolean = false):ynab.interfaces.adapters.IDatabaseQuery {

            if(includeTombstonedEntities) {
                return {
                    name: "payees",
                    query: "Select * FROM Payees WHERE budgetVersionId = ?",
                    arguments: [budgetVersionId]
                };
            }
            else {
                return {
                    name: "payees",
                    query: "Select * FROM Payees WHERE budgetVersionId = ? AND isTombstone = 0",
                    arguments: [budgetVersionId]
                };
            }
        }

        public static getInternalPayees(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "payees",
                query: "Select * FROM Payees WHERE budgetVersionId = ? AND isTombstone = 0 AND internalName IS NOT NULL",
                arguments: [budgetVersionId]
            };
        }

        public static getTransferPayees(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "payees",
                query: "Select * FROM Payees WHERE budgetVersionId = ? AND isTombstone = 0 AND accountId IS NOT NULL",
                arguments: [budgetVersionId]
            };
        }

        public static findPayeeByEntityId(budgetVersionId:string, entityId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "payees",
                query: "Select * FROM Payees WHERE budgetVersionId = ? AND entityId = ?",
                arguments: [budgetVersionId, entityId]
            };
        }

        public static findPayeeByName(budgetVersionId:string, payeeName:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "payees",
                query: "Select * FROM Payees WHERE budgetVersionId = ? AND name = ?",
                arguments: [budgetVersionId, payeeName]
            };
        }

        public static findTransferPayees(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {
            return {
                name: "payees",
                query: "Select * FROM Payees WHERE budgetVersionId = ? AND isTombstone = 0 AND accountId IS NOT NULL",
                arguments: [budgetVersionId]
            };
        }

    }
}