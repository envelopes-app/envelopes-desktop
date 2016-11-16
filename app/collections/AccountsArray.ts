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

	public getNonTombstonedOpenAccounts():Array<IAccount> {

		var accounts:Array<IAccount> = [];
		_.forEach(this.internalArray, (account)=>{
			if(account.isTombstone == 0 && account.closed == 0)
				accounts.push(account);
		});

		return accounts;
	}

	public getSortableIndexForNewAccount():number {

		var sortableIndex = 0;
		_.forEach(this.internalArray, (account)=>{
			if(account.sortableIndex > sortableIndex)
				sortableIndex = account.sortableIndex;
		});

		// Increment the sortableIndex by 10000
		sortableIndex += 10000;
		return sortableIndex;
	}


	public getAccountAbove(accountId:string):IAccount {

		var referenceAccount = this.getEntityById(accountId);
		var referenceSortableIndex = referenceAccount.sortableIndex; 
		var accountAbove:IAccount = null;

		// We want to find the account with highest sortableIndex below the referenceAccount
		_.forEach(this.internalArray, (account)=>{
			if(account.isTombstone == 0 && account.closed == 0 && 
				account.onBudget == referenceAccount.onBudget && 
				account.entityId != accountId && 
				account.sortableIndex < referenceSortableIndex) {

				if(!accountAbove || accountAbove.sortableIndex < account.sortableIndex)
					accountAbove = account;
			}
		});

		return accountAbove;		
	}

	public getAccountBelow(accountId:string):IAccount {

		var referenceAccount = this.getEntityById(accountId);
		var referenceSortableIndex = referenceAccount.sortableIndex; 
		var accountBelow:IAccount = null;

		// We want to find the account with lowest sortableIndex above the referenceAccount
		_.forEach(this.internalArray, (account)=>{
			if(account.isTombstone == 0 && account.closed == 0 && 
				account.onBudget == referenceAccount.onBudget && 
				account.entityId != accountId && 
				account.sortableIndex > referenceSortableIndex) {
			
				if(!accountBelow || accountBelow.sortableIndex > account.sortableIndex)
					accountBelow = account;
			}
		});

		return accountBelow;		
	}

	protected addEntity(entity:IAccount):void {
		super.addEntity(entity);
		this.sortArray();
	}

	protected sortArray():void {
		this.internalArray = _.orderBy(this.internalArray, ["sortableIndex"], ["asc"]);
	}
}
