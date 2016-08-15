/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class MasterCategoryQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static insertDatabaseObject(dbObject:ynab.interfaces.budgetEntities.IDatabaseMasterCategory):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "masterCategories",
                query: "REPLACE INTO MasterCategories (budgetVersionId, entityId, isTombstone, internalName, deletable, sortableIndex, name, note, isHidden, deviceKnowledge) VALUES (?,?,?,?,?,?,?,?,?,?)",
                arguments: [
                    dbObject.budgetVersionId,
                    dbObject.entityId,
                    dbObject.isTombstone,
                    dbObject.internalName ? dbObject.internalName : null,
                    dbObject.deletable,
                    dbObject.sortableIndex,
                    dbObject.name,
                    dbObject.note ? dbObject.note : null,
                    dbObject.isHidden,
                    dbObject.deviceKnowledge
                ]
            };

            return query;
        }

        public static loadDatabaseObject(budgetVersionId:string, deviceKnowledge:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "be_master_categories",
                query: "SELECT * FROM MasterCategories WHERE budgetVersionId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?) AND isTombstone = 0",
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
        public static getAllMasterCategories(budgetVersionId:string, includeTombstonedEntities:boolean = false):ynab.interfaces.adapters.IDatabaseQuery {

            if(includeTombstonedEntities) {
                return {
                    name: "masterCategories",
                    query: "Select * FROM MasterCategories WHERE budgetVersionId = ?",
                    arguments: [budgetVersionId]
                };
            }else {
                return {
                    name: "masterCategories",
                    query: "Select * FROM MasterCategories WHERE budgetVersionId = ? AND isTombstone = 0",
                    arguments: [budgetVersionId]
                };
            }
        }

        public static getInternalMasterCategories(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "masterCategories",
                query: "Select * FROM MasterCategories WHERE budgetVersionId = ? AND isTombstone = 0 AND internalName IS NOT NULL",
                arguments: [budgetVersionId]
            };
        }

        public static findMasterCategoryByEntityId(budgetVersionId:string, entityId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "masterCategories",
                query: "Select * FROM MasterCategories WHERE budgetVersionId = ? AND entityId = ?",
                arguments: [budgetVersionId, entityId]
            };
        }

        public static findMasterCategoriesByEntityId(budgetVersionId:string, entityIds:Array<string>):Array<ynab.interfaces.adapters.IDatabaseQuery> {

            var queriesList:Array<ynab.interfaces.adapters.IDatabaseQuery> = [];

            for(var i = 0, j = entityIds.length; i < j; i += 50) {

                var tempArray = entityIds.slice(i, i + 50);

                var questionMarksStr = "";
                _.forEach(tempArray, function (entityId) {
                    questionMarksStr += (questionMarksStr == "" ? "" : ", ") + "?";
                });
                var argumentsArray = [budgetVersionId].concat(tempArray);

                var query = {
                    name: "masterCategories",
                    query: "Select * FROM MasterCategories WHERE budgetVersionId = ? AND entityId IN (" + questionMarksStr + ")",
                    arguments: argumentsArray
                };

                queriesList.push(query);
            }

            return queriesList;
        }

        public static findMasterCategoryByName(budgetVersionId:string, masterCategoryName:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "masterCategories",
                query: "Select * FROM MasterCategories WHERE budgetVersionId = ? AND name = ?",
                arguments: [budgetVersionId, masterCategoryName]
            };
        }
    }
}