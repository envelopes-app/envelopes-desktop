/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class PayeeRenameConditionQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static insertDatabaseObject(dbObject:ynab.interfaces.budgetEntities.IDatabasePayeeRenameCondition):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "payeeRenameConditions",
                query: `REPLACE INTO PayeeRenameConditions (
                            budgetVersionId, 
                            entityId, 
                            isTombstone, 
                            payeeId, 
                            operator, 
                            operand, 
                            deviceKnowledge
                        ) VALUES (?,?,?,?,?,?,?)`,
                arguments: [
                    dbObject.budgetVersionId,
                    dbObject.entityId,
                    dbObject.isTombstone,
                    dbObject.payeeId,
                    dbObject.operator ? dbObject.operator : null,
                    dbObject.operand ? dbObject.operand : null,
                    dbObject.deviceKnowledge
                ]
            };

            return query;
        }

        public static loadDatabaseObject(budgetVersionId:string, deviceKnowledge:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "be_payee_rename_conditions",
                query: "SELECT * FROM PayeeRenameConditions WHERE budgetVersionId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?) AND isTombstone = 0",
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
        public static getAllPayeeRenameConditions(budgetVersionId:string, includeTombstonedEntities:boolean = false):ynab.interfaces.adapters.IDatabaseQuery {

            if(includeTombstonedEntities) {
                return {
                    name: "payeeRenameConditions",
                    query: "Select * FROM PayeeRenameConditions WHERE budgetVersionId = ?",
                    arguments: [budgetVersionId]
                };
            }
            else {
                return {
                    name: "payeeRenameConditions",
                    query: "Select * FROM PayeeRenameConditions WHERE budgetVersionId = ? AND isTombstone = 0",
                    arguments: [budgetVersionId]
                };
            }
        }
    }
}