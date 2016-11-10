/// <reference path='../_includes.ts' />

import * as _ from 'lodash';

import { EntityFactory } from '../persistence';
import { DateWithoutTime } from './DateWithoutTime';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../interfaces/state';

export class TransactionUtilities {

	public static processTransactions(updatedEntities:ISimpleEntitiesCollection, existingEntities:IEntitiesCollection):void {

		if(!updatedEntities.transactions || updatedEntities.transactions.length == 0)
			return;

		_.forEach(updatedEntities.transactions, (transaction)=>{

			// Check if we have an existing transaction corresponding to this transaction
			var existingTransaction = existingEntities.transactions.getEntityById(transaction.entityId);
			if(!existingTransaction) {

				// This is a new transaction. If it is a transfer transaction, then create the other side
				// of this transfer. Otherwise we don't need to do anything else.
				let transactionPayee = transaction.payeeId ? existingEntities.payees.getEntityById(transaction.payeeId) : null;
				let transactionAccount = existingEntities.accounts.getEntityById(transaction.accountId);

				if(transactionPayee && transactionPayee.accountId && !transaction.transferTransactionId) {

					let otherSideTransactionAccount = existingEntities.accounts.getEntityById(transactionPayee.accountId);
					let otherSideTransactionPayee = existingEntities.payees.getPayeeByAccountId(transactionAccount.entityId);

					// This is a transfer transaction, and the other side has not yet been created.
					var otherSideTransaction = EntityFactory.createNewTransaction();
					otherSideTransaction.accountId = otherSideTransactionAccount.entityId;
					otherSideTransaction.payeeId = otherSideTransactionPayee.entityId;
					otherSideTransaction.date = transaction.date;
					otherSideTransaction.amount = -transaction.amount;
					otherSideTransaction.checkNumber = transaction.checkNumber;
					otherSideTransaction.transferAccountId = transactionAccount.entityId;
					otherSideTransaction.transferTransactionId = transaction.entityId;
					updatedEntities.transactions.push(otherSideTransaction);

					// Update the original transaction to point back to this newly created other side
					transaction.transferAccountId = otherSideTransactionAccount.entityId;
					transaction.transferTransactionId = otherSideTransaction.entityId;
				}
			} else {

				// We have four scenarios here. 
				// 1. This is not a transfer, and wasn't a transfer before. No action required.
				// 2. This is a transfer now, but wasn't a transfer before. Create the other side of the transfer.
				// 3. This is not a transfer now, but was a transfer before. Remove the other side of the transfer.
				// 4. This is a transfer now, and was a transfer before. Update the other side of the transfer. 
			}
		});
	}
}
