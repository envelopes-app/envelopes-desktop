/// <reference path='../_includes.ts' />

import * as _ from 'lodash';

import { AccountTypes, SubCategoryType } from '../constants';
import { EntityFactory } from './EntityFactory';
import { DateWithoutTime, DataFormatter, SimpleObjectMap, MultiDictionary, KeyGenerator } from '../utilities';
import { IImportedAccountObject } from '../interfaces/objects';
import { IBudget } from '../interfaces/catalogEntities';
import * as budgetEntities from '../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../interfaces/state';

export class YNABDataImporter {

	private activeBudget:IBudget;
	private existingEntitiesCollection:IEntitiesCollection;
	private dataFormatter:DataFormatter;

	public updatedEntities:ISimpleEntitiesCollection = {
		budgets: [],
		accounts: [],
		payees: [],
		masterCategories: [],
		subCategories: [],
		monthlyBudgets:[],
		monthlySubCategoryBudgets:[],
		transactions: []
	};

	// Maps to keep track of entities (by entityId)
	private accountsMapById:SimpleObjectMap<budgetEntities.IAccount> = {};
	private payeesMapById:SimpleObjectMap<budgetEntities.IPayee> = {};
	private monthlyBudgetsMapById:SimpleObjectMap<budgetEntities.IMonthlyBudget> = {};
	private monthlySubCategoryBudgetsMapById:SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget> = {};

	// This is to keep track of which monthlySubCategoryBudget entities have we already 
	// added to the updatedEntities collection. 
	private updatedMonthlySubCategoryBudgetsMapById:SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget> = {};

	// Maps to keep track of entities (by name)
	private accountsMap:SimpleObjectMap<budgetEntities.IAccount> = {};
	private payeesMap:SimpleObjectMap<budgetEntities.IPayee> = {};
	private masterCategoriesMap:SimpleObjectMap<budgetEntities.IMasterCategory> = {};
	private subCategoriesMap:SimpleObjectMap<budgetEntities.ISubCategory> = {};

	private minTransactionDate = DateWithoutTime.createForCurrentMonth();
	private maxTransactionDate = DateWithoutTime.createForCurrentMonth();
	private minBudgetedMonth = DateWithoutTime.createForCurrentMonth();
	private maxBudgetedMonth = DateWithoutTime.createForCurrentMonth();

	private accountsSortableIndex:number;
	private masterCategoriesSortableIndex:number;
	private subCategoriesSortableIndex:SimpleObjectMap<number>;

	constructor(activeBudget:IBudget, existingEntitiesCollection:IEntitiesCollection, dataFormatter:DataFormatter) {

		this.activeBudget = activeBudget;
		this.existingEntitiesCollection = existingEntitiesCollection;
		this.dataFormatter = dataFormatter;

		this.accountsSortableIndex = existingEntitiesCollection.accounts.getSortableIndexForNewAccount(); 
		this.masterCategoriesSortableIndex = existingEntitiesCollection.masterCategories.getSortableIndexForNewMasterCategoryInsertion(); 
		this.subCategoriesSortableIndex = {}; 
		_.forEach(existingEntitiesCollection.masterCategories.getAllItems(), (masterCategory)=>{
			this.subCategoriesSortableIndex[masterCategory.entityId] = existingEntitiesCollection.subCategories.getSortableIndexForNewSubCategoryInsertionAtBottom(masterCategory.entityId);
		});
	}

	private getNextSortableIndexForAccount():number {
		let nextSortableIndex = this.accountsSortableIndex;
		this.accountsSortableIndex += 10000;
		return nextSortableIndex;
	}	

	private getNextSortableIndexForMasterCategory():number {
		let nextSortableIndex = this.masterCategoriesSortableIndex;
		this.masterCategoriesSortableIndex += 10000;
		return nextSortableIndex;
	}	

	private getNextSortableIndexForSubCategory(parentMasterCategoryId:string):number {

		let nextSortableIndex = 0;
		if(this.subCategoriesSortableIndex[parentMasterCategoryId] != null && this.subCategoriesSortableIndex[parentMasterCategoryId] != undefined)
			nextSortableIndex = this.subCategoriesSortableIndex[parentMasterCategoryId];

		this.subCategoriesSortableIndex[parentMasterCategoryId] = nextSortableIndex + 10000;
		return nextSortableIndex;
	}

	public buildEntitiesList(budgetRows:Array<any>, registerRows:Array<any>, accountsList:Array<IImportedAccountObject>):void {

		var debtMasterCategory = this.existingEntitiesCollection.masterCategories.getDebtPaymentMasterCategory();
		var immediateIncomeCategory = this.existingEntitiesCollection.subCategories.getImmediateIncomeSubCategory();
		this.subCategoriesMap['Inflow: To be Budgeted'] = immediateIncomeCategory;

		// *************************************************************************************************
		// First Iteration: Determine accounts that need to be created.
		// *************************************************************************************************
		// Iterate through all the register rows. Check the account names in the transactions.
		// If that account does not exist in the existing entities, then we want to create it. 
		for(var i:number = 1; i < registerRows.length; i++) {

			let registerRow = registerRows[i];
			let accountName:string = registerRow[0];

			// Check if we have already added this to our map.
			if(!this.accountsMap[accountName]) {

				// Do we already have an account by this name in our existing entities
				var accountEntity = this.existingEntitiesCollection.accounts.getAccountByName(accountName);
				if(!accountEntity) {

					// Create an account entity and add to the updatedEntities collection
					accountEntity = EntityFactory.createNewAccount();
					accountEntity.accountName = accountName;
					accountEntity.sortableIndex = this.getNextSortableIndexForAccount();
					// Get the account type that the user selected for this account
					accountEntity.accountType = this.getAccountType(accountName, accountsList);
					accountEntity.onBudget = AccountTypes.isRecommendedOnBudget(accountEntity.accountType) ? 1 : 0;
					this.updatedEntities.accounts.push(accountEntity);

					// Create a corresponding payee entity and add to the updatedEntities collection
					var accountPayeeEntity = EntityFactory.createNewPayee();
					accountPayeeEntity.accountId = accountEntity.entityId;
					accountPayeeEntity.name = `Transfer : ${accountName}`;
					this.updatedEntities.payees.push(accountPayeeEntity);
					this.payeesMap[accountPayeeEntity.name] = accountPayeeEntity;
					this.payeesMapById[accountPayeeEntity.entityId] = accountPayeeEntity;

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

				// Add this account entity to our map for quick lookup during transactions parsing
				this.accountsMap[accountEntity.accountName] = accountEntity;
				this.accountsMapById[accountEntity.entityId] = accountEntity;
			}
		}

		// *************************************************************************************************
		// Second Iteration: Determine payees, master categories and sub-categories that need to be created.
		// *************************************************************************************************
		for(var i:number = 1; i < registerRows.length; i++) {

			let registerRow = registerRows[i];
			let payeeName = registerRow[3];
			let subCategoryFullName = registerRow[4]; 
			let masterCategoryName = registerRow[5];
			let subCategoryName = registerRow[6];
			this.ensurePayee(payeeName);
			this.ensureCategory(subCategoryFullName, masterCategoryName, subCategoryName);
		}

		for(var i:number = 1; i < budgetRows.length; i++) {

			let budgetRow = budgetRows[i];
			let subCategoryFullName = budgetRow[1]; 
			let masterCategoryName = budgetRow[2];
			let subCategoryName = budgetRow[3];
			this.ensureCategory(subCategoryFullName, masterCategoryName, subCategoryName);
		}
		// *************************************************************************************************
		// Third Iteration: Add transactions.
		// *************************************************************************************************
		var transferTransactions:Array<budgetEntities.ITransaction> = [];
		var transferTransactionsByAccount = new MultiDictionary<string, budgetEntities.ITransaction>();

		for(var i:number = 1; i < registerRows.length; i++) {

			let registerRow = registerRows[i];
			let trxAccountName = registerRow[0];
			let trxFlag = registerRow[1];
			let trxDate = registerRow[2];
			let trxPayeeName = registerRow[3];
			let trxSubCategoryFullName = registerRow[4]; 
			let trxMasterCategoryName = registerRow[5];
			let trxSubCategoryName = registerRow[6];
			let trxMemo = registerRow[7];
			let trxOutflow = registerRow[8];
			let trxInflow = registerRow[9];
			let trxCleared = registerRow[10];

			let accountEntity = this.accountsMap[trxAccountName];
			let payeeEntity = trxPayeeName != "" ? this.payeesMap[trxPayeeName] : null;
			let subCategoryEntity = trxSubCategoryFullName != "" ? this.subCategoriesMap[trxSubCategoryFullName] : null;
			let date = this.dataFormatter.parseDate(trxDate);
			let outflow = this.dataFormatter.unformatCurrency(trxOutflow);
			let inflow = this.dataFormatter.unformatCurrency(trxInflow);

			if(this.minTransactionDate.isAfter(date))
				this.minTransactionDate = date.clone();

			if(this.maxTransactionDate.isBefore(date))
				this.maxTransactionDate = date.clone();
			
			var transaction = EntityFactory.createNewTransaction();
			transaction.accountId = accountEntity ? accountEntity.entityId : null;
			transaction.payeeId = payeeEntity ? payeeEntity.entityId : null;
			transaction.subCategoryId = subCategoryEntity ? subCategoryEntity.entityId : null;
			transaction.date = date.getUTCTime();
			transaction.amount = outflow > 0 ? -outflow : inflow;
			transaction.cleared = trxCleared;
			this.updatedEntities.transactions.push(transaction);

			// If this is a transfer transaction, then add it to the transfer transactions array.
			// Once we have created all the transactions, we are going to go through the transfer
			// transactions and fix up their relationships.
			if(payeeEntity && payeeEntity.accountId) {
				transferTransactions.push(transaction);
				transferTransactionsByAccount.setValue(transaction.accountId, transaction);
			}
		}

		// Let's now iterate through all the transfer transactions that we created, and point them towards their counterparts
		_.forEach(transferTransactions, (transaction)=>{

			// Check to see if we have already fixed up this transaction
			if(!transaction.transferAccountId) {

				// Get the account and payee for this transaction
				let account = this.accountsMapById[transaction.accountId];
				let payeeEntity = this.payeesMapById[transaction.payeeId];
				// Get the account and payee for the other side of the transaction 
				let accountForOtherSide = this.accountsMapById[payeeEntity.accountId];
				let payeeForOtherSide = this.payeesMap[`Transfer : ${account.accountName}`];
				let date = DateWithoutTime.createFromUTCTime(transaction.date);
				let outflow = transaction.amount < 0 ? -transaction.amount : 0;
				let inflow = transaction.amount > 0 ? transaction.amount : 0;

				// Get all the transfer transactions for the account to which this is transferring
				var accountForOtherSideTransactions = transferTransactionsByAccount.getValue(accountForOtherSide.entityId);
				// Iterate through these to find a match
				_.forEach(accountForOtherSideTransactions, (otherSideTransaction)=>{

					if(otherSideTransaction.payeeId == payeeForOtherSide.entityId &&
						otherSideTransaction.date == transaction.date &&
						otherSideTransaction.amount == -transaction.amount &&
						!otherSideTransaction.transferAccountId) {

						// We have got a match. Update both these transactions to point to each other
						transaction.transferAccountId = accountForOtherSide.entityId;
						transaction.transferTransactionId = otherSideTransaction.entityId;

						otherSideTransaction.transferAccountId = account.entityId;
						otherSideTransaction.transferTransactionId = transaction.entityId;
						return false;
					}
				});
			}
		});

		// *************************************************************************************************
		// Fourth Step: Create/Update MonthlyBudget and MonthlySubCategoryBudget entities
		// *************************************************************************************************
		for(var i:number = 1; i < budgetRows.length; i++) {

			let budgetRow = budgetRows[i];
			let monthString = budgetRow[0];
			let subCategoryFullName = budgetRow[1]; 
			let masterCategoryName = budgetRow[2];
			let subCategoryName = budgetRow[3];
			let budgetedString = budgetRow[4];

			let month = DateWithoutTime.createFromString(monthString, 'MMM YYYY');
			let subCategoryEntity = this.subCategoriesMap[subCategoryFullName];
			let budgeted = this.dataFormatter.unformatCurrency(budgetedString);

			// Ensure that monthlyBudget and monthlySubCategoryBudget entities are created for the month
			this.ensureMonthlyBudgetEntities(month);
			// Get the monthlySubCategoryBudget entity for the above values
			var monthlySubCategoryBudgetId = KeyGenerator.getMonthlySubCategoryBudgetIdentity(subCategoryEntity.entityId, month);
			var monthlySubCategoryBudget = this.monthlySubCategoryBudgetsMapById[monthlySubCategoryBudgetId];
			monthlySubCategoryBudget.budgeted = budgeted;
			// Add this to the updatedEntities collection provided we have not already done so
			if(!this.updatedMonthlySubCategoryBudgetsMapById[monthlySubCategoryBudgetId])
				this.updatedEntities.monthlySubCategoryBudgets.push(monthlySubCategoryBudget);
		}

		// *************************************************************************************************
		// Final Step: Update the firstMonth and lastMonth values in the active budget entity
		// *************************************************************************************************
		// Update the active budget entity with the minTransactionDate
		var updatedBudget = Object.assign({}, this.activeBudget);
		updatedBudget.firstMonth = this.minTransactionDate.startOfMonth().toISOString();
		updatedBudget.lastMonth = this.maxTransactionDate.startOfMonth().toISOString();
		this.updatedEntities.budgets.push(updatedBudget);
	}

	private ensurePayee(payeeName:string):void {

		if(payeeName != "") {

			// Check if we have already added the payee to our map.
			var payeeEntity = this.payeesMap[payeeName];
			if(!payeeEntity) {

				// Do we already have a payee by this name in our existing entities
				payeeEntity = this.existingEntitiesCollection.payees.getPayeeByName(payeeName);
				if(!payeeEntity) {
					// Create a payee entity and add to the updatedEntities collection
					payeeEntity = EntityFactory.createNewPayee();
					payeeEntity.name = payeeName;
					this.updatedEntities.payees.push(payeeEntity);
				}

				// Add this payee entity to our map for quick lookup during transactions parsing
				this.payeesMap[payeeEntity.name] = payeeEntity;
				this.payeesMapById[payeeEntity.entityId] = payeeEntity;
			}
		}
	}

	private ensureCategory(subCategoryFullName:string, masterCategoryName:string, subCategoryName:string):void {

		if(subCategoryName != "" && subCategoryFullName != "Inflow: To be Budgeted") {

			// Check if we have already added the master category to our map.
			var masterCategoryEntity = this.masterCategoriesMap[masterCategoryName];
			if(!masterCategoryEntity) {

				// Do we already have a master category by this name in our existing entities
				masterCategoryEntity = this.existingEntitiesCollection.masterCategories.getMasterCategoryByName(masterCategoryName);
				if(!masterCategoryEntity) {
					// Create a master category entity and add to the updatedEntities collection
					masterCategoryEntity = EntityFactory.createNewMasterCategory();
					masterCategoryEntity.name = masterCategoryName;
					masterCategoryEntity.sortableIndex = this.getNextSortableIndexForMasterCategory();
					this.updatedEntities.masterCategories.push(masterCategoryEntity);
				}

				// Add this master category entity to our map for quick lookup during transactions parsing
				this.masterCategoriesMap[masterCategoryName] = masterCategoryEntity;
			}

			// Check if we have already added the subcategory to our map.
			var subCategoryEntity = this.subCategoriesMap[subCategoryFullName];
			if(!subCategoryEntity) {

				// Do we already have a subcategory by this name in our existing entities
				subCategoryEntity = this.existingEntitiesCollection.subCategories.getSubCategoryByName(subCategoryName);
				if(!subCategoryEntity || subCategoryEntity.masterCategoryId != masterCategoryEntity.entityId) {

					// Create a subcategory entity and add to the updatedEntities collection
					subCategoryEntity = EntityFactory.createNewSubCategory();
					subCategoryEntity.name = subCategoryName;
					subCategoryEntity.masterCategoryId = masterCategoryEntity.entityId;
					subCategoryEntity.sortableIndex = this.getNextSortableIndexForSubCategory(masterCategoryEntity.entityId);
					this.updatedEntities.subCategories.push(subCategoryEntity);
				}

				// Add this subcategory entity to our map for quick lookup during transactions parsing
				this.subCategoriesMap[subCategoryFullName] = subCategoryEntity;
			}
		}
	}

	private ensureMonthlyBudgetEntities(month:DateWithoutTime):void {

		// Have we already ensured the existence of monthlyBudget for this month?
		var monthlyBudgetId = KeyGenerator.getMonthlyBudgetIdentity(this.activeBudget.entityId, month);
		var monthlyBudget = this.monthlyBudgetsMapById[monthlyBudgetId];

		if(!monthlyBudget) {
			
			// Do we have a monthly budget entity for this month in the existing entities
			var monthlyBudget = this.existingEntitiesCollection.monthlyBudgets.getMonthlyBudgetByMonth(month.toISOString());
			if(!monthlyBudget) {

				// Create the monthly budget entity
				monthlyBudget = EntityFactory.createNewMonthlyBudget(this.activeBudget.entityId, month);
				this.updatedEntities.monthlyBudgets.push(monthlyBudget);

				// Create the monthly subcategory budget entities for all existing subcategories
				_.forEach(this.existingEntitiesCollection.subCategories.getAllItems(), (subCategory)=>{
					var monthlySubCategoryBudget = EntityFactory.createNewMonthlySubCategoryBudget(this.activeBudget.entityId, subCategory.entityId, month);
					this.updatedEntities.monthlySubCategoryBudgets.push(monthlySubCategoryBudget);
					this.monthlySubCategoryBudgetsMapById[monthlySubCategoryBudget.entityId] = monthlySubCategoryBudget;
					this.updatedMonthlySubCategoryBudgetsMapById[monthlySubCategoryBudget.entityId] = monthlySubCategoryBudget;
				});
			}
			else {

				// The monthly subcategory budget entities for the existing subcategories already exist. Just
				// add them to the map so that we can look them up later easily.
				_.forEach(this.existingEntitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsByMonth(month.toISOString()), (monthlySubCategoryBudget)=>{
					this.monthlySubCategoryBudgetsMapById[monthlySubCategoryBudget.entityId] = monthlySubCategoryBudget;
				});
			}

			// Create the monthly subcategory budget entities for all newly created subcategories and add them to the map
			_.forEach(this.updatedEntities.subCategories, (subCategory)=>{
				var monthlySubCategoryBudget = EntityFactory.createNewMonthlySubCategoryBudget(this.activeBudget.entityId, subCategory.entityId, month);
				this.updatedEntities.monthlySubCategoryBudgets.push(monthlySubCategoryBudget);
				this.monthlySubCategoryBudgetsMapById[monthlySubCategoryBudget.entityId] = monthlySubCategoryBudget;
				this.updatedMonthlySubCategoryBudgetsMapById[monthlySubCategoryBudget.entityId] = monthlySubCategoryBudget;
			});

			this.monthlyBudgetsMapById[monthlyBudget.entityId] = monthlyBudget;
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

			// Check if we have already added this to our map.
			if(accountsMap[accountName])
				accountFound = true;
			else {

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
			}

			if(accountFound == false) {
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