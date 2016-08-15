/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class SummaryQueries {

        public static summaryForAccount(budgetVersionId:string, accountId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "summary",
                query: `
SELECT cleared, uncleared, cleared + uncleared AS working FROM (
  SELECT 
    clearedBalance AS cleared, 
    unclearedBalance AS uncleared
  FROM Accounts
  WHERE budgetVersionId=?1
  AND entityId=?2
)
                `,
                arguments: [budgetVersionId, accountId]
            };
        }

        public static summaryForCategory(budgetVersionId:string, subCategoryId:string, month:ynab.utilities.DateWithoutTime):ynab.interfaces.adapters.IDatabaseQuery {
            var monthString = month ? month.toISOString() : null;

            return {
                name: "summary",
                query: `
SELECT (balance - budget - spend) AS lastMonthBalance, budget, spend, balance, note FROM (
  SELECT 
    balance, 
    budgeted as budget, 
    (cashOutflows+creditOutflows) AS spend,
    note
  FROM  MonthlySubCategoryBudgets
  WHERE budgetVersionId=?1
    AND subCategoryId=?2
    AND month=?3
)
                `,
                arguments: [budgetVersionId, subCategoryId, monthString]
            };
        }

        public static summaryForAllAccounts(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "summary",
                query: `
SELECT assets, debts, assets + debts AS net FROM (
  SELECT
    COALESCE((SELECT SUM(clearedBalance)+SUM(unclearedBalance)
     FROM Accounts
     WHERE clearedBalance + unclearedBalance > 0
     AND isTombstone=0
     AND budgetVersionId=?1
  ), 0) AS assets,
    COALESCE((SELECT SUM(clearedBalance)+SUM(unclearedBalance)
    FROM Accounts
    WHERE clearedBalance + unclearedBalance < 0
    AND isTombstone=0
    AND budgetVersionId=?1
), 0) AS debts)                
                `,
                arguments: [budgetVersionId]
            };
        }


    }
}