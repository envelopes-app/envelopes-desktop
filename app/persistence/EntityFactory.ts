import * as budgetEntities from '../interfaces/budgetEntities';
import * as catalogEntities from '../interfaces/catalogEntities';
import { KeyGenerator } from '../utilities';
import { AccountTypes } from '../constants';

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
			cleared: null,
			accepted: 1,
			flag: null,
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