/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { IAccount } from '../interfaces/budgetEntities';

export class AccountsArray extends EntitiesArray<IAccount> {

	public getAccountByName(accountName:string):IAccount {
		return _.find(this, {accountName: accountName});
	}
}
