/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class BudgetPickerQueries {

        public static findAvailableBudgets(userId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "availableBudgets",
                query: `
SELECT
    BV.entityId,
    BV.budgetId,
    BV.versionName,
    BV.lastAccessedOn,
    COALESCE((BVK.deviceKnowledgeOfServer > 0), 0) AS is_cached
FROM       BudgetVersions           BV
LEFT JOIN  BudgetVersionKnowledge   BVK ON BV.entityId = BVK.budgetVersionId
LEFT JOIN  Budgets                  B   ON B.entityId  = BV.budgetId
LEFT JOIN  UserBudgets              UB  ON UB.budgetId = B.entityId

WHERE   UB.userId=?1
AND      B.isTombstone=0
AND     BV.isTombstone=0
AND     UB.isTombstone=0

ORDER BY
    is_cached DESC,
    lastAccessedOn DESC,
    BV.versionName
                `,
                arguments: [userId]
            }
        }

    }
}
