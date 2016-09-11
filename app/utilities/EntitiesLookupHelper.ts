/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import * as budgetEntities from '../interfaces/budgetEntities';
import { IEntitiesCollection } from '../interfaces/state';

export class EntitiesLookupHelper {

	// ***********************************************************************************************************
	// Account lookup methods
	// ***********************************************************************************************************
	public static getDefaultAccountForAddTransactionDialog(entitiesCollection:IEntitiesCollection):budgetEntities.IAccount {

		// First try to find a non-tombstoned on-budget account.
		var selectedAccount:budgetEntities.IAccount = null;
		_.forEach(entitiesCollection.accounts, (account)=>{
			if(account.isTombstone == 0 && account.onBudget == 1 && account.closed == 0) {

				selectedAccount = account;
				return false; 
			}
		});

		// If the above iteration does not gets us an account, then try to find a non-tombstoned tracking account		
		_.forEach(entitiesCollection.accounts, (account)=>{
			if(account.isTombstone == 0 && account.closed == 0) {

				selectedAccount = account;
				return false; 
			}
		});

		return selectedAccount;
	}
}