/// <reference path='../../_includes.ts' />

module ynab.queries {
    'use strict';

    export class TransactionQueries {

        public static get TransactionSourcesINClause():string { return `'', '${ynab.constants.TransactionSource.Scheduler}', '${ynab.constants.TransactionSource.Matched}', '${ynab.constants.TransactionSource.Imported}'`; }
        
        public static get TransactionLiabilityAccountTypesINClause():string { return `'${ynab.enums.AccountType[ynab.enums.AccountType.CreditCard]}', '${ynab.enums.AccountType[ynab.enums.AccountType.LineOfCredit]}', '${ynab.enums.AccountType[ynab.enums.AccountType.Mortgage]}', '${ynab.enums.AccountType[ynab.enums.AccountType.OtherLiability]}'`; }
                
        // *********************************************************************************************************
        // Queries for inserting data into the database
        // *********************************************************************************************************
        public static insertDatabaseObject(dbObject:ynab.interfaces.budgetEntities.IDatabaseTransaction):ynab.interfaces.adapters.IDatabaseQuery {

            // Note: If you update the query here because of change in columns, be sure to modify the insertion
            // queries in the MobileScheduledTransactionCalculations as well.
            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "transactions",
                query: `REPLACE INTO Transactions (
                          budgetVersionId, 
                          entityId, 
                          isTombstone, 
                          source, 
                          accountId, 
                          payeeId, 
                          subCategoryId, 
                          date, 
                          dateEnteredFromSchedule, 
                          amount, 
                          cashAmount, 
                          creditAmount, 
                          subCategoryCreditAmountPreceding, 
                          memo, 
                          cleared, 
                          accepted, 
                          checkNumber, 
                          flag, 
                          transferAccountId, 
                          transferTransactionId, 
                          transferSubTransactionId, 
                          scheduledTransactionId, 
                          matchedTransactionId, 
                          ynabId, 
                          importedPayee, 
                          importedDate, 
                          deviceKnowledge,
                          deviceKnowledgeForCalculatedFields
                        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                arguments: [
                    dbObject.budgetVersionId,
                    dbObject.entityId,
                    dbObject.isTombstone,
                    dbObject.source ? dbObject.source : null,
                    dbObject.accountId,
                    dbObject.payeeId ? dbObject.payeeId : null,
                    dbObject.subCategoryId ? dbObject.subCategoryId : null,
                    dbObject.date,
                    dbObject.dateEnteredFromSchedule ? dbObject.dateEnteredFromSchedule : null,
                    dbObject.amount,
                    dbObject.cashAmount,
                    dbObject.creditAmount,
                    dbObject.subCategoryCreditAmountPreceding,
                    dbObject.memo ? dbObject.memo : null,
                    dbObject.cleared,
                    dbObject.accepted,
                    dbObject.checkNumber ? dbObject.checkNumber : null,
                    dbObject.flag ? dbObject.flag : null,
                    dbObject.transferAccountId ? dbObject.transferAccountId : null,
                    dbObject.transferTransactionId ? dbObject.transferTransactionId : null,
                    dbObject.transferSubTransactionId ? dbObject.transferSubTransactionId : null,
                    dbObject.scheduledTransactionId ? dbObject.scheduledTransactionId : null,
                    dbObject.matchedTransactionId ? dbObject.matchedTransactionId : null,
                    dbObject.ynabId ? dbObject.ynabId : null,
                    dbObject.importedPayee ? dbObject.importedPayee : null,
                    dbObject.importedDate ? dbObject.importedDate : null,
                    dbObject.deviceKnowledge,
                    dbObject.deviceKnowledgeForCalculatedFields
                ]
            };

            return query;
        }

        public static loadDatabaseObject(budgetVersionId:string, deviceKnowledge:number, deviceKnowledgeForCalculations:number):ynab.interfaces.adapters.IDatabaseQuery {

            var query:ynab.interfaces.adapters.IDatabaseQuery = {

                name: "be_transactions",
                query: `SELECT * FROM Transactions WHERE budgetVersionId = ?1 AND 
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
        public static getAllTransactions(budgetVersionId:string, includeTombstonedEntities:boolean = false):ynab.interfaces.adapters.IDatabaseQuery {

            if(includeTombstonedEntities) {
                return {
                    name: "transactions",
                    query: "Select * FROM Transactions WHERE budgetVersionId = ?",
                    arguments: [budgetVersionId]
                };
            }
            else {
                return {
                    name: "transactions",
                    query: "Select * FROM Transactions WHERE budgetVersionId = ? AND isTombstone = 0",
                    arguments: [budgetVersionId]
                };
            }
        }

        public static findTransactionByEntityId(budgetVersionId:string, entityId:string):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "transactions",
                query: "Select * FROM Transactions WHERE budgetVersionId = ? AND entityId = ?",
                arguments: [budgetVersionId, entityId]
            };
        }

        public static findTransactionsByDate(budgetVersionId:string, date:ynab.utilities.DateWithoutTime):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "transactions",
                query: `SELECT * 
                        FROM Transactions T
                        WHERE T.budgetVersionId = ?1
                        AND T.date = ?2
                        AND T.isTombstone = 0
                        AND COALESCE(T.source,'') IN (${TransactionQueries.TransactionSourcesINClause})`,
                arguments: [budgetVersionId, date.getUTCTime()]
            };
        }

        public static findTransactionsForAccountSinceDateOrderedByDateThenAmount(budgetVersionId:string, accountId:string, sinceDate:ynab.utilities.DateWithoutTime):ynab.interfaces.adapters.IDatabaseQuery {

            return {
                name: "transactions",
                query: `SELECT *
                        FROM Transactions T
                        WHERE T.budgetVersionId = ?1 
                          AND T.accountId = ?2
                          AND T.date >= ?3
                          AND T.isTombstone = 0
                          AND COALESCE(T.source,'') IN (${TransactionQueries.TransactionSourcesINClause})
                        ORDER BY T.date, T.amount`,
                arguments: [budgetVersionId, accountId, sinceDate.getUTCTime()]
            };
        }
        
        public static findTransactionsForAccount(budgetVersionId:string, accountId:string):ynab.interfaces.adapters.IDatabaseQuery {
            return TransactionQueries.findTransactions(budgetVersionId, 0, 0, accountId, null);
        }

        // This method will return both transactions and split sub transactions matching the category.
        public static findTransactionsForCategory(budgetVersionId:string, subCategoryId:string):ynab.interfaces.adapters.IDatabaseQuery {
            return TransactionQueries.findTransactions(budgetVersionId, 0, 0, null, subCategoryId);
        }

        public static findTransactionsForAllAccounts(budgetVersionId:string):ynab.interfaces.adapters.IDatabaseQuery {
            return TransactionQueries.findTransactions(budgetVersionId, 0, 0, null, null);
        }

        // If subCategoryId is specified, will return both transactions and sub transactions matching the category.
        // If '__uncategorized__' is specified as the subCategoryId, then will return transactions and sub transactions without a category.
        //
        // Note this query only returns transactions that are allowed to be visible in the UI.
        // It excludes raw_import and matched_import transaction sources.
        //
        public static findTransactions(budgetVersionId:string, startDateUTCTime:number, endDateUTCTime:number, accountId:string, subCategoryId:string):ynab.interfaces.adapters.IDatabaseQuery {
            return {
              name: "transactions",
              query: `

/* START main transactions */
${TransactionQueries.findTransactionsSELECTForMainTransactions()}
${TransactionQueries.findTransactionsFROMAndJOINsForMainTransactions()}
${TransactionQueries.findTransactionsWHEREForMainTransactions()}
/* Optional Account Filter */
AND
  (?4 = '' OR T.accountId = ?4)

/* Optional Category Filter */
AND
  ((?5 = '' OR (T.subCategoryId = ?5 AND A.onBudget = 1)) OR (?5 = '__uncategorized__' AND T.subCategoryId IS NULL AND A.onBudget = 1 AND (TA.onBudget = 0 OR TA.onBudget IS NULL)))

/* END main transactions */

UNION ALL

/* START category sub-transactions */
${TransactionQueries.findTransactionsSELECTForSubTransactions()}
${TransactionQueries.findTransactionsFROMAndJOINsForSubTransactions()}
${TransactionQueries.findTransactionsWHEREForSubTransactions()}
/* Optional Account Filter */
AND
  (?4 = '' OR T.accountId = ?4)

/* Category is required */
AND
  ((?5 != '' AND ST.subCategoryId = ?5 AND A.onBudget = 1) OR (?5 = '__uncategorized__' AND ST.subCategoryId IS NULL AND A.onBudget = 1 AND (TA.onBudget = 0 OR TA.onBudget IS NULL)))

/* END category sub-transactions */

${TransactionQueries.findTransactionsORDER()}
            `,
            arguments: [budgetVersionId, startDateUTCTime, endDateUTCTime == 0 ? ynab.utilities.MathUtilities.MAX_JS_INT : endDateUTCTime, accountId == null ? '' : accountId, subCategoryId == null ? '' : subCategoryId]
          };
      }

        static findTransactionsSELECTForMainTransactions():string {
            return `
SELECT
  T.entityId as transactionId,

  T.date as date,

  T.amount as amount,

  T.accountId as accountId,
  A.accountName as accountName,

  CASE WHEN A.onBudget = 1 THEN T.subCategoryId ELSE NULL END as categoryId,
  CASE WHEN A.onBudget = 1 THEN SC.name ELSE NULL END as categoryName,
  CASE WHEN A.onBudget = 1 THEN SC.internalName ELSE NULL END as categoryInternalName,

  T.payeeId as payeeId,
  P.name as payeeName,

  T.memo as memo,
  T.cleared as cleared,
  T.checkNumber as checkNumber,
  T.flag as flag,

  T.transferAccountId as transferAccountId,
  TA.accountName as transferAccountName,

  T.transferTransactionId as transferTransactionId,
  T.transferSubTransactionId as transferSubTransactionId,

  CASE WHEN SC.internalName = 'Category/__Split__' THEN 1 ELSE 0 END as isSplit
`;
        }

        static findTransactionsSELECTForSubTransactions():string {
            return `
SELECT
  ST.transactionId as transactionId,

  T.date as date,

  ST.amount as amount,

  T.accountId as accountId,
  A.accountName as accountName,

  CASE WHEN A.onBudget = 1 THEN ST.subCategoryId ELSE NULL END as categoryId,
  CASE WHEN A.onBudget = 1 THEN SC.name ELSE NULL END as categoryName,
  CASE WHEN A.onBudget = 1 THEN SC.internalName ELSE NULL END as categoryInternalName,

  COALESCE(ST.payeeId, T.payeeId) as payeeId,
  COALESCE(SP.name, P.name) as payeeName,

  ST.memo as memo,
  T.cleared as cleared,
  ST.checkNumber as checkNumber,
  T.flag as flag,

  ST.transferAccountId as transferAccountId,
  TA.accountName as transferAccountName,

  T.transferTransactionId as transferTransactionId,
  T.transferSubTransactionId as transferSubTransactionId,

  0 as isSplit
`;
        }

        static findTransactionsFROMAndJOINsForMainTransactions():string {
            return`
FROM
  Transactions T

LEFT JOIN
  Accounts A
ON
  T.accountId = A.entityId

LEFT JOIN
  SubCategories SC
ON
  T.subCategoryId = SC.entityId

LEFT JOIN
  Payees P
ON
  T.payeeId = P.entityId

LEFT JOIN
  Accounts TA
ON
  T.transferAccountId = TA.entityId
`;
        }

        static findTransactionsFROMAndJOINsForSubTransactions():string {
            return `
FROM
  SubTransactions ST

LEFT JOIN
  Transactions T
ON ST.transactionId = T.entityId

LEFT JOIN
  Accounts A
ON
  T.accountId = A.entityId

LEFT JOIN
  SubCategories SC
ON
  ST.subCategoryId = SC.entityId

LEFT JOIN
  Payees P
ON
  T.payeeId = P.entityId

LEFT JOIN
  Payees SP
ON
  ST.payeeId = SP.entityId

LEFT JOIN
  Accounts TA
ON
  ST.transferAccountId = TA.entityId
`;
        }

        static findTransactionsWHEREForMainTransactions():string {
            return `
WHERE
  T.budgetVersionId = ?1
AND
  T.isTombstone = 0
AND
  COALESCE(T.source,'') IN (${TransactionQueries.TransactionSourcesINClause})
AND
  (A.isTombstone = 0 OR A.isTombstone IS NULL)
AND
  (TA.isTombstone = 0 OR TA.isTombstone IS NULL)
AND
  T.date >= ?2 /* Start date is inclusive */
AND
  T.date < ?3 /* End date is exclusive */
`;
        }

        static findTransactionsWHEREForSubTransactions():string {
            return `
WHERE
  T.budgetVersionId = ?1
AND
  T.isTombstone = 0
AND
  ST.isTombstone = 0
AND
  COALESCE(T.source,'') IN (${TransactionQueries.TransactionSourcesINClause})
AND
  (A.isTombstone = 0 OR A.isTombstone IS NULL)
AND
  (TA.isTombstone = 0 OR TA.isTombstone IS NULL)

AND
  T.date >= ?2 /* Start date is inclusive */

AND
  T.date < ?3 /* End date is exclusive */
`;
        }

        static findTransactionsORDER():string {
            return `
ORDER BY
  date DESC,
  amount DESC,
  transactionId
`;
        }

    }
}
