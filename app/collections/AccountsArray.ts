/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { IAccount } from '../interfaces/budgetEntities';

export class AccountsArray extends EntitiesArray<IAccount> {

	public getAccountByName(accountName:string):IAccount {
		return _.find(this.internalArray, {accountName: accountName});
	}

	public getDefaultAccount():IAccount {

		// First try to find a non-tombstoned on-budget account.
		var selectedAccount:IAccount = null;
		_.forEach(this.internalArray, (account)=>{
			if(account.isTombstone == 0 && account.onBudget == 1 && account.closed == 0) {

				selectedAccount = account;
				return false; 
			}
		});

		if(!selectedAccount) {
			// If the above iteration does not gets us an account, then try to find a non-tombstoned tracking account		
			_.forEach(this.internalArray, (account)=>{
				if(account.isTombstone == 0 && account.closed == 0) {

					selectedAccount = account;
					return false; 
				}
			});
		}

		return selectedAccount;
	}
}
