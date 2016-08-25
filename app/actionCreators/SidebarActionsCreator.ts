/// <reference path="../_includes.ts" />

import { Promise } from 'es6-promise';

import { ActionNames } from '../constants';
import { IApplicationState, IEntitiesCollection } from '../interfaces/state';
import { IAccount, ITransaction } from '../interfaces/budgetEntities';
import { GlobalActionsCreator } from './GlobalActionsCreator';
import { EntityFactory } from '../persistence';
import { SetSelectedTabAction, SetBudgetAccountsExpandedAction, SetTrackingAccountsExpandedAction, SetClosedAccountsExpandedAction } from '../interfaces/actions';

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

	public static setBudgetAccountsExpanded(expanded:boolean):SetBudgetAccountsExpandedAction {
		return {
			type: ActionNames.SIDEBAR_SET_BUDGETS_ACCOUNT_EXPANDED,
			expanded: expanded
		};
	}

	public static setTrackingAccountsExpanded(expanded:boolean):SetTrackingAccountsExpandedAction {
		return {
			type: ActionNames.SIDEBAR_SET_TRACKING_ACCOUNT_EXPANDED,
			expanded: expanded
		};
	}

	public static setClosedAccountsExpanded(expanded:boolean):SetClosedAccountsExpandedAction {
		return {
			type: ActionNames.SIDEBAR_SET_CLOSED_ACCOUNT_EXPANDED,
			expanded: expanded
		};
	}

	// ********************************************************************************************
	// Async Action Creators
	// ********************************************************************************************
	public static createNewAccount(account:IAccount, currentBalance:number) {

		return function(dispatch:ReactRedux.Dispatch<IApplicationState>, getState:()=>IApplicationState) {

			// Create the starting balance transaction
			var transaction = SidebarActionsCreator.createStartingBalanceTransactionForAccount(account, currentBalance);

			// Create an entities collection object with the entities to save
			var entitiesCollection:IEntitiesCollection  = {
				accounts: [account],
				transactions: transaction ? [transaction] : null
			};

			// Dispatch action to persist the entities collection to the database
      		dispatch(GlobalActionsCreator.syncBudgetDataWithDatabase(entitiesCollection));
		}
	}	

	public static updateExistingAccount(account:IAccount, currentBalance:number) {

		return function(dispatch:ReactRedux.Dispatch<IApplicationState>, getState:()=>IApplicationState) {

			var transactions = null;
			// Create the balance adjustment transaction for this account
			var transaction = SidebarActionsCreator.createBalanceAdjustmentTransactionForAccount(account, currentBalance);

			// Create an entities collection object with the entities to save
			var entitiesCollection:IEntitiesCollection  = {
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

		var transaction:ITransaction = null;
		// Check if the passed current balance is different from what the balance currently is in the account
		if(balance !== account.clearedBalance + account.unclearedBalance) {

			// Create a new transaction entity
			transaction = EntityFactory.createNewTransaction();
			transaction.accountId = account.entityId;
			transaction.amount = balance;
		}

		return transaction;
	}
}
