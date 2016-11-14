/// <reference path='../_includes.ts' />

import * as _ from 'lodash';

import { executeSqlQueries } from './QueryExecutionUtility';
import { MigrationsManager } from './MigrationsManager';
import { Logger } from '../utilities';
import * as catalogEntities from '../interfaces/catalogEntities'; 
import * as budgetEntities from '../interfaces/budgetEntities'; 
import { IDatabaseQuery, IDatabaseMigration } from '../interfaces/persistence';
import { CalculationQueries } from './queries/miscQueries';

export class DatabaseFactory {

	public static get INITIAL_DATABASE_VERSION():number { return 0; }

	public createDatabase(refreshDatabaseAtStartup:boolean):Promise<any> {

		var runMigrations:boolean = false;
		var performFullCalcs:boolean = false;
		var migrations:Array<IDatabaseMigration>;
		var queryList:Array<IDatabaseQuery>;
		var migrationsManager:MigrationsManager = new MigrationsManager();
		var latestMigrationVersionNumber:number = migrationsManager.getLatestMigrationVersionNumber();

		return this.removeDatabase(refreshDatabaseAtStartup)
			.then((result:any)=>{

				// Get the initial database creation scripts and run them
				Logger.info("DatabaseFactory::Running create database scripts.");
				queryList = this.getCreateDatabaseScripts();
				return executeSqlQueries(queryList)
			})
			.then((result:any) => {

				// Get the database version number
				return this.getDatabaseVersion();
			})
			.then((currentVersionNumber:number)=>{

				// Get migration scripts based on this version number
				migrations = migrationsManager.getMigrationScripts(currentVersionNumber);
				if(migrations.length > 0) {

					runMigrations = true;
					Logger.info(`DatabaseFactory::Database is at version ${currentVersionNumber}. Upgrading to version ${latestMigrationVersionNumber}.`);
					// Iterate through all the migrations and get the queries that need to be run
					_.forEach(migrations, (migration:IDatabaseMigration)=>{

						queryList = queryList.concat( migration.getDatabaseQueries() );
						if(migration.requiresFullCalculations)
							performFullCalcs = true;
					});

					// Run the migration scripts
					if(queryList && queryList.length > 0)
						return executeSqlQueries(queryList);
					else
						return true;
				}
				else {

					Logger.info(`DatabaseFactory::Database is at version ${currentVersionNumber}. No migrations need to be run.`);
					return true;
				}
			})
			.then((result:any)=>{

				if(performFullCalcs)
					return this.queueFullCalculations();
				else
					return true;
			})
			.then((result:any)=>{

				if(runMigrations) {

					// Update the version number in the database to the latest
					queryList = [ {query: "UPDATE VersionInfo SET versionNumber = ?", arguments: [latestMigrationVersionNumber]} ];
					return executeSqlQueries(queryList)
				}
				else {

					// No migration scripts were run. We can just return from here.
					return null;
				}
			});
	}

	private queueFullCalculations():Promise<any> {

		var query = {
			name: "budgets",
			query: "SELECT * FROM Budgets WHERE isTombstone = 0",
			arguments: []
		}

		return executeSqlQueries([query])
			.then((result:any)=>{

				if(result.budgets && result.budgets.length > 0) {

					var queries = [];
					_.forEach(result.budgets, (budget:catalogEntities.IBudget)=>{
						// Get the query to queue complete calculations for this budget
						queries = queries.concat( CalculationQueries.getQueueCompleteCalculationQuery(budget.entityId) );
					});

					return executeSqlQueries(queries);
				}
				else
					return true;
			});
	}

	private removeDatabase(refreshDatabaseAtStartup:boolean):Promise<any> {

		if(refreshDatabaseAtStartup) {

			// Get the remove database scripts and run them
			Logger.info("DatabaseFactory::Running remove database scripts.");
			var queryList:Array<IDatabaseQuery> = this.getRemoveDatabaseScripts();
			return executeSqlQueries(queryList)
				.catch((error:Error) => {

					Logger.error(error);
					return Promise.resolve(null);
				});
		}
		else
			return Promise.resolve(null);
	}

	private getDatabaseVersion():Promise<number> {

		var queryList:Array<IDatabaseQuery> = [
			{name: "versionInfo", query: "SELECT * FROM VersionInfo", arguments: [] }
		];

		return executeSqlQueries(queryList)
			.then((result:any) => {

				var rows:Array<any> = result.versionInfo;
				if(rows && rows.length > 0) {

					// We have a version info row. Get the version number and return
					return rows[0].versionNumber;
				}
				else {

					// We need to insert a row into the database for the version number
					queryList = [ {query: "INSERT INTO VersionInfo VALUES (?)", arguments: [DatabaseFactory.INITIAL_DATABASE_VERSION]} ];
					return executeSqlQueries(queryList)
						.then((result:any) => {

							return DatabaseFactory.INITIAL_DATABASE_VERSION;
						});
				}
			})
			.catch((error:Error) => {

				Logger.error(error);
				return 0;
			});
	}

	private getCreateDatabaseScripts():Array<IDatabaseQuery> {

		var queryList:Array<IDatabaseQuery> = [

			// ********************************************************************************************
			// Create the catalog data tables
			// ********************************************************************************************
			{
				query: `CREATE TABLE IF NOT EXISTS 'VersionInfo' (
						'versionNumber' NUMERIC)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'CatalogKnowledge' (
						'currentDeviceKnowledge' NUMERIC DEFAULT 0 NOT NULL,
						'serverKnowledgeOfDevice' NUMERIC DEFAULT 0 NOT NULL,
						'deviceKnowledgeOfServer' NUMERIC DEFAULT 0 NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'Budgets' (
					'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
					'budgetName' VARCHAR NOT NULL,
					'dataFormat' VARCHAR,
					'lastAccessedOn' DATETIME,
					'firstMonth' VARCHAR,
					'lastMonth' VARCHAR,
					'isTombstone' BOOL NOT NULL,
					'deviceKnowledge' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'BudgetKnowledge' (
						'budgetId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'currentDeviceKnowledge' NUMERIC,
						'currentDeviceKnowledgeForCalculations' NUMERIC,
						'serverKnowledgeOfDevice' NUMERIC,
						'deviceKnowledgeOfServer' NUMERIC)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'CalculationQueue' (
						'queueId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'budgetId' VARCHAR NOT NULL,
						'calculationType' VARCHAR NOT NULL,
						'entityId' VARCHAR,
						'month' VARCHAR)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'GlobalSettings' (
						'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'settingName' VARCHAR NOT NULL,
						'settingValue' VARCHAR NOT NULL,
						'deviceKnowledge' NUMERIC NOT NULL)`,
				arguments: []
			},

			// ********************************************************************************************
			// Create the budget data tables
			// ********************************************************************************************
			{
				query: `CREATE TABLE IF NOT EXISTS 'Accounts' (
						'budgetId' VARCHAR NOT NULL,
						'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'isTombstone' BOOL NOT NULL,
						'accountType' VARCHAR NOT NULL,
						'accountName' VARCHAR NOT NULL,
						'lastEnteredCheckNumber' VARCHAR,
						'lastReconciledDate' DATETIME,
						'lastReconciledBalance' NUMERIC,
						'closed' BOOL NOT NULL,
						'sortableIndex' NUMERIC NOT NULL,
						'onBudget' BOOL NOT NULL,
						'note' VARCHAR,
						'clearedBalance' NUMERIC NOT NULL DEFAULT 0,
						'unclearedBalance' NUMERIC NOT NULL DEFAULT 0,
						'infoCount' NUMERIC NOT NULL DEFAULT 0,
						'warningCount' NUMERIC NOT NULL DEFAULT 0,
						'errorCount' NUMERIC NOT NULL DEFAULT 0,
						'deviceKnowledge' NUMERIC NOT NULL,
						'deviceKnowledgeForCalculatedFields' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'AccountMonthlyCalculations' (
						'budgetId' VARCHAR NOT NULL,
						'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'isTombstone' BOOL NOT NULL,
						'month' VARCHAR NOT NULL,
						'accountId' VARCHAR,
						'clearedBalance' NUMERIC NOT NULL DEFAULT 0,
						'unclearedBalance' NUMERIC NOT NULL DEFAULT 0,
						'infoCount' NUMERIC NOT NULL DEFAULT 0,
						'warningCount' NUMERIC NOT NULL DEFAULT 0,
						'errorCount' NUMERIC NOT NULL DEFAULT 0,
						'deviceKnowledge' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'AccountMappings' (
						'budgetId' VARCHAR NOT NULL,
						'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'isTombstone' BOOL NOT NULL,
						'accountId' VARCHAR NOT NULL,
						'fid' VARCHAR,
						'shortenedAccountId' VARCHAR,
						'hash' VARCHAR,
						'salt' VARCHAR,
						'dateSequence' VARCHAR,
						'shouldFlipPayeesMemos' BOOL NOT NULL DEFAULT 0,
						'shouldImportMemos' BOOL NOT NULL DEFAULT 0,
						'skipImport' BOOL NOT NULL DEFAULT 0,
						'deviceKnowledge' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'MasterCategories' (
						'budgetId' VARCHAR NOT NULL,
						'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'isTombstone' BOOL NOT NULL,
						'internalName' VARCHAR,
						'deletable' BOOL NOT NULL,
						'sortableIndex' NUMERIC NOT NULL,
						'name' VARCHAR NOT NULL,
						'note' VARCHAR,
						'isHidden' BOOL NOT NULL,
						'deviceKnowledge' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'MonthlyBudgets' (
						'budgetId' VARCHAR NOT NULL,
						'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'isTombstone' BOOL NOT NULL,
						'month' VARCHAR NOT NULL,
						'note' VARCHAR,
						'previousIncome' NUMERIC NOT NULL DEFAULT 0,
						'immediateIncome' NUMERIC NOT NULL DEFAULT 0,
						'budgeted' NUMERIC NOT NULL DEFAULT 0,
						'cashOutflows' NUMERIC NOT NULL DEFAULT 0,
						'creditOutflows' NUMERIC NOT NULL DEFAULT 0,
						'balance' NUMERIC NOT NULL DEFAULT 0,
						'overSpent' NUMERIC NOT NULL DEFAULT 0,
						'availableToBudget' NUMERIC NOT NULL DEFAULT 0,
						'uncategorizedCashOutflows' NUMERIC NOT NULL DEFAULT 0,
						'uncategorizedCreditOutflows' NUMERIC NOT NULL DEFAULT 0,
						'uncategorizedBalance' NUMERIC NOT NULL DEFAULT 0,
						'hiddenBudgeted' NUMERIC NOT NULL DEFAULT 0,
						'hiddenCashOutflows' NUMERIC NOT NULL DEFAULT 0,
						'hiddenCreditOutflows' NUMERIC NOT NULL DEFAULT 0,
						'hiddenBalance' NUMERIC NOT NULL DEFAULT 0,
						'additionalToBeBudgeted' NUMERIC NOT NULL DEFAULT 0,
						'ageOfMoney' NUMERIC NOT NULL DEFAULT 0,
						'deviceKnowledge' NUMERIC NOT NULL,
						'deviceKnowledgeForCalculatedFields' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'MonthlySubCategoryBudgets' (
						'budgetId' VARCHAR NOT NULL,
						'entityId' VARCHAR PRIMARY KEY  NOT NULL UNIQUE,
						'isTombstone' BOOL NOT NULL,
						'monthlyBudgetId' VARCHAR NOT NULL,
						'subCategoryId' VARCHAR NOT NULL,
						'budgeted' NUMERIC NOT NULL DEFAULT 0,
						'note' VARCHAR,
						'month' VARCHAR NOT NULL,
						'cashOutflows' NUMERIC NOT NULL DEFAULT 0,
						'positiveCashOutflows' NUMERIC NOT NULL DEFAULT 0,
						'creditOutflows' NUMERIC NOT NULL DEFAULT 0,
						'balance' NUMERIC NOT NULL DEFAULT 0,
						'budgetedCashOutflows' NUMERIC,
						'budgetedCreditOutflows' NUMERIC,
						'unBudgetedCashOutflows' NUMERIC,
						'unBudgetedCreditOutflows' NUMERIC,
						'budgetedPreviousMonth' NUMERIC,
						'spentPreviousMonth' NUMERIC,
						'paymentPreviousMonth' NUMERIC,
						'balancePreviousMonth' NUMERIC,
						'budgetedAverage' NUMERIC,
						'spentAverage' NUMERIC,
						'paymentAverage' NUMERIC,
						'budgetedSpending' NUMERIC,
						'allSpending' NUMERIC,
						'allSpendingSinceLastPayment' NUMERIC,
						'transactionsCount' NUMERIC,
						'upcomingTransactions' NUMERIC,
						'upcomingTransactionsCount' NUMERIC,
						'additionalToBeBudgeted' NUMERIC,
						'goalTarget' NUMERIC,
						'goalOverallFunded' NUMERIC,
						'goalOverallLeft' NUMERIC,
						'goalUnderFunded' NUMERIC,
						'goalExpectedCompletion' NUMERIC,
						'deviceKnowledge' NUMERIC NOT NULL,
						'deviceKnowledgeForCalculatedFields' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'Payees' (
						'budgetId' VARCHAR NOT NULL,
						'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'isTombstone' BOOL NOT NULL,
						'internalName' VARCHAR,
						'accountId' VARCHAR,
						'enabled' BOOL NOT NULL,
						'autoFillSubCategoryId' VARCHAR,
						'name' VARCHAR NOT NULL,
						'deviceKnowledge' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'PayeeLocations' (
						'budgetId' VARCHAR NOT NULL,
						'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'isTombstone' BOOL NOT NULL,
						'payeeId' VARCHAR NOT NULL,
						'latitude' NUMERIC NOT NULL,
						'longitude' NUMERIC NOT NULL,
						'deviceKnowledge' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'PayeeRenameConditions' (
						'budgetId' VARCHAR NOT NULL,
						'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'isTombstone' BOOL NOT NULL,
						'payeeId' VARCHAR NOT NULL,
						'operator' VARCHAR,
						'operand' VARCHAR,
						'deviceKnowledge' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'ScheduledSubTransactions' (
						'budgetId' VARCHAR NOT NULL,
						'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'isTombstone' BOOL NOT NULL,
						'scheduledTransactionId' VARCHAR NOT NULL,
						'payeeId' VARCHAR,
						'subCategoryId' VARCHAR,
						'amount' NUMERIC NOT NULL,
						'memo' VARCHAR,
						'transferAccountId' VARCHAR,
						'sortableIndex' NUMERIC,
						'deviceKnowledge' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'ScheduledTransactions' (
						'budgetId' VARCHAR NOT NULL,
						'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'isTombstone' BOOL NOT NULL,
						'accountId' VARCHAR NOT NULL,
						'payeeId' VARCHAR,
						'subCategoryId' VARCHAR,
						'date' DATETIME NOT NULL,
						'frequency' VARCHAR,
						'amount' NUMERIC NOT NULL,
						'memo' VARCHAR,
						'flag' VARCHAR,
						'transferAccountId' VARCHAR,
						'upcomingInstances' VARCHAR,
						'deviceKnowledge' NUMERIC NOT NULL,
						'deviceKnowledgeForCalculatedFields' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'Settings' (
						'budgetId' VARCHAR NOT NULL,
						'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'settingName' VARCHAR NOT NULL,
						'settingValue' VARCHAR,
						'deviceKnowledge' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'SubCategories' (
						'budgetId' VARCHAR NOT NULL,
						'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'isTombstone' BOOL NOT NULL,
						'masterCategoryId' VARCHAR NOT NULL,
						'accountId' VARCHAR,
						'internalName' VARCHAR,
						'sortableIndex' NUMERIC NOT NULL,
						'pinnedIndex' NUMERIC,
						'type' VARCHAR,
						'name' VARCHAR NOT NULL,
						'note' VARCHAR,
						'isHidden' BOOL NOT NULL,
						'goalType' VARCHAR,
						'goalCreationMonth' VARCHAR,
						'targetBalance' NUMERIC,
						'targetBalanceMonth' VARCHAR,
						'monthlyFunding' NUMERIC,
						'deviceKnowledge' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'SubTransactions' (
						'budgetId' VARCHAR NOT NULL,
						'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'isTombstone' BOOL NOT NULL,
						'transactionId' VARCHAR NOT NULL,
						'payeeId' VARCHAR,
						'subCategoryId' VARCHAR,
						'amount' NUMERIC NOT NULL,
						'cashAmount' NUMERIC,
						'creditAmount' NUMERIC,
						'subCategoryCreditAmountPreceding' NUMERIC,
						'memo' VARCHAR,
						'transferAccountId' VARCHAR,
						'transferTransactionId' VARCHAR,
						'sortableIndex' NUMERIC,
						'deviceKnowledge' NUMERIC NOT NULL,
						'deviceKnowledgeForCalculatedFields' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS 'Transactions' (
						'budgetId' VARCHAR NOT NULL,
						'entityId' VARCHAR PRIMARY KEY NOT NULL UNIQUE,
						'isTombstone' BOOL NOT NULL,
						'accountId' VARCHAR NOT NULL,
						'payeeId' VARCHAR,
						'subCategoryId' VARCHAR,
						'date' DATETIME NOT NULL,
						'dateEnteredFromSchedule' DATETIME,
						'amount' NUMERIC NOT NULL,
						'cashAmount' NUMERIC,
						'creditAmount' NUMERIC,
						'subCategoryCreditAmountPreceding' NUMERIC,
						'memo' VARCHAR,
						'checkNumber' VARCHAR,
						'cleared' VARCHAR NOT NULL,
						'accepted' BOOL NOT NULL,
						'flag' VARCHAR,
						'source' VARCHAR,
						'transferAccountId' VARCHAR,
						'transferTransactionId' VARCHAR,
						'transferSubTransactionId' VARCHAR,
						'scheduledTransactionId' VARCHAR,
						'matchedTransactionId' VARCHAR,
						'importId' VARCHAR,
						'importedPayee' VARCHAR,
						'importedDate' DATETIME,
						'deviceKnowledge' NUMERIC NOT NULL,
						'deviceKnowledgeForCalculatedFields' NUMERIC NOT NULL)`,
				arguments: []
			},
			{
				query: `CREATE TABLE IF NOT EXISTS TransactionCalculations(
							'budgetId' VARCHAR NOT NULL,
							'transactionId' VARCHAR,
							'subTransactionId' VARCHAR,
							'isTransaction' BOOLEAN,
							'isSubTransaction' BOOLEAN,
							'date' DATETIME,
							'month_epoch' NUMERIC,
							'amount' NUMERIC,
							'cashAmount' NUMERIC,
							'creditAmount' NUMERIC,
							'subCategoryCreditAmountPreceding' NUMERIC,
							'accountId' VARCHAR,
							'subCategoryId' VARCHAR,
							'payeeId' VARCHAR,
							'isCleared' BOOLEAN,
							'isAccepted' BOOLEAN,
							'isSplit' BOOLEAN,
							'isUncategorized' BOOLEAN,
							'isPayeeStartingBalance' BOOLEAN,
							'isImmediateIncomeSubCategory' BOOLEAN,
							'onBudget' BOOLEAN,
							'transferAccountId' VARCHAR,
							'affectsBudget' BOOLEAN,
							'isTransferAccountOnBudget' BOOLEAN,
							'isTransferAccountAsset' BOOLEAN,
							'isLiabilityAccount' BOOLEAN,
							'transferTransactionId' VARCHAR,
							'transferSubTransactionId' VARCHAR,
							'isReconciled' BOOLEAN);`,
				arguments: []
			},

			// ********************************************************************************************
			// Create the indexes
			// ********************************************************************************************
			{query: "CREATE INDEX IF NOT EXISTS 'Transactions_index_01' ON Transactions (budgetId, isTombstone, subCategoryId, accountId, date, transferAccountId)", arguments: []},
			{query: "CREATE INDEX IF NOT EXISTS 'SubTransactions_index_01' ON SubTransactions (budgetId, isTombstone, subCategoryId, transactionId, transferAccountId)", arguments: []},
			{query: "CREATE INDEX IF NOT EXISTS 'MasterCategories_index_01' ON MasterCategories (budgetId, isTombstone)", arguments: []},
			{query: "CREATE INDEX IF NOT EXISTS 'SubCategories_index_01' ON SubCategories (budgetId, isTombstone)", arguments: []},
			{query: `CREATE INDEX IF NOT EXISTS 'TransactionCalculations_index_1' ON TransactionCalculations (subCategoryId, month_epoch);`, arguments: []},
			{query: `CREATE INDEX IF NOT EXISTS 'TransactionCalculations_index_2' ON TransactionCalculations (accountId, month_epoch);`, arguments: []},

			// ********************************************************************************************
			// Insert the required data
			// ********************************************************************************************
			{query: "INSERT INTO VersionInfo VALUES (?)", arguments: [DatabaseFactory.INITIAL_DATABASE_VERSION]},
			{query: "INSERT INTO CatalogKnowledge VALUES (?,?,?)", arguments: [0, 0, 0]}
		];

		return queryList;
	}

	private getRemoveDatabaseScripts():Array<IDatabaseQuery> {

		var queryList:Array<IDatabaseQuery> = [
			{query: "DROP INDEX IF EXISTS 'Transactions_index_01'", arguments: []},
			{query: "DROP INDEX IF EXISTS 'SubTransactions_index_01'", arguments: []},
			{query: "DROP INDEX IF EXISTS 'MasterCategories_index_01'", arguments: []},
			{query: "DROP INDEX IF EXISTS 'SubCategories_index_01'", arguments: []},

			{query: "DROP TABLE IF EXISTS 'VersionInfo'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'CatalogKnowledge'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'Budgets'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'BudgetKnowledge'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'CalculationQueue'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'GlobalSettings'", arguments: []},

			{query: "DROP TABLE IF EXISTS 'Accounts'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'AccountMappings'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'MasterCategories'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'MonthlyBudgets'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'MonthlyBudgetCalculations'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'MonthlySubCategoryBudgets'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'MonthlySubCategoryBudgetCalculations'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'Payees'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'PayeeLocations'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'PayeeRenameConditions'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'ScheduledSubTransactions'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'ScheduledTransactions'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'Settings'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'SubCategories'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'SubTransactions'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'Transactions'", arguments: []},
			{query: "DROP TABLE IF EXISTS 'TransactionCalculations'", arguments: []}
		];

		return queryList;
	}
}