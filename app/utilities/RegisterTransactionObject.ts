/// <reference path='../_includes.ts' />

import { InternalCategories } from '../constants'; 
import { DateWithoutTime } from './DateWithoutTime';
import { SimpleObjectMap } from './SimpleObjectMap';
import { SerializationUtilities } from './SerializationUtilities'; 
import { IEntitiesCollection } from '../interfaces/state';
import * as budgetEntities from '../interfaces/budgetEntities';

export class RegisterTransactionObject {

	public entityType:string;
	public refTransaction:budgetEntities.ITransaction;
	public refSubTransaction:budgetEntities.ISubTransaction;
	public refScheduledTransaction:budgetEntities.IScheduledTransaction;
	public refScheduledSubTransaction:budgetEntities.IScheduledSubTransaction;
	public refPayee:budgetEntities.IPayee;
	public refSubCategory:budgetEntities.ISubCategory;
	public refMasterCategory:budgetEntities.IMasterCategory;

	public entityId:string;
	public parentEntityId:string;
	public isSplit:boolean;
	public date:string;
	public accountName:string;
	public accountOnBudget:boolean;
	public flag:string;
	public payeeName:string;
	public categoryName:string;
	public memo:string;
	public inflow:number;
	public outflow:number;
	public cleared:string;

	// ****************************************************************************************************
	// Utility Methods
	// ****************************************************************************************************
	public isSelected(selectedTransactionsMap:SimpleObjectMap<boolean>):boolean {

		var selected:boolean = false;
		var selectedValue:boolean;
		if(this.entityType == "transaction" || this.entityType == "subTransaction")
			selectedValue = selectedTransactionsMap[this.refTransaction.entityId];
		else 
			selectedValue = selectedTransactionsMap[this.refScheduledTransaction.entityId];

		if(selectedValue && selectedValue == true)
			selected = true;

		return selected;
	}

	public checkIfObjectIsStale(entitiesCollection:IEntitiesCollection):boolean {

		// We are basically going to compare the source entities of the registerTransactionObject with the entities
		// in the entitiesCollection to see if anything has changed.
		if(this.entityType == "transaction") {
			var transaction1 = this.refTransaction;
			var transaction2 = entitiesCollection.transactions.getEntityById(transaction1.entityId);
			if(transaction1 !== transaction2)
				return true;
		}
		else if(this.entityType == "subTransaction") {
			var subTransaction1 = this.refSubTransaction;
			var subTransaction2 = entitiesCollection.subTransactions.getEntityById(subTransaction1.entityId);
			if(subTransaction1 !== subTransaction2)
				return true;
		}
		else if(this.entityType == "scheduledTransaction") {
			var scheduledTransaction1 = this.refScheduledTransaction;
			var scheduledTransaction2 = entitiesCollection.scheduledTransactions.getEntityById(scheduledTransaction1.entityId);
			if(scheduledTransaction1 !== scheduledTransaction2)
				return true;
		}
		else if(this.entityType == "scheduledSubTransaction") {
			var scheduledSubTransaction1 = this.refScheduledSubTransaction;
			var scheduledSubTransaction2 = entitiesCollection.scheduledSubTransactions.getEntityById(scheduledSubTransaction1.entityId);
			if(scheduledSubTransaction1 !== scheduledSubTransaction2)
				return true;
		}

		var payee1 = this.refPayee;
		var payee2 = payee1 ? entitiesCollection.payees.getEntityById(payee1.entityId) : null;
		if(payee1 && payee2 && payee1 !== payee2)
			return true;

		var subCategory1 = this.refSubCategory;
		var subCategory2 = subCategory1 ? entitiesCollection.subCategories.getEntityById(subCategory1.entityId) : null;
		if(subCategory1 && subCategory2 && subCategory1 !== subCategory2)
			return true;

		var masterCategory1 = this.refMasterCategory;
		var masterCategory2 = masterCategory1 ? entitiesCollection.masterCategories.getEntityById(masterCategory1.entityId) : null;
		if(masterCategory1 && masterCategory2 && masterCategory1 !== masterCategory2)
			return true;

		return false;
	}

	// ****************************************************************************************************
	// Static Factory Methods
	// ****************************************************************************************************
	public static createFromTransaction(transaction:budgetEntities.ITransaction, entitiesCollection:IEntitiesCollection):RegisterTransactionObject {

		var account = entitiesCollection.accounts.getEntityById(transaction.accountId);
		var payee = transaction.payeeId ? entitiesCollection.payees.getEntityById(transaction.payeeId) : null;
		var subCategory = transaction.subCategoryId ? entitiesCollection.subCategories.getEntityById(transaction.subCategoryId) : null;
		var masterCategory = subCategory ? entitiesCollection.masterCategories.getEntityById(subCategory.masterCategoryId) : null;

		var registerTransactionObject = new RegisterTransactionObject();
		registerTransactionObject.entityType = "transaction";
		registerTransactionObject.refTransaction = transaction;
		registerTransactionObject.entityId = transaction.entityId;
		registerTransactionObject.date = DateWithoutTime.createFromUTCTime(transaction.date).toISOString();
		registerTransactionObject.accountName = account.accountName;
		registerTransactionObject.accountOnBudget = (account.onBudget == 1);
		registerTransactionObject.flag = transaction.flag;

		if(payee) {
			registerTransactionObject.refPayee = payee;
			registerTransactionObject.payeeName = payee.name;
		}
		else {
			registerTransactionObject.payeeName = "";
		}

		if(subCategory && masterCategory) {

			registerTransactionObject.refSubCategory = subCategory;
			registerTransactionObject.refMasterCategory = masterCategory;
			if(subCategory.internalName == InternalCategories.SplitSubCategory) {
				registerTransactionObject.categoryName = "Split (Multiple Categories)...";
				registerTransactionObject.isSplit = true;
			}
			else if(subCategory.internalName == InternalCategories.ImmediateIncomeSubCategory) {
				registerTransactionObject.categoryName = "Inflow: To be Budgeted";
				registerTransactionObject.isSplit = false;
			}
			else {
				registerTransactionObject.categoryName = `${masterCategory.name}: ${subCategory.name}`;
				registerTransactionObject.isSplit = false;
			}
		}
		else {
			registerTransactionObject.categoryName = "";
			registerTransactionObject.isSplit = false;
		}

		registerTransactionObject.memo = transaction.memo ? transaction.memo : "";
		registerTransactionObject.outflow = transaction.amount < 0 ? -transaction.amount : 0;
		registerTransactionObject.inflow = transaction.amount > 0 ? transaction.amount : 0;
		registerTransactionObject.cleared = transaction.cleared;
		return registerTransactionObject;
	}
 
	public static createFromSubTransaction(subTransaction:budgetEntities.ISubTransaction, transaction:budgetEntities.ITransaction, entitiesCollection:IEntitiesCollection):RegisterTransactionObject {

		var account = entitiesCollection.accounts.getEntityById(transaction.accountId);
		var payee = subTransaction.payeeId ? entitiesCollection.payees.getEntityById(subTransaction.payeeId) : null;
		var subCategory = subTransaction.subCategoryId ? entitiesCollection.subCategories.getEntityById(subTransaction.subCategoryId) : null;
		var masterCategory = subCategory ? entitiesCollection.masterCategories.getEntityById(subCategory.masterCategoryId) : null;

		var registerTransactionObject = new RegisterTransactionObject();
		registerTransactionObject.entityType = "subTransaction";
		registerTransactionObject.refTransaction = transaction;
		registerTransactionObject.refSubTransaction = subTransaction;
		registerTransactionObject.entityId = subTransaction.entityId;
		registerTransactionObject.parentEntityId = transaction.entityId;
		registerTransactionObject.date = DateWithoutTime.createFromUTCTime(transaction.date).toISOString();
		registerTransactionObject.accountName = account.accountName;
		registerTransactionObject.accountOnBudget = (account.onBudget == 1);
		registerTransactionObject.flag = null;

		if(payee) {
			registerTransactionObject.refPayee = payee;
			registerTransactionObject.payeeName = payee.name;
		}
		else {
			registerTransactionObject.payeeName = "";
		}

		if(subCategory && masterCategory) {
			registerTransactionObject.refSubCategory = subCategory;
			registerTransactionObject.refMasterCategory = masterCategory;
			if(subCategory.internalName == InternalCategories.ImmediateIncomeSubCategory)
				registerTransactionObject.categoryName = "Inflow: To be Budgeted";
			else
				registerTransactionObject.categoryName = `${masterCategory.name}: ${subCategory.name}`;
		}
		else {
			registerTransactionObject.categoryName = "";
		}

		registerTransactionObject.isSplit = false;
		registerTransactionObject.memo = subTransaction.memo ? subTransaction.memo : "";
		registerTransactionObject.outflow = subTransaction.amount < 0 ? -subTransaction.amount : 0;
		registerTransactionObject.inflow = subTransaction.amount > 0 ? subTransaction.amount : 0;
		registerTransactionObject.cleared = null;
		return registerTransactionObject;
	}

	public static createFromScheduledTransaction(scheduledTransaction:budgetEntities.IScheduledTransaction, entitiesCollection:IEntitiesCollection):RegisterTransactionObject {

		var registerTransactionObject:RegisterTransactionObject = null;
		var upcomingInstances = scheduledTransaction.upcomingInstances;
		var upcomingInstanceDates = upcomingInstances ? SerializationUtilities.deserializeISODateArray(upcomingInstances) : null;
		if(upcomingInstanceDates && upcomingInstanceDates.length > 0) {
		
			var account = entitiesCollection.accounts.getEntityById(scheduledTransaction.accountId);
			var payee = scheduledTransaction.payeeId ? entitiesCollection.payees.getEntityById(scheduledTransaction.payeeId) : null;
			var subCategory = scheduledTransaction.subCategoryId ? entitiesCollection.subCategories.getEntityById(scheduledTransaction.subCategoryId) : null;
			var masterCategory = subCategory ? entitiesCollection.masterCategories.getEntityById(subCategory.masterCategoryId) : null;

			registerTransactionObject = new RegisterTransactionObject();
			registerTransactionObject.entityType = "scheduledTransaction";
			registerTransactionObject.refScheduledTransaction = scheduledTransaction;
			registerTransactionObject.entityId = scheduledTransaction.entityId;
			registerTransactionObject.date = upcomingInstanceDates[0];
			registerTransactionObject.accountName = account.accountName;
			registerTransactionObject.accountOnBudget = (account.onBudget == 1);
			registerTransactionObject.flag = scheduledTransaction.flag;

			if(payee) {
				registerTransactionObject.refPayee = payee;
				registerTransactionObject.payeeName = payee.name;
			}
			else {
				registerTransactionObject.payeeName = "";
			}

			if(subCategory && masterCategory) {

				registerTransactionObject.refSubCategory = subCategory;
				registerTransactionObject.refMasterCategory = masterCategory;
				if(subCategory.internalName == InternalCategories.SplitSubCategory) {
					registerTransactionObject.categoryName = "Split (Multiple Categories)...";
					registerTransactionObject.isSplit = true;
				}
				else if(subCategory.internalName == InternalCategories.ImmediateIncomeSubCategory) {
					registerTransactionObject.categoryName = "Inflow: To be Budgeted";
					registerTransactionObject.isSplit = false;
				}
				else {
					registerTransactionObject.categoryName = `${masterCategory.name}: ${subCategory.name}`;
					registerTransactionObject.isSplit = false;
				}
			}
			else {
				registerTransactionObject.categoryName = "";
				registerTransactionObject.isSplit = false;
			}

			registerTransactionObject.memo = scheduledTransaction.memo ? scheduledTransaction.memo : "";
			registerTransactionObject.outflow = scheduledTransaction.amount < 0 ? -scheduledTransaction.amount : 0;
			registerTransactionObject.inflow = scheduledTransaction.amount > 0 ? scheduledTransaction.amount : 0;
			registerTransactionObject.cleared = null;
		}

		return registerTransactionObject;
	}
 
	public static createFromScheduledSubTransaction(scheduledSubTransaction:budgetEntities.IScheduledSubTransaction, scheduledTransaction:budgetEntities.IScheduledTransaction, entitiesCollection:IEntitiesCollection):RegisterTransactionObject {

		var registerTransactionObject:RegisterTransactionObject = null;
		var upcomingInstances = scheduledTransaction.upcomingInstances;
		var upcomingInstanceDates = upcomingInstances ? SerializationUtilities.deserializeISODateArray(upcomingInstances) : null;
		if(upcomingInstanceDates && upcomingInstanceDates.length > 0) {
		
			var account = entitiesCollection.accounts.getEntityById(scheduledTransaction.accountId);
			var payee = scheduledSubTransaction.payeeId ? entitiesCollection.payees.getEntityById(scheduledSubTransaction.payeeId) : null;
			var subCategory = scheduledSubTransaction.subCategoryId ? entitiesCollection.subCategories.getEntityById(scheduledSubTransaction.subCategoryId) : null;
			var masterCategory = subCategory ? entitiesCollection.masterCategories.getEntityById(subCategory.masterCategoryId) : null;

			registerTransactionObject = new RegisterTransactionObject();
			registerTransactionObject.entityType = "scheduledSubTransaction";
			registerTransactionObject.refScheduledTransaction = scheduledTransaction;
			registerTransactionObject.refScheduledSubTransaction = scheduledSubTransaction;
			registerTransactionObject.entityId = scheduledSubTransaction.entityId;
			registerTransactionObject.parentEntityId = scheduledTransaction.entityId;
			registerTransactionObject.date = upcomingInstanceDates[0];
			registerTransactionObject.accountName = account.accountName;
			registerTransactionObject.accountOnBudget = (account.onBudget == 1);
			registerTransactionObject.flag = null;

			if(payee) {
				registerTransactionObject.refPayee = payee;
				registerTransactionObject.payeeName = payee.name;
			}
			else {
				registerTransactionObject.payeeName = "";
			}

			if(subCategory && masterCategory) {
				registerTransactionObject.refSubCategory = subCategory;
				registerTransactionObject.refMasterCategory = masterCategory;
				if(subCategory.internalName == InternalCategories.ImmediateIncomeSubCategory)
					registerTransactionObject.categoryName = "Inflow: To be Budgeted";
				else
					registerTransactionObject.categoryName = `${masterCategory.name}: ${subCategory.name}`;
			}
			else {
				registerTransactionObject.categoryName = "";
			}

			registerTransactionObject.isSplit = false;
			registerTransactionObject.memo = scheduledSubTransaction.memo ? scheduledSubTransaction.memo : "";
			registerTransactionObject.outflow = scheduledSubTransaction.amount < 0 ? -scheduledSubTransaction.amount : 0;
			registerTransactionObject.inflow = scheduledSubTransaction.amount > 0 ? scheduledSubTransaction.amount : 0;
			registerTransactionObject.cleared = null;
		}

		return registerTransactionObject;
	}
}