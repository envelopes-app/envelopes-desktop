/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class MobileTransactionManagerQueries {

        public static stateForExistingTransaction(budgetVersionId:string, transactionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "stateForExistingTransaction",
                query: `
SELECT
  ?1 AS budgetVersionId,

  0 AS enableSave,
  1 AS enableDelete,

  T.entityId AS transactionId,

  T.date AS date,

  T.amount AS amount,
  CASE WHEN T.amount <= 0 THEN 1 ELSE 0 END AS isOutflow,

  T.payeeId AS payeeId,
  P.name AS payeeDisplayName,
  NULL AS addPayeeName,

  NULL AS payeeLocationId,
  0 AS payeeLatitude,
  0 AS payeeLongitude,

  ?2 AS splitsPrototypeTransactionId,
  T.subCategoryId AS categoryId,
  C.name AS categoryName,
  C.internalName AS categoryInternalName,

  T.accountId AS accountId,
  A.accountName AS accountName,
  A.onBudget AS accountOnBudget,

  T.transferTransactionId AS transferTransactionId,
  T.transferAccountId AS transferAccountId,
  TA.accountName AS transferAccountName,
  coalesce(TA.onBudget, 0) AS transferAccountOnBudget,

  T.memo AS memo,
  T.checkNumber AS checkNumber,

  T.cleared AS cleared,

  T.flag as flag,

  T.transferSubTransactionId IS NOT NULL AS isSplitTransferCounterpart,
  ST.transactionId AS splitTransferParentId,

  NULL AS splitEntries,
  NULL AS validationMessages,

  1 AS userExplicitlySetAccount,
  1 AS userExplicitlySetCategory,
  1 AS userExplicitlySetPayeeOrTransfer,
  1 AS userExplicitlySetIsOutflow,

  0 AS saveFlags

FROM
  Transactions T

LEFT JOIN
  Payees P
ON
  T.payeeId = P.entityId

LEFT JOIN
  SubCategories C
ON
  T.subCategoryId = C.entityId

LEFT JOIN
  Accounts A
ON
  T.accountId = A.entityId

LEFT JOIN
  Accounts TA
ON
  T.transferAccountId = TA.entityID

LEFT JOIN
  SubTransactions ST
ON
  T.transferSubTransactionId = ST.entityID

WHERE
  T.budgetVersionId = ?1

AND
  T.isTombstone = 0

AND
  T.entityId = ?2
`,
            arguments: [budgetVersionId, transactionId]
        }
    }

        public static stateForNewTransaction(budgetVersionId:string, payeeId:string, accountId:string, subCategoryId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "stateForNewTransaction",
                query: `
/* Query to get initial state for Add Transaction

  You must supply budgetVersionId.

  Then you must specify one of these: payee, account, or category entity Id.

  If you supply the payee id, you may specify a category id or account id
  in addition to the payee id. Useful, for example, when you have a geo
  payee but are adding the transaction from the category detail screen.

  For "unspecified" query parameters, pass an empty string.

  ?1 - budgetVersionId
  ?2 - payee entity id (e.g. from geo payee query)
  ?3 - account entity id (e.g. from account transaction register screen)
  ?4 - category entity id (e.g. from category transaction detail screen)
*/

SELECT *,
CASE WHEN categoryInternalName='Category/__ImmediateIncome__' THEN 0 ELSE 1 END AS isOutflow
FROM
(

/**************************************************
    Payee Specified - Transaction Available
***************************************************/

SELECT * FROM
(
SELECT
  '00_payee_specified_transaction_available' AS priority,

  ?1 AS budgetVersionId,

  1 AS enableSave,
  0 AS enableDelete,

  NULL AS transactionId,

  strftime('%s', date('now', 'localtime')) * 1000 AS date,

  0 AS amount,

  T.payeeId AS payeeId,
  P.name AS payeeDisplayName,
  NULL AS addPayeeName,

  NULL AS payeeLocationId,
  0 AS payeeLatitude,
  0 AS payeeLongitude,

/* If category specified use it, otherwise use category info from transaction */

  CASE WHEN ?4 = ''
    THEN T.entityId
    ELSE NULL
  END AS splitsPrototypeTransactionId,

  CASE WHEN ?4 = ''
    THEN T.subCategoryId
    ELSE ?4
  END AS categoryId,

  CASE WHEN ?4 = ''
    THEN C.name
    ELSE (SELECT name FROM SubCategories WHERE entityId = ?4)
  END AS categoryName,

  CASE WHEN ?4 = ''
    THEN C.internalName
    ELSE (SELECT internalName FROM SubCategories WHERE entityId = ?4)
  END AS categoryInternalName,

/* If account specified use it, otherwise use account info from transaction */

  CASE WHEN ?3 = ''
    THEN T.accountId
    ELSE ?3
  END AS accountId,

  CASE WHEN ?3 = ''
    THEN A.accountName
    ELSE (SELECT accountName FROM Accounts WHERE entityId = ?3)
  END AS accountName,

  CASE WHEN ?3 = ''
    THEN A.onBudget
    ELSE (SELECT onBudget FROM Accounts WHERE entityId = ?3)
  END AS accountOnBudget,

  NULL AS transferTransactionId,
  TA.entityId AS transferAccountId,
  TA.accountName AS transferAccountName,
  coalesce(TA.onBudget, 0) AS transferAccountOnBudget,

  NULL AS memo,
  NULL AS checkNumber,

  'Uncleared' AS cleared,

  NULL as flag,

  0 AS isSplitTransferCounterpart,
  NULL AS splitTransferParentId,

  NULL AS splitEntries,
  NULL AS validationMessages,

  CASE WHEN ?3 != '' THEN 1 ELSE 0 END AS userExplicitlySetAccount,
  CASE WHEN ?4 != '' THEN 1 ELSE 0 END AS userExplicitlySetCategory,
  1 AS userExplicitlySetPayeeOrTransfer,
  0 AS userExplicitlySetIsOutflow,

  0 AS saveFlags

FROM
  Transactions T

INNER JOIN /* Requires valid account */
  Accounts A
ON
  T.accountId = A.entityId

LEFT JOIN /* Okay to not have a transfer account */
  Accounts TA
ON
  T.transferTransactionId = TA.entityId

LEFT JOIN /* Okay to not have a sub category */
  SubCategories C
ON
  T.subCategoryId = C.entityId

LEFT JOIN /* Okay to not have a master category */
  MasterCategories M
ON
  C.masterCategoryId = M.entityId

INNER JOIN /* Requires a valid payee */
  Payees P
ON
  T.payeeId = P.entityId

WHERE
  ?2 != ''
AND
  T.budgetVersionId = ?1
AND
  T.isTombstone = 0
AND
  T.payeeId = ?2
AND
  T.transferSubTransactionId IS NULL
AND
  T.dateEnteredFromSchedule IS NULL
AND
  (T.source IS NULL OR T.source IN ('', 'Scheduler', 'Matched', 'Imported'))
AND
  A.budgetVersionId = ?1
AND
  A.isTombstone = 0
AND
  A.hidden = 0
AND
  (TA.budgetVersionId = ?1 OR TA.budgetVersionId IS NULL)
AND
  (TA.isTombstone = 0 OR TA.isTombstone IS NULL)
AND
  (TA.hidden = 0 OR TA.hidden IS NULL)
AND
  (?3 = '' OR TA.entityId != ?3 OR TA.entityId IS NULL) /* Avoid transfer to/from same account */
AND
  (C.budgetVersionId IS NULL OR C.budgetVersionId = ?1) /* Transfers, for example many not have a category */
AND
  (C.isTombstone IS NULL OR C.isTombstone = 0) /* May not have a category */
AND
  (M.budgetVersionId IS NULL OR M.budgetVersionId = ?1) /* May not have a category */
AND
  (M.isTombstone = 0 IS NULL OR M.isTombstone = 0) /* May not have a category */
AND
  P.budgetVersionId = ?1
AND
  P.isTombstone = 0

ORDER BY
  T.date DESC,
  T.entityId

LIMIT 1
)


UNION ALL


/**************************************************
     Payee Specified - w/o Available Transaction
***************************************************/

/* Default account first account in sequence. */
SELECT * FROM
(
SELECT
  '01_payee_specified_no_transaction_available' AS priority,

  ?1 AS budgetVersionId,

  1 AS enableSave,
  0 AS enableDelete,

  NULL AS transactionId,

  strftime('%s', date('now', 'localtime')) * 1000 AS date,

  0 AS amount,

  ?2 AS payeeId,
  (SELECT name FROM Payees WHERE entityId = ?2) as payeeDisplayName,
  NULL AS addPayeeName,

  NULL AS payeeLocationId,
  0 AS payeeLatitude,
  0 AS payeeLongitude,

  NULL AS splitsPrototypeTransactionId,

  CASE WHEN ?4 = ''
    THEN NULL
    ELSE ?4
  END AS categoryId,

  CASE WHEN ?4 = ''
    THEN NULL
    ELSE (SELECT name FROM SubCategories WHERE entityId = ?4)
  END AS categoryName,

  CASE WHEN ?4 = ''
    THEN NULL
    ELSE (SELECT internalName FROM SubCategories WHERE entityId = ?4)
  END AS categoryInternalName,

  /* If account specified use it, otherwise use account info from transaction */

  CASE WHEN ?3 = ''
    THEN A.entityId
    ELSE ?3
  END AS accountId,

  CASE WHEN ?3 = ''
    THEN A.accountName
    ELSE (SELECT accountName FROM Accounts WHERE entityId = ?3)
  END AS accountName,

  CASE WHEN ?3 = ''
    THEN A.onBudget
    ELSE (SELECT onBudget FROM Accounts WHERE entityId = ?3)
  END AS accountOnBudget,

  NULL AS transferTransactionId,
  NULL AS transferAccountId,
  NULL AS transferAccountName,
  0 AS transferAccountOnBudget,

  NULL AS memo,
  NULL AS checkNumber,

  'Uncleared' AS cleared,

  NULL as flag,

  0 AS isSplitTransferCounterpart,
  NULL AS splitTransferParentId,

  NULL AS splitEntries,
  NULL AS validationMessages,

  CASE WHEN ?3 != '' THEN 1 ELSE 0 END AS userExplicitlySetAccount,
  CASE WHEN ?4 != '' THEN 1 ELSE 0 END AS userExplicitlySetCategory,
  1 AS userExplicitlySetPayeeOrTransfer,
  0 AS userExplicitlySetIsOutflow,

  0 AS saveFlags

FROM
  Accounts A

WHERE
  ?2 != ''
AND
  A.budgetVersionId = ?1
AND
  A.isTombstone = 0
AND
  A.hidden = 0

ORDER BY
  A.onBudget DESC,
  A.sortableIndex

LIMIT 1
)


UNION ALL


/**************************************************
    Category Specified - Transaction Available
***************************************************/

/* Default account to the most recent transaction for this category. */
SELECT * FROM
(
SELECT
  '02_category_specified_transaction_available' AS priority,

  ?1 AS budgetVersionId,

  1 AS enableSave,
  0 AS enableDelete,

  NULL AS transactionId,

  strftime('%s', date('now', 'localtime')) * 1000 AS date,

  0 AS amount,

  NULL AS payeeId,
  NULL AS payeeDisplayName,
  NULL AS addPayeeName,

  NULL AS payeeLocationId,
  0 AS payeeLatitude,
  0 AS payeeLongitude,

  NULL AS splitsPrototypeTransactionId,

  C.entityId AS categoryId,
  C.name AS categoryName,
  C.internalName AS categoryInternalName,

  T.accountId AS accountId,
  A.accountName AS accountName,
  A.onBudget AS accountOnBudget,

  NULL AS transferTransactionId,
  TA.entityId AS transferAccountId,
  TA.accountName AS transferAccountName,
  coalesce(TA.onBudget, 0) AS transferAccountOnBudget,

  NULL AS memo,
  NULL AS checkNumber,

  'Uncleared' AS cleared,

  NULL as flag,

  0 AS isSplitTransferCounterpart,
  NULL AS splitTransferParentId,

  NULL AS splitEntries,
  NULL AS validationMessages,

  0 AS userExplicitlySetAccount,
  1 AS userExplicitlySetCategory,
  0 AS userExplicitlySetPayeeOrTransfer,
  0 AS userExplicitlySetIsOutflow,

  0 AS saveFlags

FROM
  Transactions T

 INNER JOIN /* Requires valid account */
  Accounts A
 ON
  T.accountId = A.entityId

 LEFT JOIN /* Okay to not have a transfer account */
  Accounts TA
 ON
  T.transferTransactionId = TA.entityId

INNER JOIN /* Requires a valid sub category */
  SubCategories C
ON
  T.subCategoryId = C.entityId

INNER JOIN /* Requires a valid master category */
  MasterCategories M
ON
  C.masterCategoryId = M.entityId

WHERE
  ?4 != ''
AND
  T.budgetVersionId = ?1
AND
  T.isTombstone = 0
 AND
  T.subCategoryId = ?4
AND
  T.transferSubTransactionId IS NULL
AND
  T.dateEnteredFromSchedule IS NULL
AND
  (T.source IS NULL OR T.source IN ('', 'Scheduler', 'Matched', 'Imported'))
AND
  A.budgetVersionId = ?1
AND
  A.isTombstone = 0
AND
  A.hidden = 0
AND
  (TA.budgetVersionId = ?1 OR TA.budgetVersionId IS NULL)
AND
  (TA.isTombstone = 0 OR TA.isTombstone IS NULL)
AND
  (TA.hidden = 0 OR TA.hidden IS NULL)

ORDER BY
  T.date DESC,
  T.entityId

LIMIT 1
)


UNION ALL


/**************************************************
    Category Specified - w/o Available Transaction
**************************************************/

/* Default account first account in sequence. */
SELECT * FROM
(
SELECT
  '03_category_specified_no_transaction_available' AS priority,

  ?1 AS budgetVersionId,

  1 AS enableSave,
  0 AS enableDelete,

  NULL AS transactionId,

  strftime('%s', date('now', 'localtime')) * 1000 AS date,

  0 AS amount,

  NULL AS payeeId,
  NULL AS payeeDisplayName,
  NULL AS addPayeeName,

  NULL AS payeeLocationId,
  0 AS payeeLatitude,
  0 AS payeeLongitude,

  NULL AS splitsPrototypeTransactionId,

  ?4 AS categoryId,
  (SELECT name FROM SubCategories WHERE entityId = ?4) AS categoryName,
  (SELECT internalName FROM SubCategories WHERE entityId = ?4) AS categoryInternalName,

  A.entityId AS accountId,
  A.accountName AS accountName,
  A.onBudget AS accountOnBudget,

  NULL AS transferTransactionId,
  NULL AS transferAccountId,
  NULL AS transferAccountName,
  0 AS transferAccountOnBudget,

  NULL AS memo,
  NULL AS checkNumber,

  'Uncleared' AS cleared,

  NULL as flag,

  0 AS isSplitTransferCounterpart,
  NULL AS splitTransferParentId,

  NULL AS splitEntries,
  NULL AS validationMessages,

  0 AS userExplicitlySetAccount,
  1 AS userExplicitlySetCategory,
  0 AS userExplicitlySetPayeeOrTransfer,
  0 AS userExplicitlySetIsOutflow,

  0 AS saveFlags

FROM
  Accounts A

WHERE
  ?4 != ''
AND
  A.budgetVersionId = ?1
AND
  A.isTombstone = 0
AND
  A.hidden = 0

ORDER BY
  A.onBudget DESC,
  A.sortableIndex

LIMIT 1
)


UNION ALL


/**************************************************
                Account Specified
***************************************************/

/* Default to account specified */
SELECT
  '04_account_specified' AS priority,

  ?1 AS budgetVersionId,

  1 AS enableSave,
  0 AS enableDelete,

  NULL AS transactionId,

  strftime('%s', date('now', 'localtime')) * 1000 AS date,

  0 AS amount,

  NULL AS payeeId,
  NULL AS payeeDisplayName,
  NULL AS addPayeeName,

  NULL AS payeeLocationId,
  0 AS payeeLatitude,
  0 AS payeeLongitude,

  NULL AS splitsPrototypeTransactionId,

  NULL AS categoryId,
  NULL AS categoryName,
  NULL AS categoryInternalName,

  A.entityId AS accountId,
  A.accountName AS accountName,
  A.onBudget AS accountOnBudget,

  NULL AS transferTransactionId,
  NULL AS transferAccountId,
  NULL AS transferAccountName,
  0 AS transferAccountOnBudget,

  NULL AS memo,
  NULL AS checkNumber,

  'Uncleared' AS cleared,

  NULL as flag,

  0 AS isSplitTransferCounterpart,
  NULL AS splitTransferParentId,

  NULL AS splitEntries,
  NULL AS validationMessages,

  1 AS userExplicitlySetAccount,
  0 AS userExplicitlySetCategory,
  0 AS userExplicitlySetPayeeOrTransfer,
  0 AS userExplicitlySetIsOutflow,

  0 AS saveFlags

FROM
  Accounts A

WHERE
  ?3 != ''
AND
  A.budgetVersionId = ?1
AND
  A.entityId = ?3


UNION ALL


/**************************************************
           Default Account by Transaction
***************************************************/

/* Default account to the most recent transaction. */
SELECT * FROM
(
SELECT
  '05_nothing_specified_transactions_available' AS priority,

  ?1 AS budgetVersionId,

  1 AS enableSave,
  0 AS enableDelete,

  NULL AS transactionId,

  strftime('%s', date('now', 'localtime')) * 1000 AS date,

  0 AS amount,

  NULL AS payeeId,
  NULL AS payeeDisplayName,
  NULL AS addPayeeName,

  NULL AS payeeLocationId,
  0 AS payeeLatitude,
  0 AS payeeLongitude,

  NULL AS splitsPrototypeTransactionId,

  NULL AS categoryId,
  NULL AS categoryName,
  NULL AS categoryInternalName,

  T.accountId AS accountId,
  A.accountName AS accountName,
  A.onBudget AS accountOnBudget,

  NULL AS transferTransactionId,
  NULL AS transferAccountId,
  NULL AS transferAccountName,
  0 AS transferAccountOnBudget,

  NULL AS memo,
  NULL AS checkNumber,

  'Uncleared' AS cleared,

  NULL as flag,

  0 AS isSplitTransferCounterpart,
  NULL AS splitTransferParentId,

  NULL AS splitEntries,
  NULL AS validationMessages,

  0 AS userExplicitlySetAccount,
  0 AS userExplicitlySetCategory,
  0 AS userExplicitlySetPayeeOrTransfer,
  0 AS userExplicitlySetIsOutflow,

  0 AS saveFlags

FROM
  Transactions T

INNER JOIN /* Requires valid account */
  Accounts A
ON
  T.accountId = A.entityId

WHERE
  T.budgetVersionId = ?1
AND
  T.isTombstone = 0
AND
  T.transferSubTransactionId IS NULL
AND
  T.dateEnteredFromSchedule IS NULL
AND
  (T.source IS NULL OR T.source IN ('', 'Scheduler', 'Matched', 'Imported'))
AND
  A.budgetVersionId = ?1
AND
  A.isTombstone = 0
AND
  A.hidden = 0

ORDER BY
  T.date DESC,
  T.entityId

LIMIT 1
)


UNION ALL


/**************************************************
         Default Account w/o Transactions
***************************************************/

/* Default account first account in sequence. */
SELECT * FROM
(
SELECT
  '06_nothing_specified_no_transactions_available' AS priority,

  ?1 AS budgetVersionId,

  1 AS enableSave,
  0 AS enableDelete,

  NULL AS transactionId,

  strftime('%s', date('now', 'localtime')) * 1000 AS date,

  0 AS amount,

  NULL AS payeeId,
  NULL AS payeeDisplayName,
  NULL AS addPayeeName,

  NULL AS payeeLocationId,
  0 AS payeeLatitude,
  0 AS payeeLongitude,

  NULL AS splitsPrototypeTransactionId,

  NULL AS categoryId,
  NULL AS categoryName,
  NULL AS categoryInternalName,

  A.entityId AS accountId,
  A.accountName AS accountName,
  A.onBudget AS accountOnBudget,

  NULL AS transferTransactionId,
  NULL AS transferAccountId,
  NULL AS transferAccountName,
  0 AS transferAccountOnBudget,

  NULL AS memo,
  NULL AS checkNumber,

  'Uncleared' AS cleared,

  NULL as flag,

  0 AS isSplitTransferCounterpart,
  NULL AS splitTransferParentId,

  NULL AS splitEntries,
  NULL AS validationMessages,

  0 AS userExplicitlySetAccount,
  0 AS userExplicitlySetCategory,
  0 AS userExplicitlySetPayeeOrTransfer,
  0 AS userExplicitlySetIsOutflow,

  0 AS saveFlags

FROM
  Accounts A

WHERE
  A.budgetVersionId = ?1
AND
  A.isTombstone = 0
AND
  A.hidden = 0

ORDER BY
  A.onBudget DESC,
  A.sortableIndex

LIMIT 1
)


UNION ALL


/**************************************************
            Fallback - No Accounts
***************************************************/

SELECT
  '99_nothing_specified_no_transactions_available_no_accounts_available' AS priority,

  ?1 AS budgetVersionId,

  1 AS enableSave,
  0 AS enableDelete,

  NULL AS transactionId,

  strftime('%s', date('now', 'localtime')) * 1000 AS date,

  0 AS amount,

  NULL AS payeeId,
  NULL AS payeeDisplayName,
  NULL AS addPayeeName,

  NULL AS payeeLocationId,
  0 AS payeeLatitude,
  0 AS payeeLongitude,

  NULL AS splitsPrototypeTransactionId,

  NULL AS categoryId,
  NULL AS categoryName,
  NULL AS categoryInternalName,

  NULL AS accountId,
  NULL AS accountName,
  0 AS accountOnBudget,

  NULL AS transferTransactionId,
  NULL AS transferAccountId,
  NULL AS transferAccountName,
  0 AS transferAccountOnBudget,

  NULL AS memo,
  NULL AS checkNumber,

  'Uncleared' AS cleared,

  NULL as flag,

  0 AS isSplitTransferCounterpart,
  NULL AS splitTransferParentId,

  NULL AS splitEntries,
  NULL AS validationMessages,

  0 AS userExplicitlySetAccount,
  0 AS userExplicitlySetCategory,
  0 AS userExplicitlySetPayeeOrTransfer,
  0 AS userExplicitlySetIsOutflow,

  0 AS saveFlags

 /**************************************************
    Final Ordering for All Rows Based on Priority
 ***************************************************/

 ORDER BY
   priority

 LIMIT 1
 )
`,
                arguments: [budgetVersionId, payeeId, accountId, subCategoryId]
            }
        }

        public static splitEntries(budgetVersionId:string, transactionId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "splitEntries",
                query: `
/* Query to get split entries for a specified transaction */

SELECT
  S.entityId AS transactionId,

  S.amount AS amount,
  CASE WHEN S.amount <= 0 THEN 1 ELSE 0 END AS isOutflow,

  S.subCategoryId AS categoryId,
  C.name AS categoryName,
  C.internalName AS categoryInternalName,

  S.transferTransactionId AS transferTransactionId,
  S.transferAccountId AS transferAccountId,
  A.accountName AS transferAccountName,
  coalesce(A.onBudget, 0) AS transferAccountOnBudget,

  S.payeeId AS payeeId,
  P.name AS payeeDisplayName,
  NULL AS addPayeeName,

  S.memo AS memo,

  COALESCE(S.sortableIndex, 0) AS sortableIndex

FROM
  SubTransactions S

LEFT JOIN
  SubCategories C
ON
  S.subCategoryId = C.entityId

LEFT JOIN
  Accounts A
ON
  S.transferAccountId = A.entityId

LEFT JOIN
  Payees P
ON
 S.payeeId = P.entityId

WHERE
  S.budgetVersionId = ?1

AND
  S.transactionId = ?2

AND
  S.isTombstone = 0

ORDER BY
  S.sortableIndex,
  S.entityId

                `,
            arguments: [budgetVersionId, transactionId]
        }
    }

        public static includeDebtPaymentCategories = 1;
        public static excludeDebtPaymentCategories = 0;

        public static categorySelection(budgetVersionId:string, month:ynab.utilities.DateWithoutTime, includeDebtPaymentCategories:number):ynab.interfaces.adapters.IDatabaseQuery {
            var monthString = month ? month.toISOString() : null;

            return {
                name: "categorySelection",
                query: `
/* Query for Transaction Category Selection
?1 = budgetVersionId
?2 = month - string in the form '2014-12-01' (so we can get sub category balances)
?3 = include debt payment (credit card) categories 1 (yes) or 0 (no)

Pinned section comes first.
Income section comes next.
Master / Sub Categories come after those two.

Anything where is_section_header = 1 is not user selectable.
Anything where is_section_header = 0 is user selectable.

For anything user selectable, entity_id will be a SubCategory entityId.
*/

SELECT is_section_header, entity_id, name, amount, internal_name FROM
(

/* Start Pinned Pseudo Master Category */

SELECT * FROM
  (
  SELECT
    1 as is_section_header,
    0 as entity_id,
    'PseudoMasterCategory/__Pinned__' as internal_name,
    'Pinned' as name,
    0 as amount,

    0 as seq_basic,
    -2147483651 as seq_pinned,
    -2147483651 as seq_mc,
    -2147483649 as seq_sc

  FROM
    SubCategories SC

  LEFT JOIN
    MonthlySubCategoryBudgets MSCB
  ON
    MSCB.subCategoryId = SC.entityId

  WHERE
    COALESCE(SC.pinnedIndex, 0) != 0
  AND
    SC.budgetVersionId = ?1
  AND
    MSCB.budgetVersionId = ?1
  AND
    SC.isTombstone = 0
  AND
    MSCB.masterCategoryId IS NOT NULL /* MC not tombstone */
  AND
    COALESCE(MSCB.masterCategoryInternalName, '') != 'MasterCategory/__Internal__'
  AND
    COALESCE(MSCB.masterCategoryInternalName, '') != 'MasterCategory/__Hidden__'
  AND
    MSCB.month = ?2

  LIMIT 1
)

/* END Pinned Pseudo Master Category */

UNION

/* BEGIN Pinned Categories */

SELECT
  0 as is_section_header,
  SC.entityId as entity_id,
  SC.internalName as internal_name,
  SC.name as name,
  MSCB.balance as amount,

  0 as seq_basic,
  SC.pinnedIndex as seq_pinned,
  -2147483651 as seq_mc,
  -2147483649 as seq_sc

FROM
  SubCategories SC

LEFT JOIN
  MonthlySubCategoryBudgets MSCB
ON
  MSCB.subCategoryId = SC.entityId

LEFT JOIN
  MasterCategories MC
ON
  MC.entityId = SC.masterCategoryId

WHERE
  COALESCE(SC.pinnedIndex, 0) != 0
AND
  SC.budgetVersionId = ?1
AND
  MSCB.budgetVersionId = ?1
AND
  SC.isTombstone = 0
AND
  MC.isTombstone = 0
AND
  MSCB.masterCategoryId IS NOT NULL /* MC not tombstone */
AND
  COALESCE(MSCB.masterCategoryInternalName, '') != 'MasterCategory/__Internal__'
AND
  COALESCE(MSCB.masterCategoryInternalName, '') != 'MasterCategory/__Hidden__'
AND
  MSCB.month = ?2

/* END Pinned Categories */

UNION

/* Start Income Pseudo Master Category */

SELECT * FROM
  (
  SELECT
    1 as is_section_header,
    0 as entity_id,
    'PseudoMasterCategory/__Income__' as internal_name,
    'Inflow' as name,
    0 as amount,

    1 as seq_basic,
    -2147483649 as seq_pinned,
    0 as seq_mc,
    -2147483649 as seq_sc
)

/* END Income Pseudo Master Category */

UNION

/* Start Income Category */

SELECT * FROM
  (
  SELECT
    0 as is_section_header,
    SC.entityId as entity_id,
    SC.internalName as internal_name,
    'To be Budgeted' as name,

    MB.availableToBudget -
    (SELECT CASE
      WHEN MB.availableToBudget <= 0 OR fundedInFuture.mySum <= 0 THEN 0
      WHEN fundedInFuture.mySum < MB.availableToBudget THEN fundedInFuture.mySum
      ELSE MB.availableToBudget
    END
    FROM (
      (SELECT SUM(budgeted) as mySum FROM MonthlyBudgets WHERE budgetVersionId = ?1 AND month > ?2) as fundedInFuture
    ))
    as amount,

    1 as seq_basic,
    -2147483649 as seq_pinned,
    0 as seq_mc,
    -2147483648 as seq_sc

  FROM
    SubCategories SC, MonthlyBudgets MB

  WHERE
    SC.budgetVersionId = ?1
  AND
    MB.budgetVersionId = ?1
  AND
    MB.month = ?2
  AND
    SC.internalName = 'Category/__ImmediateIncome__'
)

/* END Income Category */

UNION

/* BEGIN Master Categories */

SELECT
  1 as is_section_header,
  MC.entityId as entity_id,
  MC.internalName as internal_name,
  MC.name as name,
  SUM(MSCB.balance) as amount,

  2 as seq_basic,
  -2147483649 as seq_pinned,
  MC.sortableIndex as seq_mc,
  -2147483649 as seq_sc

FROM
  MasterCategories MC

LEFT JOIN
  MonthlySubCategoryBudgets MSCB
ON
  MC.entityId = MSCB.masterCategoryId

WHERE
  MC.budgetVersionId = ?1
AND
  MC.isTombstone = 0
AND
  MSCB.budgetVersionId = ?1
AND
  COALESCE(MC.internalName, '') != 'MasterCategory/__Internal__'
AND
  COALESCE(MC.internalName, '') != 'MasterCategory/__Hidden__'
AND
  (CAST(?3 AS INTEGER) != 0 OR COALESCE(MC.internalName, '') != 'MasterCategory/__DebtPayment__')
AND
  MSCB.month = ?2
AND
  /* only include master categories where we have at least one active (non-deleted & non-hidden) subcategory */
  (SELECT COUNT(*)
        FROM
            SubCategories SC
        WHERE
            SC.budgetVersionId = ?1
        AND
            SC.masterCategoryId = entity_id
        AND
            SC.isTombstone = 0
        AND
            SC.isHidden = 0
    ) > 0

GROUP BY
  MC.entityId

/* END Master Categories */

UNION

/* BEGIN Sub Categories */

SELECT
  0 as is_section_header,
  SC.entityId as entity_id,
  SC.internalName as internal_name,
  SC.name as name,
  MSCB.balance as amount,

  2 as seq_basic,
  -2147483649 as seq_pinned,
  MSCB.masterCategorySortableIndex as seq_mc,
  SC.sortableIndex as seq_sc

FROM
  SubCategories SC

LEFT JOIN
  MonthlySubCategoryBudgets MSCB
ON
  MSCB.subCategoryId = SC.entityId

LEFT JOIN
  MasterCategories MC
ON
  MC.entityId = SC.masterCategoryId

WHERE
  SC.budgetVersionId = ?1
AND
  MSCB.budgetVersionId = ?1
AND
  SC.isTombstone = 0
AND
  MC.isTombstone = 0
AND
  MSCB.masterCategoryId IS NOT NULL /* MC not tombstone */
AND
  COALESCE(MSCB.masterCategoryInternalName, '') != 'MasterCategory/__Internal__'
AND
  COALESCE(MSCB.masterCategoryInternalName, '') != 'MasterCategory/__Hidden__'
AND
  (CAST(?3 AS INTEGER) != 0 OR COALESCE(MSCB.masterCategoryInternalName, '') != 'MasterCategory/__DebtPayment__')
AND
  MSCB.month = ?2

/* END Sub Categories */

ORDER BY
  seq_basic, seq_pinned, seq_mc, seq_sc
)
        `,
            arguments: [budgetVersionId, monthString, includeDebtPaymentCategories]
        }
    }

    public static filteredCategorySelection(budgetVersionId:string, month:ynab.utilities.DateWithoutTime, searchTerm:string, includeDebtPaymentCategories:number):ynab.interfaces.adapters.IDatabaseQuery {
        var monthString = month ? month.toISOString() : null;

        var subCatFrom = `
                SubCategories SC
            LEFT JOIN
                MonthlySubCategoryBudgets MSCB
            ON
                MSCB.subCategoryId = SC.entityId
        `;

        var subCatWhere = `
                SC.budgetVersionId = ?1
            AND
                MSCB.budgetVersionId = ?1
            AND
                SC.isTombstone = 0
            AND
                MSCB.masterCategoryId IS NOT NULL /* MC not tombstone */
            AND
                COALESCE(MSCB.masterCategoryInternalName, '') != 'MasterCategory/__Internal__'
            AND
                COALESCE(MSCB.masterCategoryInternalName, '') != 'MasterCategory/__Hidden__'
            AND
                (CAST(?4 AS INTEGER) != 0 OR COALESCE(MSCB.masterCategoryInternalName, '') != 'MasterCategory/__DebtPayment__')
            AND
                MSCB.month = ?2
            AND
                SC.name LIKE '%' || ?3 || '%' ESCAPE '!'
        `;

        return {
            name: "filteredCategorySelection",
            query: `
            /* Query for Transaction Category Selection
             ?1 = budgetVersionId
             ?2 = month - string in the form '2014-12-01' (so we can get sub category balances)
             ?3 = search term
             ?4 = include debt payment (credit card) categories 1 (yes) or 0 (no)

             Pinned section comes first.
             Master / Sub Categories come next.

             Anything where is_section_header = 1 is not user selectable.
             Anything where is_section_header = 0 is user selectable.

             For anything user selectable, entity_id will be a SubCategory entityId.
             */

            SELECT is_section_header, entity_id, name, amount, internal_name FROM
            (

            /* BEGIN Master Categories */

            SELECT
                1 as is_section_header,
                MC.entityId as entity_id,
                MC.internalName as internal_name,
                MC.name as name,
                SUM(MSCB.balance) as amount,
                MC.sortableIndex as seq_mc,
                -2147483649 as seq_sc

            FROM
                MasterCategories MC
            LEFT JOIN
                MonthlySubCategoryBudgets MSCB
            ON
                MC.entityId = MSCB.masterCategoryId

            WHERE
                MC.budgetVersionId = ?1
            AND
                MC.isTombstone = 0
            AND
                MSCB.budgetVersionId = ?1
            AND
                COALESCE(MC.internalName, '') != 'MasterCategory/__Internal__'
            AND
                COALESCE(MC.internalName, '') != 'MasterCategory/__Hidden__'
            AND
                (CAST(?4 AS INTEGER) != 0 OR COALESCE(MC.internalName, '') != 'MasterCategory/__DebtPayment__')
            AND
                MSCB.month = ?2
            AND
                /* only include master categories where at least one subcategory matches the filter */
                (SELECT COUNT(*)
                    FROM  ${subCatFrom}
                    WHERE ${subCatWhere} AND SC.masterCategoryId=MC.entityId
                ) > 0

            GROUP BY
                MC.entityId

            /* END Master Categories */

            UNION

            /* BEGIN Sub Categories */

            SELECT
                0 as is_section_header,
                SC.entityId as entity_id,
                SC.internalName as internal_name,
                SC.name as name,
                MSCB.balance as amount,
                MSCB.masterCategorySortableIndex as seq_mc,
                SC.sortableIndex as seq_sc

            FROM
                ${subCatFrom}

            LEFT JOIN
              MasterCategories MC
            ON
              MC.entityId = SC.masterCategoryId

            WHERE
                ${subCatWhere}
            AND
              MC.isTombstone = 0

            /* END Sub Categories */

            ORDER BY
                seq_mc, seq_sc
        )
        `,
            arguments: [budgetVersionId, monthString, searchTerm, includeDebtPaymentCategories]
        }
    }

    public static accountSelection(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {

        return {
            name: "accountSelection",
            query: `
/* Query for Transaction Account Selection
?1 = budgetVersionId

On-Budget section comes first.
Off-Budget section comes next.

Anything where is_section_header = 1 is not user selectable.
Anything where is_section_header = 0 is user selectable.

For anything user selectable, entity_id will be an Account entityId.
*/

SELECT is_section_header, entity_id, name, amount, internal_name FROM
(

/* Begin On-Budget Section Header */
SELECT * FROM
(
    SELECT
        1 AS is_section_header,
        NULL AS entity_id,
        'Budget' AS name,
        NULL AS amount,
        'on-budget' AS internal_name,
        1 AS is_on_budget,
        0 AS seq
    FROM
        Accounts A

    WHERE
        A.budgetVersionId = ?1
    AND
        A.isTombstone = 0
    AND
        A.hidden = 0
    AND
        A.onBudget = 1

    LIMIT 1

/* End On-Budget Section Header */
)

UNION

/* Begin On-Budget Accounts */

SELECT
    0 AS is_section_header,
    A.entityId AS entity_id,
    A.accountName AS name,
    A.unclearedBalance + A.clearedBalance AS amount,
    'on-budget' AS internal_name,
    1 AS is_on_budget,
    A.sortableIndex AS seq

FROM
    Accounts A

WHERE
    A.budgetVersionId = ?1
AND
    A.isTombstone = 0
AND
    A.hidden = 0
AND
    A.onBudget = 1

/* End On-Budget Accounts */

UNION

/* Begin Off-Budget Section Header */
SELECT * FROM
(
    SELECT
        1 AS is_section_header,
        NULL AS entity_id,
        'Tracking' AS name,
        NULL AS amount,
        'off-budget' AS internal_name,
        0 AS is_on_budget,
        0 AS seq

    FROM
        Accounts A

    WHERE
        A.budgetVersionId = ?1
    AND
        A.isTombstone = 0
    AND
        A.hidden = 0
    AND
        A.onBudget = 0

    LIMIT 1

/* End Off-Budget Section Header */
)

UNION

/* Begin Off-Budget Accounts */

SELECT
    0 AS is_section_header,
    A.entityId AS entity_id,
    A.accountName AS name,
    A.unclearedBalance + A.clearedBalance AS amount,
    'off-budget' AS internal_name,
    0 AS is_on_budget,
    A.sortableIndex AS seq

FROM
    Accounts A

WHERE
    A.budgetVersionId = ?1
AND
    A.isTombstone = 0
AND
    A.hidden = 0
AND
    A.onBudget = 0

/* End Off-Budget Accounts */

ORDER BY
    is_on_budget DESC,
    is_section_header DESC,
    seq
)
        `,
            arguments: [budgetVersionId]
        }
    }

        public static payeeSelection(budgetVersionId:string, transactionAccountId:string, searchTerm:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "payeeSelection",
                query: `
/* Query for Transaction Payee Selection
 ?1 = budgetVersionId
 ?2 = accountId of primary account for the transaction.
 ?3 = search term

 Transfer account section comes first.
 First letter sections comes next.

 Anything where is_section_header = 1 is not user selectable.
 Anything where is_section_header = 0 is user selectable.

 For anything user selectable, entity_id will be an account
 entityId for transfers, or a payee entityId for payees.

 The amount column is unused for payee selection / transfer selection.

 NOTE: This query does not return the "Near You" section for geo
 payees. Since there is no reasonable means of calculating distance
 in SQLite cross-platform, native clients will need to prepend this
 section and the associated payee rows in native code.
 */

SELECT is_section_header, entity_id, name, account_name, amount, internal_name FROM
(

/* Begin Transfer Section Header */
SELECT * FROM
(
  SELECT
    1 AS is_section_header,
    1 AS transfer_section_header,
    0 AS on_budget,
    NULL AS entity_id,
    'Transfer Account' AS name,
    NULL AS account_name,
    NULL as amount,
    'transfer' AS internal_name,
    NULL AS seq

  FROM
    Payees P

  INNER JOIN
    Accounts A
  ON
    P.accountId = A.entityId

  WHERE
    P.budgetVersionId = ?1
  AND
    P.isTombstone = 0
  AND
    A.isTombstone = 0
  AND
    A.hidden = 0
  AND
    A.entityId != ?2
  AND
    p.name LIKE '%' || ?3 || '%' ESCAPE '!'

  LIMIT 1
)
/* End Transfer Section Header */

UNION ALL

/* Begin Transfer Accounts */
SELECT
  0 AS is_section_header,
  0 AS transfer_section_header,
  A.onBudget AS on_budget,
  A.entityId AS entity_id,
  'Transfer : ' || A.accountName AS name,
  A.accountName AS account_name,
  NULL as amount,
  CASE WHEN A.onBudget = 1 THEN 'transfer_on_budget' ELSE 'transfer_off_budget' END AS internal_name,
  A.sortableIndex AS seq

FROM
  Payees P

INNER JOIN
  Accounts A
ON
  P.accountId = A.entityId

WHERE
  P.budgetVersionId = ?1
AND
  P.isTombstone = 0
AND
  A.isTombstone = 0
AND
  A.hidden = 0
AND
  A.entityId != ?2
AND
  p.name LIKE '%' || ?3 || '%' ESCAPE '!'

/* End Transfer Accounts */

UNION ALL

/* Begin Payees First Letter Sections */

SELECT DISTINCT is_section_header, transfer_section_header, on_budget, entity_id, name, account_name, amount, internal_name, seq FROM
(
  SELECT
    1 AS is_section_header,
    0 AS transfer_section_header,
    0 AS on_budget,
    NULL AS entity_id,
    upper(substr(P.name, 1, 1)) AS name,
    NULL AS account_name,
    NULL as amount,
    'payee' AS internal_name,
    NULL as seq

  FROM
    Payees P

  WHERE
    P.budgetVersionId = ?1
  AND
    P.isTombstone = 0
  AND
    P.accountId IS NULL
  AND
    P.enabled = 1
  AND
    p.name LIKE '%' || ?3 || '%' ESCAPE '!'

)
/* End Payees First Letter Sections */


UNION ALL

/* Begin Payees Section */

SELECT
  0 AS is_section_header,
  0 AS transfer_section_header,
  0 AS on_budget,
  P.entityId AS entity_id,
  P.name AS name,
  NULL AS account_name,
  NULL as amount,
  'payee' AS internal_name,
  NULL as seq

FROM
  Payees P

WHERE
  P.budgetVersionId = ?1
AND
  P.isTombstone = 0
AND
  P.accountId IS NULL
AND
  P.enabled = 1
AND
  p.name LIKE '%' || ?3 || '%' ESCAPE '!'

/* End Payees Section */

ORDER BY
  transfer_section_header DESC,
  internal_name DESC,
  on_budget DESC,
  seq,
  name COLLATE NOCASE
)

        `,
            arguments: [budgetVersionId, transactionAccountId, searchTerm]
        }
    }

        public static splitTransferSelection(budgetVersionId:string, transactionAccountId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "splitTransferSelection",
                query: `

/* Query for Transaction Split Transfer Selection
?1 = budgetVersionId
?2 = accountId of primary account for the transaction.

Anything where is_section_header = 1 is not user selectable.
Anything where is_section_header = 0 is user selectable.

For anything user selectable, entity_id will be an account
entityId.

The amount column is unused for transfer selection.
*/

SELECT is_section_header, entity_id, name, amount, internal_name FROM
(

/* Begin Transfer Section Header */
SELECT * FROM
  (
  SELECT
    1 AS is_section_header,
    NULL AS entity_id,
    'Transfer Account' AS name,
    NULL as amount,
    'transfer' AS internal_name,
    -2147483649 as seq_sc

  FROM
    Payees P

  LEFT JOIN
    Accounts A
  ON
    P.accountId = A.entityId

  WHERE
    P.budgetVersionId = ?1
  AND
    P.isTombstone = 0
  AND
    P.enabled = 1
  AND
    P.accountId IS NOT NULL
  AND
    A.hidden = 0
  AND
    A.entityId != ?2

  LIMIT 1
)
/* End Transfer Section Header */

UNION ALL

/* Begin Transfer Accounts */
SELECT
  0 AS is_section_header,
  A.entityId AS entity_id,
  'Transfer: ' || A.accountName AS name,
  NULL as amount,
  CASE WHEN A.onBudget = 1 THEN 'transfer_on_budget' ELSE 'transfer_off_budget' END AS internal_name,
  A.sortableIndex as seq_sc

FROM
  Payees P

LEFT JOIN
  Accounts A
ON
  P.accountId = A.entityId

WHERE
  P.budgetVersionId = ?1
AND
  P.isTombstone = 0
AND
  P.enabled = 1
AND
  P.accountId IS NOT NULL
AND
  A.hidden = 0
AND
  A.entityId != ?2

/* End Transfer Accounts */

ORDER BY
  is_section_header DESC, seq_sc
)
        `,
            arguments: [budgetVersionId, transactionAccountId]
        }
    }

}

}
