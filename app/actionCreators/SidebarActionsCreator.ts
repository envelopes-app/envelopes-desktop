/// <reference path="../_includes.ts" />

import { Dispatch } from 'react-redux';

import * as collections from '../collections';
import { ActionNames } from '../constants';
import { IApplicationState, IEntitiesCollection, ISimpleEntitiesCollection } from '../interfaces/state';
import { IAccount, ITransaction, IPayee, ISubCategory } from '../interfaces/budgetEntities';
import { GlobalActionsCreator } from './GlobalActionsCreator';
import { EntityFactory } from '../persistence';
import { DateWithoutTime } from '../utilities';
import { SetSelectedTabAction } from '../interfaces/actions';

export class SidebarActionsCreator {

	// ********************************************************************************************
	// Sync Action Creators
	// ********************************************************************************************
	public static setSelectedTab(selectedTab:string, selectedAccountId:string):SetSelectedTabAction {
		return {
			type: ActionNames.SIDEBAR_SET_SELECTED_TAB,
			selectedTab: selectedTab,
			selectedAccountId: selectedAccountId
		};
	}

	// ********************************************************************************************
	// Async Action Creators
	// ********************************************************************************************
	public static createNewAccount(account:IAccount, currentBalance:number) {

		return function(dispatch:Dispatch<IApplicationState>, getState:()=>IApplicationState) {

			// Create the starting balance transaction
			var startingBalancePayee = getState().entitiesCollection.payees.getStartingBalancePayee();
			var immediateIncomeSubCategory = getState().entitiesCollection.subCategories.getImmediateIncomeSubCategory();
			var transaction = SidebarActionsCreator.createStartingBalanceTransactionForAccount(account, startingBalancePayee, immediateIncomeSubCategory, currentBalance);

			// Create an entities collection object with the entities to save
			var entitiesCollection:ISimpleEntitiesCollection  = {
				accounts: [account],
				transactions: transaction ? [transaction] : null
			};

			// Dispatch action to persist the entities collection to the database
      		dispatch(GlobalActionsCreator.syncBudgetDataWithDatabase(entitiesCollection));
		}
	}	

	public static updateExistingAccount(account:IAccount, currentBalance:number) {

		return function(dispatch:Dispatch<IApplicationState>, getState:()=>IApplicationState) {

			// Create the balance adjustment transaction for this account
			var balanceAdjustmentPayee = getState().entitiesCollection.payees.getManualBalanceAdjustmentPayee();
			var immediateIncomeSubCategory = getState().entitiesCollection.subCategories.getImmediateIncomeSubCategory();
			var transaction = SidebarActionsCreator.createBalanceAdjustmentTransactionForAccount(account, balanceAdjustmentPayee, immediateIncomeSubCategory, currentBalance);

			// Create an entities collection object with the entities to save
			var entitiesCollection:ISimpleEntitiesCollection  = {
				accounts: [account],
				transactions: transaction ? [transaction] : null
			};

			// Dispatch action to persist the entities collection to the database
      		dispatch(GlobalActionsCreator.syncBudgetDataWithDatabase(entitiesCollection));
		}
	}

	// *******************************************************************************************
	// Internal/Utility methods
	// *******************************************************************************************
	private static createStartingBalanceTransactionForAccount(account:IAccount, payee:IPayee, subCategory:ISubCategory, balance:number):ITransaction {

		var transaction:ITransaction = null;
		if(balance != 0) {

			// Create a new transaction entity
			transaction = EntityFactory.createNewTransaction();
			transaction.accountId = account.entityId;
			transaction.payeeId = payee.entityId;
			transaction.subCategoryId = subCategory.entityId;
			transaction.date = DateWithoutTime.createForToday().getUTCTime();
			transaction.amount = balance;
		}

		return transaction;
	}

	private static createBalanceAdjustmentTransactionForAccount(account:IAccount, payee:IPayee, subCategory:ISubCategory, balance:number):ITransaction {

		var transaction:ITransaction = null;
		// Check if the passed current balance is different from what the balance currently is in the account
		if(balance !== account.clearedBalance + account.unclearedBalance) {

			// Create a new transaction entity
			transaction = EntityFactory.createNewTransaction();
			transaction.accountId = account.entityId;
			transaction.payeeId = payee.entityId;
			transaction.subCategoryId = subCategory.entityId;
			transaction.date = DateWithoutTime.createForToday().getUTCTime();
			transaction.amount = balance;
		}

		return transaction;
	}
}
