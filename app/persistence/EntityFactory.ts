import * as budgetEntities from '../interfaces/budgetEntities';
import * as catalogEntities from '../interfaces/catalogEntities';
import { KeyGenerator } from '../utilities';
import { AccountTypes, ClearedFlag, TransactionFlag, SubCategoryType } from '../constants';

export class EntityFactory {

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

	public static createNewSubTransaction(budgetId:string = null):budgetEntities.ISubTransaction {

		var subTransaction:budgetEntities.ISubTransaction = {
			budgetId: budgetId,
			entityId: KeyGenerator.generateUUID(),
			isTombstone: 0,
			transactionId: null,
			payeeId: null,
			subCategoryId: null,
			amount: 0,
			memo: null,
			transferAccountId: null,
			transferTransactionId: null,
			sortableIndex: 0,

			cashAmount: 0,
			creditAmount: 0,
			subCategoryCreditAmountPreceding: 0,
			deviceKnowledge: 0,
			deviceKnowledgeForCalculatedFields: 0
		};

		return subTransaction;
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
			cleared: ClearedFlag.Uncleared,
			accepted: 1,
			flag: TransactionFlag.None,
			transferAccountId: null,
			transferTransactionId: null,
			transferSubTransactionId: null,
			scheduledTransactionId: null,
			matchedTransactionId: null,
			importId: null,
			importedPayee: null,
			importedDate: null,
			cashAmount: 0,
			creditAmount: 0,
			subCategoryCreditAmountPreceding: 0,
			deviceKnowledge: 0,
			deviceKnowledgeForCalculatedFields: 0
		};

		return transaction;
	}
}