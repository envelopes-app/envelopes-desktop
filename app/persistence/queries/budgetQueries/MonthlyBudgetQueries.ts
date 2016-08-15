/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class MonthlyBudgetQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static updateCalculationProperties(serverObjects:Array<ynab.interfaces.budgetEntities.IServerMonthlyBudgetCalculation>, budgetVersionId:string):Array<ynab.interfaces.adapters.IDatabaseQuery> {

            var queryList:Array<ynab.interfaces.adapters.IDatabaseQuery> = [];

            _.forEach(serverObjects, function(serverObject) {

                var query:ynab.interfaces.adapters.IDatabaseQuery = {

                    name: "monthlyBudgetCalculations",
                    query: `UPDATE MonthlyBudgets SET 
                                previousIncome = ?, 
                                immediateIncome = ?, 
                                deferredIncome = ?, 
                                budgeted = ?, 
                                cashOutflows = ?, 
                                creditOutflows = ?, 
                                balance = ?, 
                                overSpent = ?, 
                                availableToBudget = ?, 
                                uncategorizedCashOutflows = ?, 
                                uncategorizedCreditOutflows = ?, 
                                uncategorizedBalance = ?, 
                                hiddenBudgeted = ?, 
                                hiddenCashOutflows = ?, 
                                hiddenCreditOutflows = ?, 
                                hiddenBalance = ?, 
                                calculationNotes = ?, 
                                additionalToBeBudgeted = ?, 
                                ageOfMoney = ?, 
                                deviceKnowledgeForCalculatedFields = 0 
                            WHERE budgetVersionId = ? AND entityId = ?`,
                    arguments: [
                        serverObject.previous_income,
                        serverObject.immediate_income,
                        serverObject.deferred_income,
                        serverObject.budgeted,
                        serverObject.cash_outflows,
                        serverObject.credit_outflows,
                        serverObject.balance,
                        serverObject.over_spent,
                        serverObject.available_to_budget,
                        serverObject.uncategorized_cash_outflows,
                        serverObject.uncategorized_credit_outflows,
                        serverObject.uncategorized_balance,
                        serverObject.hidden_budgeted,
                        serverObject.hidden_cash_outflows,
                        serverObject.hidden_credit_outflows,
                        serverObject.hidden_balance,
                        serverObject.calculation_notes,
                        serverObject.additional_to_be_budgeted ? serverObject.additional_to_be_budgeted : 0,
                        serverObject.age_of_money,
                        budgetVersionId,
                        serverObject.entities_monthly_budget_id
                    ]
                };

                queryList.push(query);
            });

            return queryList;
        }

        public static insertDatabaseObject(dbObject:ynab.interfaces.budgetEntities.IDatabaseMonthlyBudget):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "monthlyBudgets",
                query: `REPLACE INTO MonthlyBudgets
                        (
                            budgetVersionId,
                            entityId,
                            isTombstone,
                            month,
                            note,
                            previousIncome,
                            immediateIncome,
                            deferredIncome,
                            budgeted,
                            cashOutflows,
                            creditOutflows,
                            balance,
                            overSpent,
                            availableToBudget,
                            uncategorizedCashOutflows,
                            uncategorizedCreditOutflows,
                            uncategorizedBalance,
                            hiddenBudgeted,
                            hiddenCashOutflows,
                            hiddenCreditOutflows,
                            hiddenBalance,
                            calculationNotes,
                            additionalToBeBudgeted,
                            ageOfMoney,
                            deviceKnowledge,
                            deviceKnowledgeForCalculatedFields
                        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                arguments: [
                    dbObject.budgetVersionId,
                    dbObject.entityId,
                    dbObject.isTombstone,
                    dbObject.month,
                    dbObject.note,
                    dbObject.previousIncome,
                    dbObject.immediateIncome,
                    dbObject.deferredIncome,
                    dbObject.budgeted,
                    dbObject.cashOutflows,
                    dbObject.creditOutflows,
                    dbObject.balance,
                    dbObject.overSpent,
                    dbObject.availableToBudget,
                    dbObject.uncategorizedCashOutflows,
                    dbObject.uncategorizedCreditOutflows,
                    dbObject.uncategorizedBalance,
                    dbObject.hiddenBudgeted,
                    dbObject.hiddenCashOutflows,
                    dbObject.hiddenCreditOutflows,
                    dbObject.hiddenBalance,
                    dbObject.calculationNotes ? dbObject.calculationNotes : null,
                    dbObject.additionalToBeBudgeted,
                    dbObject.ageOfMoney,
                    dbObject.deviceKnowledge,
                    dbObject.deviceKnowledgeForCalculatedFields
                ]
            };

            return query;
        }

        public static loadDatabaseObject(budgetVersionId:string, deviceKnowledge:number, deviceKnowledgeForCalculations:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "be_monthly_budgets",
                query: `SELECT * FROM MonthlyBudgets WHERE budgetVersionId = ?1 AND 
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
        public static getAllMonthlyBudgets(budgetVersionId:string, includeTombstonedEntities:boolean = false):ynab.interfaces.adapters.IDatabaseQuery {

            if(includeTombstonedEntities) {
                return {
                    name: "monthlyBudgets",
                    query: "Select * FROM MonthlyBudgets WHERE budgetVersionId = ?",
                    arguments: [budgetVersionId]
                };
            }
            else {
                return {
                    name: "monthlyBudgets",
                    query: "Select * FROM MonthlyBudgets WHERE budgetVersionId = ? AND isTombstone = 0",
                    arguments: [budgetVersionId]
                };
            }
        }

        public static findMonthlyBudgetByMonth(budgetVersionId:string, month:ynab.utilities.DateWithoutTime):ynab.interfaces.adapters.IDatabaseQuery {

            var entityId = ynab.utilities.KeyGenerator.getMonthlyBudgetIdentity(budgetVersionId, month);
            return {
                name: "monthlyBudgets",
                query: "SELECT * FROM MonthlyBudgets WHERE budgetVersionId = ? AND entityId = ?",
                arguments: [budgetVersionId, entityId]
            };
        }

        // This query allows mobile clients to determine if it's necessary to call ensureDataForMonthExists.
        // The query can be executed synchronously in mobile native code to quickly determine if they need
        // to hold up the UI while the async ensureDataForMonthExists processes.
        //
        // Effectively, the mobile client wants to know if the monthly budget is ready for a given month,
        // but really this translates to having all of the monthly sub category budgets created. If the
        // MSCBs are there, the monthly budget should already be there as well.
        //
        public static dataForMonthExists(budgetVersionId:string, month:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "dataForMonthExists",
                query: `
                 SELECT ?2 as month, CASE WHEN EXISTS (
                     SELECT entityId
                     FROM SubCategories
                     WHERE budgetVersionID = ?1
                       AND isTombstone = 0
                       AND internalName NOT IN ('Category/__Split__')
                       AND entityId NOT IN (
                         SELECT subCategoryId
                         FROM MonthlySubCategoryBudgets
                         WHERE budgetVersionID = ?1
                           AND month = ?2
                           AND isTombstone = 0
                       )
                ) THEN 0 ELSE 1 END as dataForMonthExists
                `,
                arguments: [budgetVersionId, month]
            };
        }
    }
}
