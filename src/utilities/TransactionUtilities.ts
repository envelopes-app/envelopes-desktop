/// <reference path='../_includes.ts' />

import * as _ from 'lodash';

import { EntityFactory } from '../persistence';
import { DateWithoutTime } from './DateWithoutTime';
import * as budgetEntities from '../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../interfaces/state';

export class TransactionUtilities {

	public static processTransactions(updatedEntities:ISimpleEntitiesCollection, existingEntities:IEntitiesCollection):void {

		if(!updatedEntities.transactions || updatedEntities.transactions.length == 0)
			return;

		var additionalUpdatedTransactions:Array<budgetEntities.ITransaction> = [];

		_.forEach(updatedEntities.transactions, (transaction)=>{

			// Check if we have an existing transaction corresponding to this transaction
			var existingTransaction = existingEntities.transactions.getEntityById(transaction.entityId);
			if(!existingTransaction) {

				// This is a new transaction. If it is a transfer transaction, then create the other side
				// of this transfer. Otherwise we don't need to do anything else.
				let transactionPayee = transaction.payeeId ? existingEntities.payees.getEntityById(transaction.payeeId) : null;
				let transactionAccount = existingEntities.accounts.getEntityById(transaction.accountId);

				if(transactionPayee && transactionPayee.accountId && !transaction.transferTransactionId) {

					// This is a transfer transaction, and the other side has not yet been created.
					var otherSideTransaction = EntityFactory.createNewTransaction();
					otherSideTransaction.date = transaction.date;
					otherSideTransaction.amount = -transaction.amount;
					otherSideTransaction.checkNumber = transaction.checkNumber;
					TransactionUtilities.linkTransactions(transaction, otherSideTransaction, existingEntities);
					additionalUpdatedTransactions.push(otherSideTransaction);

					// Update the original transaction to point back to this newly created other side
					transaction.transferAccountId = otherSideTransaction.accountId;
					transaction.transferTransactionId = otherSideTransaction.entityId;
				}
			} else {

				// We have four scenarios here. 
				// 1. This is not a transfer, and wasn't a transfer before. No action required.
				// 2. This is a transfer now, but wasn't a transfer before. Create the other side of the transfer.
				// 3. This is not a transfer now, but was a transfer before. Remove the other side of the transfer.
				// 4. This is a transfer now, and was a transfer before. Update the other side of the transfer. 

				let updatedTransactionPayee = transaction.payeeId ? existingEntities.payees.getEntityById(transaction.payeeId) : null;
				let updatedTransactionIsTransfer:boolean = (updatedTransactionPayee != null && updatedTransactionPayee.accountId != null);

				let existingTransactionPayee = existingTransaction.payeeId ? existingEntities.payees.getEntityById(existingTransaction.payeeId) : null;
				let existingTransactionIsTransfer:boolean = (existingTransactionPayee != null && existingTransactionPayee.accountId != null);

				// Scenario No. 2
				if(updatedTransactionIsTransfer == true && existingTransactionIsTransfer == false) {

					let otherSideTransaction = EntityFactory.createNewTransaction();
					otherSideTransaction.date = transaction.date;
					otherSideTransaction.amount = -transaction.amount;
					otherSideTransaction.checkNumber = transaction.checkNumber;
					TransactionUtilities.linkTransactions(transaction, otherSideTransaction, existingEntities);
					additionalUpdatedTransactions.push(otherSideTransaction);

					// Update the original transaction to point back to this newly created other side
					transaction.transferAccountId = otherSideTransaction.accountId;
					transaction.transferTransactionId = otherSideTransaction.entityId;
				}
				// Scenario No. 3
				else if(updatedTransactionIsTransfer == false && existingTransactionIsTransfer == true) {

					// Get the other side transaction for the existing transaction, and tombstone it
					let otherSideTransaction = existingEntities.transactions.getEntityById(existingTransaction.transferTransactionId);
					if(otherSideTransaction) {

						let updatedOtherSideTransaction = Object.assign({}, otherSideTransaction);
						updatedOtherSideTransaction.isTombstone = 1;
						additionalUpdatedTransactions.push(updatedOtherSideTransaction);
					}

					// Update the original transaction to point back to this newly created other side
					transaction.transferAccountId = null;
					transaction.transferTransactionId = null;
				}
				// Scenario No. 4
				else if(updatedTransactionIsTransfer == true && existingTransactionIsTransfer == true) {

					// Get the other side transaction for the existing transaction, and update it
					let otherSideTransaction = existingEntities.transactions.getEntityById(existingTransaction.transferTransactionId);
					// The user might have updated the date, check number or amount of the transaction. In that case we need to update
					// the same in the other side transaction. Or he might be deleting the transaction.
					// It is also possible that the user updated the payee, so that now the transaction is transferring to another account.
					// In that case we need to update the otherSideTransaction and move it to the new account to which the transaction
					// is now pointing.
					// It is also possible that the user moved the transaction to another account. In that case we need to update the 
					// otherSideTransaction to point back to this transaction in the new account.					
					if(transaction.date != existingTransaction.date ||
						transaction.amount != existingTransaction.amount ||
						transaction.checkNumber != existingTransaction.checkNumber ||
						transaction.isTombstone != existingTransaction.isTombstone ||
						transaction.payeeId != existingTransaction.payeeId ||
						transaction.accountId != existingTransaction.accountId
					) {

						let updatedOtherSideTransaction = Object.assign({}, otherSideTransaction);
						updatedOtherSideTransaction.date = transaction.date;
						updatedOtherSideTransaction.amount = -transaction.amount;
						updatedOtherSideTransaction.checkNumber = transaction.checkNumber;
						updatedOtherSideTransaction.isTombstone = transaction.isTombstone;
						// Update the links between the two transactions
						TransactionUtilities.linkTransactions(transaction, updatedOtherSideTransaction, existingEntities);
						additionalUpdatedTransactions.push(updatedOtherSideTransaction);

						// Update the original transaction to point back to the updated other side
						transaction.transferAccountId = otherSideTransaction.accountId;
						transaction.transferTransactionId = otherSideTransaction.entityId;
					}
				}
			}
		});

		if(additionalUpdatedTransactions.length > 0) {
			updatedEntities.transactions = updatedEntities.transactions.concat(additionalUpdatedTransactions);
		}
	}

	private static linkTransactions(transaction:budgetEntities.ITransaction, otherSideTransaction:budgetEntities.ITransaction, existingEntities:IEntitiesCollection):void {

		otherSideTransaction.transferTransactionId = transaction.entityId;

		// This is the account in which the transaction is contained. This would be set as the transferAccountId of the other side.
		var transactionAccount = existingEntities.accounts.getEntityById(transaction.accountId);
		otherSideTransaction.transferAccountId = transactionAccount.entityId;

		// This is the payee corresponding to the above account. This would be set as the payeeId of the other side.
		var transactionAccountPayee = existingEntities.payees.getPayeeByAccountId(transactionAccount.entityId); 
		otherSideTransaction.payeeId = transactionAccountPayee.entityId;

		// The payee in the transaction corresponds to the account in which the other side is contained.
		var transactionPayee = existingEntities.payees.getEntityById(transaction.payeeId);
		var transactionPayeeAccount = existingEntities.accounts.getEntityById(transactionPayee.accountId);
		otherSideTransaction.accountId = transactionPayeeAccount.entityId;
	}
}
