/// <reference path='../_includes.ts' />

import * as _ from 'lodash';

import { IEntity } from '../../app/interfaces/common';
import { EntityFactory } from '../../app/persistence';
import { AccountTypes } from '../../app/constants';
import { DateWithoutTime } from '../../app/utilities';
import { PersistenceManager } from '../../app/persistence';
import * as collections from '../../app/collections'; 
import * as budgetEntities from '../../app/interfaces/budgetEntities';
import * as catalogEntities from '../../app/interfaces/catalogEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../app/interfaces/state';

export class TestsHelper {

	private _budget:catalogEntities.IBudget;
	private _persistenceManager:PersistenceManager;
	private _entitiesCollection:IEntitiesCollection;
	
	public get entitiesCollection():IEntitiesCollection {
		return this._entitiesCollection;
	} 

	public initialize(budgetName:string):Promise<boolean> {

		this._persistenceManager = PersistenceManager.getInstance();
		// Create a blank new budget for these tests. 
		return this._persistenceManager.createNewBudget(budgetName)
			.then((budget:catalogEntities.IBudget)=>{

				this._budget = budget;
				// This budget is now set as the active budget in persistence manager
				// Load the data for this budget and cache it in the TestsHelper
				return this._persistenceManager.loadBudgetData();
			})
			.then((simpleEntitiesCollection:ISimpleEntitiesCollection)=>{

				// Save a reference to this entities collection
				var collection:IEntitiesCollection = {};
				collection.accounts = new collections.AccountsArray(simpleEntitiesCollection.accounts);
				collection.accountMappings = new collections.AccountMappingsArray(simpleEntitiesCollection.accountMappings);
				collection.masterCategories = new collections.MasterCategoriesArray(simpleEntitiesCollection.masterCategories);
				collection.monthlyBudgets = new collections.MonthlyBudgetsArray(simpleEntitiesCollection.monthlyBudgets);
				collection.monthlySubCategoryBudgets = new collections.MonthlySubCategoryBudgetsArray(simpleEntitiesCollection.monthlySubCategoryBudgets);
				collection.payees = new collections.PayeesArray(simpleEntitiesCollection.payees);
				collection.payeeLocations = new collections.PayeeLocationsArray(simpleEntitiesCollection.payeeLocations);
				collection.payeeRenameConditions = new collections.PayeeRenameConditionsArray(simpleEntitiesCollection.payeeRenameConditions);
				collection.scheduledSubTransactions = new collections.ScheduledSubTransactionsArray(simpleEntitiesCollection.scheduledSubTransactions);
				collection.scheduledTransactions = new collections.ScheduledTransactionsArray(simpleEntitiesCollection.scheduledTransactions);
				collection.settings = new collections.SettingsArray(simpleEntitiesCollection.settings);
				collection.subCategories = new collections.SubCategoriesArray(simpleEntitiesCollection.subCategories);
				collection.subTransactions = new collections.SubTransactionsArray(simpleEntitiesCollection.subTransactions);
				collection.transactions = new collections.TransactionsArray(simpleEntitiesCollection.transactions);
				
				this._entitiesCollection = collection;
				return true;
			});
	}

	public finalize():void {

	}

	public syncEntitiesWithDatabase(updatedEntities:ISimpleEntitiesCollection):Promise<boolean> {

		var existingEntitiesCollection = this._entitiesCollection;

		return this._persistenceManager.syncDataWithDatabase(updatedEntities, existingEntitiesCollection)
			.then((entities:ISimpleEntitiesCollection)=>{

				this.updateCollectionArray(existingEntitiesCollection.accounts, entities.accounts);
				this.updateCollectionArray(existingEntitiesCollection.accountMappings, entities.accountMappings);
				this.updateCollectionArray(existingEntitiesCollection.masterCategories, entities.masterCategories);
				this.updateCollectionArray(existingEntitiesCollection.monthlyBudgets, entities.monthlyBudgets);
				this.updateCollectionArray(existingEntitiesCollection.monthlySubCategoryBudgets, entities.monthlySubCategoryBudgets);
				this.updateCollectionArray(existingEntitiesCollection.payees, entities.payees);
				this.updateCollectionArray(existingEntitiesCollection.payeeLocations, entities.payeeLocations);
				this.updateCollectionArray(existingEntitiesCollection.payeeRenameConditions, entities.payeeRenameConditions);
				this.updateCollectionArray(existingEntitiesCollection.scheduledSubTransactions, entities.scheduledSubTransactions);
				this.updateCollectionArray(existingEntitiesCollection.scheduledTransactions, entities.scheduledTransactions);
				this.updateCollectionArray(existingEntitiesCollection.settings, entities.settings);
				this.updateCollectionArray(existingEntitiesCollection.subCategories, entities.subCategories);
				this.updateCollectionArray(existingEntitiesCollection.subTransactions, entities.subTransactions);
				this.updateCollectionArray(existingEntitiesCollection.transactions, entities.transactions);
				return true;
			});
	}

	private updateCollectionArray(entitiesArray:collections.EntitiesArray<IEntity>, updatedValues:Array<IEntity>):void {

		if(updatedValues && updatedValues.length > 0) {
			_.forEach(updatedValues, (updatedValue)=>{
				entitiesArray.addOrReplaceEntity(updatedValue);
			});
		}		
	}

	// *******************************************************************************************************
	// Utility Methods to create entities of different types
	// *******************************************************************************************************
	public createAccount(accountName:string, accountType:string = AccountTypes.Checking, onBudget:boolean = true):budgetEntities.IAccount {

		var account = EntityFactory.createNewAccount();
		account.accountName = accountName;
		account.accountType = AccountTypes.Checking;
		account.onBudget = onBudget ? 1 : 0;
		return account;
	}

	public createTransaction(account:budgetEntities.IAccount, subCategory:budgetEntities.ISubCategory, amount:number, transfersToAccount:budgetEntities.IAccount = null, daysOffset:number = 0):budgetEntities.ITransaction {

		var transaction = EntityFactory.createNewTransaction();
		transaction.accountId = account.entityId;
		transaction.date = DateWithoutTime.createForCurrentMonth().addDays(daysOffset).getUTCTime();
		transaction.subCategoryId = subCategory ? subCategory.entityId : null;
		transaction.amount = amount;
		transaction.transferAccountId = transfersToAccount ? transfersToAccount.entityId : null;
		return transaction;
	}
}