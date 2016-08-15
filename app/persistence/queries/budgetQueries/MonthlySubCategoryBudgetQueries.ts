/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class MonthlySubCategoryBudgetQueries {

        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static updateCalculationProperties(serverObjects:Array<ynab.interfaces.budgetEntities.IServerMonthlySubCategoryBudgetCalculation>, budgetVersionId:string):Array<ynab.interfaces.adapters.IDatabaseQuery> {

            var queryList:Array<ynab.interfaces.adapters.IDatabaseQuery> = [];

            _.forEach(serverObjects, function(serverObject) {

                var query:ynab.interfaces.adapters.IDatabaseQuery = {

                    name: "monthlySubCategoryBudgetCalculations",
                    query: `UPDATE MonthlySubCategoryBudgets SET
                                cashOutflows = ?,
                                creditOutflows = ?,
                                balance = ?,
                                overspendingAffectsBuffer = ?,
                                budgetedCashOutflows = ?,
                                budgetedCreditOutflows = ?,
                                unBudgetedCashOutflows = ?,
                                unBudgetedCreditOutflows = ?,
                                budgetedPreviousMonth = ?,
                                spentPreviousMonth = ?,
                                paymentPreviousMonth = ?,
                                balancePreviousMonth = ?,
                                budgetedAverage = ?,
                                spentAverage = ?,
                                paymentAverage = ?,
                                budgetedSpending = ?,
                                allSpending = ?,
                                allSpendingSinceLastPayment = ?,
                                upcomingTransactions = ?,
                                upcomingTransactionsCount = ?,
                                goalTarget = ?,
                                goalOverallFunded = ?,
                                goalUnderFunded = ?,
                                goalOverallLeft = ?,
                                goalExpectedCompletion = ?,
                                deviceKnowledgeForCalculatedFields = 0
                            WHERE budgetVersionId = ? AND entityId = ?`,
                    arguments: [
                        serverObject.cash_outflows,
                        serverObject.credit_outflows,
                        serverObject.balance,
                        serverObject.overspending_affects_buffer ? 1 : 0,
                        serverObject.budgeted_cash_outflows,
                        serverObject.budgeted_credit_outflows,
                        serverObject.unbudgeted_cash_outflows,
                        serverObject.unbudgeted_credit_outflows,
                        serverObject.budgeted_previous_month,
                        serverObject.spent_previous_month,
                        serverObject.payment_previous_month,
                        serverObject.balance_previous_month,
                        serverObject.budgeted_average,
                        serverObject.spent_average,
                        serverObject.payment_average,
                        serverObject.budgeted_spending,
                        serverObject.all_spending,
                        serverObject.all_spending_since_last_payment,
                        serverObject.upcoming_transactions,
                        serverObject.upcoming_transactions_count ? serverObject.upcoming_transactions_count : 0,
                        serverObject.goal_target,
                        serverObject.goal_overall_funded,
                        serverObject.goal_under_funded,
                        serverObject.goal_overall_left,
                        serverObject.goal_expected_completion,
                        budgetVersionId,
                        serverObject.entities_monthly_subcategory_budget_id,
                    ]
                };

                queryList.push(query);
            });

            return queryList;
        }

        public static insertDatabaseObject(dbObject:ynab.interfaces.budgetEntities.IDatabaseMonthlySubCategoryBudget):ynab.interfaces.adapters.IDatabaseQuery {

            var month:string;
            if(!dbObject.month)
                month = ynab.utilities.KeyGenerator.extractMonthFromMonthlySubCategoryBudgetIdentity(dbObject.entityId).toISOString();
            else
                month = dbObject.month;

            var query:ynab.interfaces.adapters.IDatabaseQuery = {
                query: `REPLACE INTO MonthlySubCategoryBudgets
                    (
                        budgetVersionId,
                        entityId,
                        isTombstone,
                        monthlyBudgetId,
                        month,
                        subCategoryId,
                        budgeted,
                        overspendingHandling,
                        note,
                        cashOutflows,
                        positiveCashOutflows,
                        creditOutflows,
                        balance,
                        overspendingAffectsBuffer,
                        budgetedCashOutflows,
                        budgetedCreditOutflows,
                        unBudgetedCashOutflows,
                        unBudgetedCreditOutflows,
                        budgetedPreviousMonth,
                        spentPreviousMonth,
                        paymentPreviousMonth,
                        balancePreviousMonth,
                        budgetedAverage,
                        spentAverage,
                        paymentAverage,
                        budgetedSpending,
                        allSpending,
                        allSpendingSinceLastPayment,
                        additionalToBeBudgeted,
                        upcomingTransactions,
                        upcomingTransactionsCount,
                        goalTarget,
                        goalOverallFunded,
                        goalUnderFunded,
                        goalOverallLeft,
                        goalExpectedCompletion,
                        subCategoryInternalName,
                        subCategoryType,
                        subCategoryName,
                        subCategorySortableIndex,
                        subCategoryPinnedIndex,
                        subCategoryNote,
                        masterCategoryId,
                        masterCategoryName,
                        masterCategoryInternalName,
                        masterCategorySortableIndex,
                        deviceKnowledge,
                        deviceKnowledgeForCalculatedFields
                    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                arguments: [
                    dbObject.budgetVersionId,
                    dbObject.entityId,
                    dbObject.isTombstone,
                    dbObject.monthlyBudgetId,
                    month,
                    dbObject.subCategoryId,
                    dbObject.budgeted,
                    dbObject.overspendingHandling ? dbObject.overspendingHandling : null,
                    dbObject.note ? dbObject.note : null,
                    dbObject.cashOutflows,
                    dbObject.positiveCashOutflows,
                    dbObject.creditOutflows,
                    dbObject.balance,
                    dbObject.overspendingAffectsBuffer,
                    dbObject.budgetedCashOutflows ? dbObject.budgetedCashOutflows : null,
                    dbObject.budgetedCreditOutflows ? dbObject.budgetedCreditOutflows : null,
                    dbObject.unBudgetedCashOutflows ? dbObject.unBudgetedCashOutflows : null,
                    dbObject.unBudgetedCreditOutflows ? dbObject.unBudgetedCreditOutflows : null,
                    dbObject.budgetedPreviousMonth ? dbObject.budgetedPreviousMonth : null,
                    dbObject.spentPreviousMonth ? dbObject.spentPreviousMonth : null,
                    dbObject.paymentPreviousMonth ? dbObject.paymentPreviousMonth : null,
                    dbObject.balancePreviousMonth ? dbObject.balancePreviousMonth : null,
                    dbObject.budgetedAverage ? dbObject.budgetedAverage : null,
                    dbObject.spentAverage ? dbObject.spentAverage : null,
                    dbObject.paymentAverage ? dbObject.paymentAverage : null,
                    dbObject.budgetedSpending ? dbObject.budgetedSpending : null,
                    dbObject.allSpending ? dbObject.allSpending : null,
                    dbObject.allSpendingSinceLastPayment,
                    dbObject.additionalToBeBudgeted ? dbObject.additionalToBeBudgeted : null,
                    dbObject.upcomingTransactions ? dbObject.upcomingTransactions : null,
                    dbObject.upcomingTransactionsCount ? dbObject.upcomingTransactionsCount : 0,
                    dbObject.goalTarget ? dbObject.goalTarget : null,
                    dbObject.goalOverallFunded ? dbObject.goalOverallFunded : null,
                    dbObject.goalUnderFunded ? dbObject.goalUnderFunded : null,
                    dbObject.goalOverallLeft ? dbObject.goalOverallLeft : null,
                    dbObject.goalExpectedCompletion ? dbObject.goalExpectedCompletion : null,
                    dbObject.subCategoryInternalName ? dbObject.subCategoryInternalName : null,
                    dbObject.subCategoryType ? dbObject.subCategoryType : null,
                    dbObject.subCategoryName ? dbObject.subCategoryName : null,
                    dbObject.subCategorySortableIndex ? dbObject.subCategorySortableIndex : null,
                    dbObject.subCategoryPinnedIndex ? dbObject.subCategoryPinnedIndex : null,
                    dbObject.subCategoryNote ? dbObject.subCategoryNote : null,
                    dbObject.masterCategoryId ? dbObject.masterCategoryId : null,
                    dbObject.masterCategoryName ? dbObject.masterCategoryName : null,
                    dbObject.masterCategoryInternalName ? dbObject.masterCategoryInternalName : null,
                    dbObject.masterCategorySortableIndex ? dbObject.masterCategorySortableIndex : null,
                    dbObject.deviceKnowledge,
                    dbObject.deviceKnowledgeForCalculatedFields
                ]
            };

            return query;
        }

        // *********************************************************************************************************
        // Queries for updating data in the database
        // *********************************************************************************************************
        public static updateDeNormalizedValuesForSubCategories(viewItems:Array<ynab.interfaces.budgetDatabaseViews.ISubCategoriesViewItem>, budgetVersionId:string):Array<ynab.interfaces.adapters.IDatabaseQuery> {

            var queryList:Array<ynab.interfaces.adapters.IDatabaseQuery> = [];

            _.forEach(viewItems, function(viewItem:ynab.interfaces.budgetDatabaseViews.ISubCategoriesViewItem) {

                var query = {
                    name: "updateDeNormalizedValuesForSubCategories",
                    query: `UPDATE MonthlySubCategoryBudgets SET 
                                subCategoryInternalName = ?, 
                                subCategoryType = ?, 
                                subCategoryName = ?, 
                                subCategorySortableIndex = ?, 
                                subCategoryPinnedIndex = ?, 
                                subCategoryNote = ?, 
                                masterCategoryId = ?, 
                                masterCategoryName = ?, 
                                masterCategoryInternalName = ?, 
                                masterCategorySortableIndex = ? 
                            WHERE budgetVersionId = ? AND subCategoryId = ?`,
                    arguments: [
                        viewItem.subCategoryInternalName,
                        viewItem.subCategoryType,
                        viewItem.subCategoryName,
                        viewItem.subCategorySortableIndex,
                        viewItem.subCategoryPinnedIndex,
                        viewItem.subCategoryNote,
                        viewItem.masterCategoryId,
                        viewItem.masterCategoryName,
                        viewItem.masterCategoryInternalName,
                        viewItem.masterCategorySortableIndex,
                        budgetVersionId,
                        viewItem.subCategoryId
                    ]
                };

                queryList.push(query);
            });

            return queryList;
        }

        public static updateDeNormalizedValuesForMasterCategories(entities:Array<ynab.interfaces.budgetEntities.IDatabaseMasterCategory>, budgetVersionId:string):Array<ynab.interfaces.adapters.IDatabaseQuery> {

            var queryList:Array<ynab.interfaces.adapters.IDatabaseQuery> = [];

            _.forEach(entities, function(entity:ynab.interfaces.budgetEntities.IDatabaseMasterCategory) {

                var query = {
                    name: "updateDeNormalizedValuesForMasterCategories",
                    query: `UPDATE MonthlySubCategoryBudgets SET 
                                masterCategoryName = ?, 
                                masterCategoryInternalName = ?, 
                                masterCategorySortableIndex = ? 
                            WHERE budgetVersionId = ? AND masterCategoryId = ?`,
                    arguments: [
                        entity.name,
                        entity.internalName,
                        entity.sortableIndex,
                        budgetVersionId,
                        entity.entityId
                    ]
                };

                queryList.push(query);
            });

            return queryList;
        }

        // *********************************************************************************************************
        // Queries for reading data from the database
        // *********************************************************************************************************
        public static loadDatabaseObject(budgetVersionId:string, deviceKnowledge:number, deviceKnowledgeForCalculations:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "be_monthly_subcategory_budgets",
                query: `SELECT * FROM MonthlySubCategoryBudgets WHERE budgetVersionId = ?1 AND 
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

        public static getAllMonthlySubCategoryBudgets(budgetVersionId:string, includeTombstonedEntities:boolean = false):ynab.interfaces.adapters.IDatabaseQuery {

            if(includeTombstonedEntities) {
                return {
                    name: "monthlySubCategoryBudgets",
                    query: "Select * FROM MonthlySubCategoryBudgets WHERE budgetVersionId = ?",
                    arguments: [budgetVersionId]
                };
            }
            else {
                return {
                    name: "monthlySubCategoryBudgets",
                    query: "Select * FROM MonthlySubCategoryBudgets WHERE budgetVersionId = ? AND isTombstone = 0",
                    arguments: [budgetVersionId]
                };
            }
        }

        public static getMonthlySubCategoryBudgetsForScheduledCalculations(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "monthlySubCategoryBudgets",
                query: "Select entityId, month, upcomingTransactions, upcomingTransactionsCount FROM MonthlySubCategoryBudgets WHERE budgetVersionId = ?",
                arguments: [budgetVersionId]
            };
        }

        public static findMonthlySubCategoryBudgetByMonth(budgetVersionId:string, month:ynab.utilities.DateWithoutTime):ynab.interfaces.adapters.IDatabaseQuery {

            var monthString = month.toISOString();
            return {
                name: "monthlySubCategoryBudgets",
                query: "Select * FROM MonthlySubCategoryBudgets WHERE budgetVersionId = ? AND month = ?",
                arguments: [budgetVersionId, monthString]
            };
        }

        public static findMonthlySubCategoryBudgetByMonthAndSubCategoryId(budgetVersionId:string, month:ynab.utilities.DateWithoutTime, subCategoryId:string):ynab.interfaces.adapters.IDatabaseQuery {

            var entityId = ynab.utilities.KeyGenerator.getMonthlySubCategoryBudgetIdentity(subCategoryId, month);
            return {
                name: "monthlySubCategoryBudgets",
                query: "Select * FROM MonthlySubCategoryBudgets WHERE budgetVersionId = ? AND entityId = ?",
                arguments: [budgetVersionId, entityId]
            };
        }

        public static findMonthlySubCategoryBudgetDbtExtended(budgetVersionId:string, subCategoryId:string, month:ynab.utilities.DateWithoutTime):ynab.interfaces.adapters.IDatabaseQuery {

            var monthString = month ? month.toISOString() : null;
            return {
                name: "monthlySubCategoryBudgets",
                query: `
-- ?1 is the budget version id
-- ?2 is the subCategoryId
-- ?3 is the month in the form of 2016-01-01

SELECT 
  MSCB.*,
  ACC.clearedBalance + ACC.unclearedBalance as dbt_accountBalance,
  SQ.lastPaymentDate as dbt_lastPaymentDate,
  SQ.lastPaymentAmount as dbt_lastPaymentAmount,
  SC.accountId as dbt_accountId
FROM SubCategories SC 
LEFT JOIN MonthlySubCategoryBudgets MSCB
ON MSCB.subCategoryId = SC.entityId
LEFT JOIN Accounts ACC
ON ACC.entityId = SC.accountId
LEFT JOIN
  (
  SELECT
    MAX(date) as lastPaymentDate,
    amount as lastPaymentAmount,
    accountId
  FROM
    Transactions TR 
  WHERE 
    budgetVersionId = ?1 AND isTombstone = 0 AND amount > 0 AND (transferTransactionId IS NOT NULL OR transferSubTransactionId IS NOT NULL) 
  GROUP BY
    accountId
  ) AS SQ
ON SQ.accountId = SC.accountId

WHERE MSCB.budgetVersionId = ?1
AND MSCB.subCategoryId = ?2
AND MSCB.month = ?3
                `,              
                arguments: [budgetVersionId, subCategoryId, monthString]
            };
        }
    }
}

