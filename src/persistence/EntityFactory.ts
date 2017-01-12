import * as budgetEntities from '../interfaces/budgetEntities';
import * as catalogEntities from '../interfaces/catalogEntities';
import { DataFormats, DateWithoutTime, KeyGenerator } from '../utilities';
import { AccountTypes, ClearedFlag, TransactionFrequency, TransactionFlag, SubCategoryType } from '../constants';

export class EntityFactory {

	public static createNewBudget():catalogEntities.IBudget {

		var currentMonth = DateWithoutTime.createForCurrentMonth();
		var budget:catalogEntities.IBudget = {
			entityId: KeyGenerator.generateUUID(),
			isTombstone: 0,
			budgetName: "",
			lastAccessedOn: null,
			dataFormat: JSON.stringify(DataFormats.locale_mappings["en_US"]),
			deviceKnowledge: 0
		}

		return budget;
	}
	
	public static createNewAccount(budgetId:string = null):budgetEntities.IAccount {

		var account:budgetEntities.IAccount = {
			budgetId: budgetId,
			entityId: KeyGenerator.generateUUID(),
			isTombstone: 0,
			accountType: AccountTypes.Checking,
			accountName: null,
			lastEnteredCheckNumber: null,
			lastReconciledDate: null,
			lastReconciledBalance: null,
			closed: 0,
			sortableIndex: 0,
			onBudget: 1,
			note: null,
			clearedBalance: 0,
			unclearedBalance: 0,
			infoCount: 0,
			warningCount: 0,
			errorCount: 0,
			deviceKnowledge: 0,
			deviceKnowledgeForCalculatedFields: 0
		};

		return account;
	}

	public static createNewMasterCategory(budgetId:string = null):budgetEntities.IMasterCategory {

		var mastetCategory:budgetEntities.IMasterCategory = {
			budgetId: budgetId,
			entityId: KeyGenerator.generateUUID(),
			isTombstone: 0,
			internalName: null,
			deletable: 1,
			sortableIndex: 0,
			name: null,
			note: null,
			isHidden: 0,
			deviceKnowledge: 0
		}

		return mastetCategory;
	}

	public static createNewSubCategory(budgetId:string = null):budgetEntities.ISubCategory {

		var subCategory:budgetEntities.ISubCategory = {
			budgetId: budgetId,
			entityId: KeyGenerator.generateUUID(),
			isTombstone: 0,
			masterCategoryId: null,
			accountId: null,
			internalName: null,
			sortableIndex: 0,
			pinnedIndex: null,
			name: null,
			type: SubCategoryType.Default,
			note: null,
			isHidden: 0,
			goalType: null,
			goalCreationMonth: null,
			targetBalance: null,
			targetBalanceMonth: null,
			monthlyFunding: null,
			deviceKnowledge: 0
		}

		return subCategory;
	}

	public static createNewPayee(budgetId:string = null):budgetEntities.IPayee {

		var payee:budgetEntities.IPayee = {
			budgetId: budgetId,
			entityId: KeyGenerator.generateUUID(),
			isTombstone: 0,
			accountId: null,
			enabled: 1,
			autoFillSubCategoryId: null,
			name: null,
			internalName: null,
			deviceKnowledge: 0
		}

		return payee;
	}

	public static createNewMonthlyBudget(budgetId:string, month:DateWithoutTime):budgetEntities.IMonthlyBudget {

		var monthlyBudget:budgetEntities.IMonthlyBudget = {

			budgetId: budgetId,
			entityId: KeyGenerator.getMonthlyBudgetIdentity(budgetId, month),
			isTombstone: 0,
			month: month.toISOString(),
			note: null,
			previousIncome: 0,
			immediateIncome: 0,
			budgeted: 0,
			cashOutflows: 0,
			creditOutflows: 0,
			balance: 0,
			overSpent: 0,
			availableToBudget: 0,
			uncategorizedCashOutflows: 0, 
			uncategorizedCreditOutflows: 0,
			uncategorizedBalance: 0,
			hiddenBudgeted: 0,
			hiddenCashOutflows: 0,
			hiddenCreditOutflows: 0,
			hiddenBalance: 0,
			additionalToBeBudgeted: 0,
			ageOfMoney: 0,
			deviceKnowledge: 0,
			deviceKnowledgeForCalculatedFields: 0
		}

		return monthlyBudget;
	}

	public static createNewMonthlySubCategoryBudget(budgetId:string, subCategoryId:string, month:DateWithoutTime):budgetEntities.IMonthlySubCategoryBudget {

		var monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget = {

				budgetId: budgetId,
				entityId: KeyGenerator.getMonthlySubCategoryBudgetIdentity(subCategoryId, month),
				isTombstone: 0,
				monthlyBudgetId: KeyGenerator.getMonthlyBudgetIdentity(budgetId, month),
				subCategoryId: subCategoryId,
				budgeted: 0,
				note: null,
				month: month.toISOString(),
				cashOutflows: 0,
				positiveCashOutflows: 0,
				creditOutflows: 0,
				balance: 0,
				budgetedCashOutflows: 0,
				budgetedCreditOutflows: 0,
				unBudgetedCashOutflows: 0,
				unBudgetedCreditOutflows: 0,
				budgetedPreviousMonth: 0,
				spentPreviousMonth: 0,
				paymentPreviousMonth: 0,
				balancePreviousMonth: 0,
				budgetedAverage: 0,
				spentAverage: 0,
				paymentAverage: 0,
				budgetedSpending: 0,
				allSpending: 0,
				allSpendingSinceLastPayment: 0,
				transactionsCount: 0,
				upcomingTransactions: 0,
				upcomingTransactionsCount: 0,
				additionalToBeBudgeted: 0,
				goalTarget: 0,
				goalOverallFunded: 0,
				goalOverallLeft: 0,
				goalUnderFunded: 0,
				goalExpectedCompletion: 0,
				deviceKnowledge: 0,
				deviceKnowledgeForCalculatedFields: 0
		}

		return monthlySubCategoryBudget;
	}

	public static createNewScheduledTransaction(budgetId:string = null):budgetEntities.IScheduledTransaction {

		var scheduledTransaction:budgetEntities.IScheduledTransaction = {
			budgetId: budgetId,
			entityId: KeyGenerator.generateUUID(),
			isTombstone: 0,
			accountId: null,
			payeeId: null,
			subCategoryId: null,
			date: null,
			frequency: TransactionFrequency.Once,
			amount: 0,
			memo: null,
			flag: TransactionFlag.None,
			transferAccountId: null,
			upcomingInstances: null,
			deviceKnowledge: 0,
			deviceKnowledgeForCalculatedFields: 0
		};

		return scheduledTransaction;
	}

	public static createNewTransaction(budgetId:string = null):budgetEntities.ITransaction {

		var transaction:budgetEntities.ITransaction = {
			budgetId: budgetId,
			entityId: KeyGenerator.generateUUID(),
			isTombstone: 0,
			accountId: null,
			payeeId: null,
			subCategoryId: null,
			date: null,
			dateEnteredFromSchedule: null,
			amount: 0,
			memo: null,
			checkNumber: null,
			cleared: ClearedFlag.Uncleared,
			accepted: 1,
			flag: TransactionFlag.None,
			source: null,
			transferAccountId: null,
			transferTransactionId: null,
			scheduledTransactionId: null,
			matchedTransactionId: null,
			importId: null,
			cashAmount: 0,
			creditAmount: 0,
			subCategoryCreditAmountPreceding: 0,
			deviceKnowledge: 0,
			deviceKnowledgeForCalculatedFields: 0
		};

		return transaction;
	}
}