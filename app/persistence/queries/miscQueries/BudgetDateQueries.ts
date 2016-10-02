/// <reference path='../../../_includes.ts' />

import { TransactionSources } from '../../../constants';
import { IDatabaseQuery } from '../../../interfaces/persistence';
import { TransactionQueries } from '../budgetQueries';

export class BudgetDateQueries {

	public static getFirstAndLastBudgetMonthQuery(budgetId:string):IDatabaseQuery {
		
		return {
			name:"firstLastBudgetMonth",
			query: `
WITH e_first_last_budgeted_month AS (
SELECT MIN(month) as first_month_budgeted, MAX(month) as last_month_budgeted 
FROM MonthlySubCategoryBudgets
WHERE budgetId = ?1
	AND isTombstone = 0
	AND budgeted != 0
), e_first_transaction_month AS (
SELECT  strftime('%Y-%m-%d', datetime(MIN(date) * 0.001, 'unixepoch', 'start of month'))  as min_transaction_month
FROM Transactions 
WHERE budgetId = ?1
	AND isTombstone = 0
	AND COALESCE(source,'') IN (${TransactionQueries.TransactionSourcesINClause})
)
SELECT MIN(COALESCE(b.first_month_budgeted,c.current_month),COALESCE(t.min_transaction_month, c.current_month), c.current_month) as firstMonth,
	-- lastMonth will always be the month after the last month budgeted and at least currentMonth + 1
	date(MAX(COALESCE(b.last_month_budgeted, date(c.current_month)), date(c.current_month)), '+1 month') as lastMonth
FROM (SELECT current_month FROM (SELECT (VALUES(date('now','start of month'))) as current_month)) c
LEFT JOIN e_first_last_budgeted_month b
LEFT JOIN e_first_transaction_month t
			`,
			arguments: [budgetId]
		};
	}
}