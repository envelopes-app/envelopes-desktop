/// <reference path='../_includes.ts' />

import * as _ from 'lodash';

import { AccountTypes, SubCategoryType } from '../constants';
import { EntityFactory } from './EntityFactory';
import { SimpleObjectMap } from '../utilities/SimpleObjectMap';
import { IImportedAccountObject } from '../interfaces/objects';
import * as budgetEntities from '../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../interfaces/state';

export class YNABDataImporter {

	public updatedEntities:ISimpleEntitiesCollection = {
		accounts: [],
		payees: [],
		masterCategories: [],
		subCategories: [],
	};

	// Maps to keep track of entities (by name) that we have already added to 'updatedEntities' for creation
	private accountsMap:SimpleObjectMap<budgetEntities.IAccount> = {};
	private payeesMap:SimpleObjectMap<budgetEntities.IPayee> = {};
	private masterCategoriesMap:SimpleObjectMap<budgetEntities.IMasterCategory> = {};
	private subCategoriesMap:SimpleObjectMap<budgetEntities.ISubCategory> = {};

	public buildEntitiesList(budgetRows:Array<any>, registerRows:Array<any>, existingEntitiesCollection:IEntitiesCollection, accountsList:Array<IImportedAccountObject>):void {

		var debtMasterCategory = existingEntitiesCollection.masterCategories.getDebtPaymentMasterCategory();

		// *************************************************************************************************
		// First Iteration: Determine accounts that need to be created.
		// *************************************************************************************************
		// Iterate through all the register rows. Check the account names in the transactions.
		// If that account does not exist in the existing entities, then we want to create it. 
		for(var i:number = 1; i < registerRows.length; i++) {

			var registerRow = registerRows[i];
			var accountName:string = registerRow[0];

			// Do we already have an account by this name in our existing entities
			var existingAccount = existingEntitiesCollection.accounts.getAccountByName(accountName);
			if(!existingAccount) {

				// Check if we have already added this to the updatedEntities collection.
				if(!this.accountsMap[accountName]) {

					// Create an account entity and add to the updatedEntities collection
					var accountEntity = EntityFactory.createNewAccount();
					accountEntity.accountName = accountName;
					// Get the account type that the user selected
					accountEntity.accountType = this.getAccountType(accountName, accountsList);
					accountEntity.onBudget = AccountTypes.isRecommendedOnBudget(accountEntity.accountType) ? 1 : 0;
					this.updatedEntities.accounts.push(accountEntity);
					this.accountsMap[accountName] = accountEntity;

					// Create a corresponding payee entity and add to the updatedEntities collection
					var accountPayeeEntity = EntityFactory.createNewPayee();
					accountPayeeEntity.accountId = accountEntity.entityId;
					accountPayeeEntity.name = `Transfer : ${accountName}`;
					this.updatedEntities.payees.push(accountPayeeEntity);
					this.payeesMap[accountPayeeEntity.name] = accountPayeeEntity;

					if(accountEntity.accountType == AccountTypes.CreditCard || 
						accountEntity.accountType == AccountTypes.LineOfCredit) {

						// Also create a Debt SubCategory Entity for it
						var accountSubCategory = EntityFactory.createNewSubCategory();
						accountSubCategory.masterCategoryId = debtMasterCategory.entityId;
						accountSubCategory.accountId = accountEntity.entityId;
						accountSubCategory.name = accountName;
						accountSubCategory.type = SubCategoryType.Debt;
						this.subCategoriesMap[accountSubCategory.name] = accountSubCategory;
					}
				}
			}
		}

		// *************************************************************************************************
		// Second Iteration: Determine payees, master categories and sub-categories that need to be created.
		// *************************************************************************************************
		debugger;
		for(var i:number = 1; i < registerRows.length; i++) {

			var registerRow = registerRows[i];
			var payeeName = registerRow[3];
			var subCategoryFullName = registerRow[4]; 
			var masterCategoryName = registerRow[5];
			var subCategoryName = registerRow[6];

			if(payeeName != "") {
				// Do we already have a payee by this name in our existing entities
				var payeeEntity = existingEntitiesCollection.payees.getPayeeByName(payeeName);
				if(!payeeEntity) {

					// Check if we have already added this to the updatedEntities collection.
					payeeEntity = this.payeesMap[payeeName];
					if(!payeeEntity) {

						// Create a payee entity and add to the updatedEntities collection
						payeeEntity = EntityFactory.createNewPayee();
						payeeEntity.name = payeeName;
						this.updatedEntities.payees.push(payeeEntity);
						this.payeesMap[payeeName] = payeeEntity;
					}
				}
			}

			if(subCategoryName != "" && subCategoryFullName != "Inflow: To be Budgeted") {

				// Do we already have a master category by this name in our existing entities
				var masterCategoryEntity = existingEntitiesCollection.masterCategories.getMasterCategoryByName(masterCategoryName);
				if(!masterCategoryEntity) {

					// Check if we have already added this to the updatedEntities collection.
					masterCategoryEntity = this.masterCategoriesMap[masterCategoryName];
					if(!masterCategoryEntity) {

						// Create a master category entity and add to the updatedEntities collection
						masterCategoryEntity = EntityFactory.createNewMasterCategory();
						masterCategoryEntity.name = masterCategoryName;
						masterCategoryEntity.sortableIndex = existingEntitiesCollection.masterCategories.getSortableIndexForNewMasterCategoryInsertion();
						this.updatedEntities.masterCategories.push(masterCategoryEntity);
						this.masterCategoriesMap[masterCategoryName] = masterCategoryEntity;
					}

					// Since the master category did not exist in the existing entities collection, the subcategory
					// would also not exist there, so we do not need to check in the existing entities collection.
					// Check if we have already added the subcategory to the updatedEntities collection.
					var subCategoryEntity = this.subCategoriesMap[subCategoryFullName];
					if(!subCategoryEntity) {

						// Create a subcategory entity and add to the updatedEntities collection
						subCategoryEntity = EntityFactory.createNewSubCategory();
						subCategoryEntity.name = subCategoryName;
						subCategoryEntity.masterCategoryId = masterCategoryEntity.entityId;
						subCategoryEntity.sortableIndex = existingEntitiesCollection.subCategories.getSortableIndexForNewSubCategoryInsertionAtBottom(masterCategoryEntity.entityId);
						this.updatedEntities.subCategories.push(subCategoryEntity);
						this.subCategoriesMap[subCategoryFullName] = subCategoryEntity;
					}
				}
				else {

					// The master category exists in the existing entities, so the subcategory might also exist.
					// We need to check in the existing entities collection as well.
					var subCategoryEntity = existingEntitiesCollection.subCategories.getSubCategoryByName(subCategoryName);
					if(!subCategoryEntity || subCategoryEntity.masterCategoryId != masterCategoryEntity.entityId) {

						// The subCategory does not exist in the existing collections, or if it does, it is under
						// a different master category. If we have not already added this subcategory, then add it now.
						subCategoryEntity = this.subCategoriesMap[subCategoryFullName];
						if(!subCategoryEntity) {

							// Create a subcategory entity and add to the updatedEntities collection
							subCategoryEntity = EntityFactory.createNewSubCategory();
							subCategoryEntity.name = subCategoryName;
							subCategoryEntity.masterCategoryId = masterCategoryEntity.entityId;
							this.updatedEntities.subCategories.push(subCategoryEntity);
							this.subCategoriesMap[subCategoryFullName] = subCategoryEntity;
						}
					}
				}
			}
		}
	}

	private getAccountType(accountName:string, accountsList:Array<IImportedAccountObject>):string {

		var accountType = AccountTypes.None;
		_.forEach(accountsList, (accountObj)=>{
			if(accountObj.accountName == accountName) {

				accountType = accountObj.selectedAccountType;
				return false;
			}
		})

		return accountType;
	}

	public static getAccountsList(budgetRows:Array<any>, registerRows:Array<any>, existingEntitiesCollection:IEntitiesCollection):Array<IImportedAccountObject> {

		// As we find account names for creating accounts, we are going to put them in this
		// dictionary. The boolean value against it indicates if it is a liability account.
		// A false value indicates we do not know about the type of the account.
		var accountsList:Array<IImportedAccountObject> = [];
		var accountsMap:SimpleObjectMap<IImportedAccountObject> = {};

		// Iterate through all the register rows. Check the account names in the transactions.
		// If that account does not exist in the existing entities, then we want to create it. 
		for(var i:number = 1; i < registerRows.length; i++) {

			var registerRow = registerRows[i];
			var accountName = registerRow[0];
			var accountFound:boolean = false;

			// Check if it already exists in the existing entities collection
			var accountEntity = existingEntitiesCollection.accounts.getAccountByName(accountName);
			if(accountEntity) {

				accountFound = true;
				var accountObj:IImportedAccountObject = {
					accountName: accountName,
					suggestedAccountType: accountEntity.accountType,
					selectedAccountType: accountEntity.accountType
				}
				accountsMap[accountName] = accountObj;
				accountsList.push(accountObj);
			}
			// Check if we have already added this to our map.
			else if(accountsMap[accountName])
				accountFound = true;

			// If the account has not yet been created, then add it to the accountsMap for creation.
			if(accountFound == false) {
				// Setting it to false because at this time we do not know whether this is going to
				// be a credit card account or not. That determination would be made when we go through
				// the budgets data.
				var accountObj:IImportedAccountObject = {
					accountName: accountName,
					suggestedAccountType: AccountTypes.None,
					selectedAccountType: AccountTypes.None
				}
				accountsMap[accountName] = accountObj;
				accountsList.push(accountObj);
			}
		}

		if(accountsList.length > 0) {
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
					if(accountObj && accountObj.selectedAccountType == AccountTypes.None)
						accountObj.suggestedAccountType = AccountTypes.Liability;
				} 
			}
		}

		return accountsList;
	}
}