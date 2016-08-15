/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class SubCategoryQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static insertDatabaseObject(dbObject:ynab.interfaces.budgetEntities.IDatabaseSubCategory):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "subCategories",
                query: `REPLACE INTO SubCategories (
                            budgetVersionId, 
                            entityId, 
                            isTombstone, 
                            masterCategoryId, 
                            accountId, 
                            internalName, 
                            sortableIndex, 
                            pinnedIndex, 
                            name, 
                            type, 
                            note, 
                            isHidden, 
                            goalType, 
                            goalCreationMonth, 
                            targetBalance, 
                            targetBalanceMonth, 
                            monthlyFunding, 
                            deviceKnowledge
                        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                arguments: [
                    dbObject.budgetVersionId,
                    dbObject.entityId,
                    dbObject.isTombstone,
                    dbObject.masterCategoryId,
                    dbObject.accountId ? dbObject.accountId : null,
                    dbObject.internalName ? dbObject.internalName : null,
                    dbObject.sortableIndex,
                    dbObject.pinnedIndex ? dbObject.pinnedIndex : null,
                    dbObject.name,
                    dbObject.type ? dbObject.type : null,
                    dbObject.note ? dbObject.note : null,
                    dbObject.isHidden,
                    dbObject.goalType ? dbObject.goalType : null,
                    dbObject.goalCreationMonth ? dbObject.goalCreationMonth : null,
                    dbObject.targetBalance ? dbObject.targetBalance : null,
                    dbObject.targetBalanceMonth ? dbObject.targetBalanceMonth : null,
                    dbObject.monthlyFunding ? dbObject.monthlyFunding : null,
                    dbObject.deviceKnowledge
                ]
            };

            return query;
        }

        public static loadDatabaseObject(budgetVersionId:string, deviceKnowledge:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "be_subcategories",
                query: "SELECT * FROM SubCategories WHERE budgetVersionId = ? AND (deviceKnowledge = 0 OR deviceKnowledge > ?) AND isTombstone = 0",
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
        public static getAllSubCategories(budgetVersionId:string, includeTombstonedEntities:boolean = false):ynab.interfaces.adapters.IDatabaseQuery {

            if(includeTombstonedEntities) {
                return {
                    name: "subCategories",
                    query: "Select * FROM SubCategories WHERE budgetVersionId = ?",
                    arguments: [budgetVersionId]
                };
            }
            else {
                return {
                    name: "subCategories",
                    query: "Select * FROM SubCategories WHERE budgetVersionId = ? AND isTombstone = 0",
                    arguments: [budgetVersionId]
                };
            }
        }

        public static findSubCategoryByEntityId(budgetVersionId:string, entityId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "subCategories",
                query: "Select * FROM SubCategories WHERE budgetVersionId = ? AND entityId = ?",
                arguments: [budgetVersionId, entityId]
            };
        }

        public static findSubCategoryByName(budgetVersionId:string, masterCategoryName:string, subCategoryName:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "subCategories",
                query: "Select * FROM SubCategories WHERE budgetVersionId = ? AND name = ? AND masterCategoryId = (SELECT entityId FROM MasterCategories WHERE budgetVersionId = ? AND name = ?)",
                arguments: [budgetVersionId, subCategoryName, budgetVersionId, masterCategoryName]
            };
        }

        public static getInternalSubCategories(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "subCategories",
                query: "Select * FROM SubCategories WHERE budgetVersionId = ? AND internalName IS NOT NULL",
                arguments: [budgetVersionId]
            };
        }

        public static getSplitSubCategory(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "subCategories",
                query: "Select * FROM SubCategories WHERE budgetVersionId = ? AND internalName = ?",
                arguments: [budgetVersionId, ynab.constants.InternalCategories.SplitSubCategory]
            };
        }

        public static getImmediateIncomeSubCategory(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "subCategories",
                query: "Select * FROM SubCategories WHERE budgetVersionId = ? AND internalName = ?",
                arguments: [budgetVersionId, ynab.constants.InternalCategories.ImmediateIncomeSubCategory]
            };
        }

        public static getDeferredIncomeSubCategory(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "subCategories",
                query: "Select * FROM SubCategories WHERE budgetVersionId = ? AND internalName = ?",
                arguments: [budgetVersionId, ynab.constants.InternalCategories.DeferredIncomeSubCategory]
            };
        }
    }
}