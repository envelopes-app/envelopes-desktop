/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class UserSettingQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static insertDatabaseObject(dbObject:ynab.interfaces.catalogEntities.IDatabaseUserSetting):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                query: "REPLACE INTO UserSettings (entityId, userId, settingName, settingValue, deviceKnowledge) VALUES (?,?,?,?,?)",
                arguments: [
                    dbObject.entityId,
                    dbObject.userId,
                    dbObject.settingName,
                    dbObject.settingValue,
                    dbObject.deviceKnowledge
                ]
            };

            return query;
        }

        public static loadDatabaseObject(deviceKnowledge:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "ce_user_settings",
                query: "SELECT * FROM UserSettings WHERE deviceKnowledge = 0 OR deviceKnowledge > ?",
                arguments: [
                    deviceKnowledge
                ]
            };

            return query;
        }

        // *********************************************************************************************************
        // Queries for reading data from the database
        // *********************************************************************************************************
        public static findSettingByName(userId:string, settingName:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "userSettings",
                query: "Select * FROM UserSettings WHERE userId = ? AND settingName = ?",
                arguments: [userId, settingName]
            };
        }
    }
}
