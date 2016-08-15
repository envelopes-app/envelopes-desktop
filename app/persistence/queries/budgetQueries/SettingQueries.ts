/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class SettingQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static insertDatabaseObject(dbObject:ynab.interfaces.budgetEntities.IDatabaseSetting):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "settings",
                query: `REPLACE INTO Settings (
                            budgetVersionId, 
                            entityId, 
                            settingName, 
                            settingValue, 
                            deviceKnowledge
                        ) VALUES (?,?,?,?,?)`,
                arguments: [
                    dbObject.budgetVersionId,
                    dbObject.entityId,
                    dbObject.settingName,
                    dbObject.settingValue ? dbObject.settingValue : null,
                    dbObject.deviceKnowledge
                ]
            };

            return query;
        }

        public static loadDatabaseObject(budgetVersionId:string, deviceKnowledge:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "be_settings",
                query: "SELECT * FROM Settings WHERE budgetVersionId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?)",
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
        public static getAllSettings(budgetVersionId:string, includeTombstonedEntities:boolean = false):ynab.interfaces.adapters.IDatabaseQuery {

            // "includeTombstonedEntities" parameter added to the method just for consistency. Settings do not have a tombstone column.
            return {
                name: "settings",
                query: "Select * FROM Settings WHERE budgetVersionId = ?",
                arguments: [budgetVersionId]
            };
        }

        public static findSettingByName(budgetVersionId:string, settingName:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "settings",
                query: "Select * FROM Settings WHERE budgetVersionId = ? AND settingName = ?",
                arguments: [budgetVersionId, settingName]
            };
        }
    }
}