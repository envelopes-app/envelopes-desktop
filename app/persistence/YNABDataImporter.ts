/// <reference path='../_includes.ts' />

import * as _ from 'lodash';

import { AccountTypes } from '../constants';
import { EntityFactory } from './EntityFactory';
import { SimpleObjectMap } from '../utilities/SimpleObjectMap';
import { IImportedAccountObject } from '../interfaces/objects';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../interfaces/state';

export class YNABDataImporter {

	public getAccountsList(budgetRows:Array<any>, registerRows:Array<any>):Array<IImportedAccountObject> {

		// As we find account names for creating accounts, we are going to put them in this
		// dictionary. The boolean value against it indicates if it is a liability account.
		// A false value indicates we do not know about the type of the account.
		var accountsMap:SimpleObjectMap<IImportedAccountObject> = {};
		var accountsList:Array<IImportedAccountObject> = [];

		// Iterate through all the register rows. Check the account names in the transactions.
		// If that account does not exist in the existing entities, then we want to create it. 
		for(var i:number = 1; i < registerRows.length; i++) {

			var registerRow = registerRows[i];
			var accountName = registerRow[0];
			var accountFound:boolean = false;

			// Check if we have already added this to our map.
			if(accountsMap[accountName])
				accountFound = true;

			// If the account has not yet been created, then add it to the accountsMap for creation.
			if(accountFound == false) {
				// Setting it to false because at this time we do not know whether this is going to
				// be a credit card account or not. That determination would be made when we go through
				// the budgets data.
				var accountObj:IImportedAccountObject = {
					accountName: accountName,
					isLiabilityAccount: false,
					accountType: AccountTypes.None
				}
				accountsMap[accountName] = accountObj;
				accountsList.push(accountObj);
			}
		}

		// Iterate through all the budget rows. If for any account name, we find a corresponding debt category,
		// then mark that account as credit card account.
		for(var i:number = 1; i < budgetRows.length; i++) {

			var budgetRow = budgetRows[i];
			var masterCategoryName = budgetRow[2];
			var subCategoryName = budgetRow[3];
			if(masterCategoryName == "Credit Card Payments") {

				// Check if we have an account corresponding to this subcategory in our accountsMap
				var accountObj = accountsMap[subCategoryName];
				// Mark this account object to be of type liability
				if(accountObj)
					accountObj.isLiabilityAccount = true;
			} 
		}

		return accountsList;
	}
}