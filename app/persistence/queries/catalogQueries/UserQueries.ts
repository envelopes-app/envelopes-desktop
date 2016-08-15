/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class UserQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static insertDatabaseObject(dbObject:ynab.interfaces.catalogEntities.IDatabaseUser):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                query: "REPLACE INTO Users (entityId, userName, email, trialExpiresOn, featureFlags, deviceKnowledge) VALUES (?,?,?,?,?,?)",
                arguments: [
                    dbObject.entityId,
                    dbObject.userName,
                    dbObject.email,
                    dbObject.trialExpiresOn,
                    JSON.stringify(dbObject.featureFlags),
                    dbObject.deviceKnowledge
                ]
            };

            return query;
        }

        public static loadDatabaseObject(deviceKnowledge:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "ce_users",
                query: "SELECT * FROM Users WHERE deviceKnowledge = 0 OR deviceKnowledge > ?",
                arguments: [
                    deviceKnowledge
                ]
            };

            return query;
        }

        // *********************************************************************************************************
        // Queries for reading data from the database
        // *********************************************************************************************************
        public static findUserForEmail(userEmail:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "users",
                query: "SELECT * FROM Users WHERE email=?1",
                arguments: [userEmail]
            }
        }

        public static findUserForId(userId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "users",
                query: "SELECT * FROM Users WHERE entityId=?1",
                arguments: [userId]
            }
        }

    }
}
