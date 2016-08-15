/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class PayeeLocationQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static insertDatabaseObject(dbObject:ynab.interfaces.budgetEntities.IDatabasePayeeLocation):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "payeeLocations",
                query: `REPLACE INTO PayeeLocations (
                            budgetVersionId, 
                            entityId, 
                            isTombstone, 
                            payeeId, 
                            latitude, 
                            longitude, 
                            deviceKnowledge
                        ) VALUES (?,?,?,?,?,?,?)`,
                arguments: [
                    dbObject.budgetVersionId,
                    dbObject.entityId,
                    dbObject.isTombstone,
                    dbObject.payeeId,
                    dbObject.latitude,
                    dbObject.longitude,
                    dbObject.deviceKnowledge
                ]
            };

            return query;
        }

        public static loadDatabaseObject(budgetVersionId:string, deviceKnowledge:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "be_payee_locations",
                query: "SELECT * FROM PayeeLocations WHERE budgetVersionId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?) AND isTombstone = 0",
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
        public static getAllPayeeLocations(budgetVersionId:string, includeTombstonedEntities:boolean = false):ynab.interfaces.adapters.IDatabaseQuery {

            if(includeTombstonedEntities) {
                return {
                    name: "payeeLocations",
                    query: "Select * FROM PayeeLocations WHERE budgetVersionId = ?",
                    arguments: [budgetVersionId]
                };
            }
            else {
                return {
                    name: "payeeLocations",
                    query: "Select * FROM PayeeLocations WHERE budgetVersionId = ? AND isTombstone = 0",
                    arguments: [budgetVersionId]
                };
            }
        }

        public static findPayeeLocationsByPayeeEntityId(budgetVersionId:string, payeeEntityId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "payeeLocations",
                query: "Select * FROM PayeeLocations WHERE budgetVersionId = ? AND payeeId = ?",
                arguments: [budgetVersionId, payeeEntityId]
            };
        }

    }
}