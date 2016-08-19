import { Promise } from 'es6-promise';

import { ActionNames } from '../constants';
import { IApplicationState, IEntitiesCollection } from '../interfaces/state';
import { IAccount, ITransaction } from '../interfaces/budgetEntities';
import { GlobalActionsCreator } from './GlobalActionsCreator';
import { EntityFactory } from '../persistence';

export class AccountActionsCreator {

	// ********************************************************************************************
	// Sync Action Creators
	// ********************************************************************************************


	// ********************************************************************************************
	// Async Action Creators
	// ********************************************************************************************
	public static createNewAccount(account:IAccount, currentBalance:number) {

		return function(dispatch:ReactRedux.Dispatch<IApplicationState>, getState:()=>IApplicationState) {

			// Create the starting balance transaction
			var transaction = AccountActionsCreator.createStartingBalanceTransactionForAccount(account, currentBalance);

			// Create an entities collection object with the entities to save
			var entitiesCollection:IEntitiesCollection  = {
				accounts: [account],
				transactions: [transaction]
			};

			// Dispatch action to persist the entities collection to the database
      		dispatch(GlobalActionsCreator.syncBudgetDataWithDatabase(entitiesCollection));
		}
	}	

	public static updateExistingAccount(account:IAccount, currentBalance:number) {

		return function(dispatch:ReactRedux.Dispatch<IApplicationState>, getState:()=>IApplicationState) {

			// Create the balance adjustment transaction
			var transaction = AccountActionsCreator.createBalanceAdjustmentTransactionForAccount(account, currentBalance);

			// Create an entities collection object with the entities to save
			var entitiesCollection:IEntitiesCollection  = {
				accounts: [account],
				transactions: [transaction]
			};

			// Dispatch action to persist the entities collection to the database
      		dispatch(GlobalActionsCreator.syncBudgetDataWithDatabase(entitiesCollection));
		}
	}

	// *******************************************************************************************
	// Internal/Utility methods
	// *******************************************************************************************
	private static createStartingBalanceTransactionForAccount(account:IAccount, balance:number):ITransaction {

		var transaction:ITransaction = null;
		if(balance != 0) {

			// Create a new transaction entity
			transaction = EntityFactory.createNewTransaction();
			transaction.accountId = account.entityId;
			transaction.amount = balance;
		}

		return transaction;
	}

	private static createBalanceAdjustmentTransactionForAccount(account:IAccount, balance:number):ITransaction {

		return null;
	}
}