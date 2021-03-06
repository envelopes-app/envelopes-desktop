/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { IScheduledTransaction } from '../interfaces/budgetEntities';
import { DateWithoutTime, MultiDictionary } from '../utilities';

export class ScheduledTransactionsArray extends EntitiesArray<IScheduledTransaction> {

	private transactionsByAccountIdDictionary = new MultiDictionary<string, IScheduledTransaction>();

	constructor(initialValues:Array<IScheduledTransaction>) {
		super(initialValues);

		// Iterate through the passed array, and save references to the transactions by month and accountId
		_.forEach(initialValues, (scheduledTransaction:IScheduledTransaction)=>{
			this.transactionsByAccountIdDictionary.setValue(scheduledTransaction.accountId, scheduledTransaction);
		});
	}

	public getTransactionsByAccountId(accountId:string):Array<IScheduledTransaction> {
		return this.transactionsByAccountIdDictionary.getValue(accountId);
	}

	public getTransactionsForAccountByPayeeId(accountId:string, payeeId:string):Array<IScheduledTransaction> {

		var accountTransactions = this.getTransactionsByAccountId(accountId);
		return _.filter(accountTransactions, {payeeId: payeeId});
	}

	public getTransactionsForAccountBySubCategoryId(accountId:string, subCategoryId:string):Array<IScheduledTransaction> {

		var accountTransactions = this.getTransactionsByAccountId(accountId);
		return _.filter(accountTransactions, {subCategoryId: subCategoryId});
	}

	public hasTransactionsForSubCategory(subCategoryId:string):boolean {

		var subCategoryTransaction = _.find(this.internalArray, (scheduledTransaction)=>{
			return (scheduledTransaction.isTombstone == 0 && scheduledTransaction.subCategoryId == subCategoryId);
		});

		return subCategoryTransaction ? true : false;
	}

	protected addEntity(scheduledTransaction:IScheduledTransaction):void {

		if(!this.transactionsByAccountIdDictionary)
			this.transactionsByAccountIdDictionary = new MultiDictionary<string, IScheduledTransaction>();

		super.addEntity(scheduledTransaction);
		this.transactionsByAccountIdDictionary.setValue(scheduledTransaction.accountId, scheduledTransaction);
	}

	public removeEntityById(entityId:string):IScheduledTransaction {
		var removedTransaction = super.removeEntityById(entityId);
		if(removedTransaction) {
			this.transactionsByAccountIdDictionary.remove(removedTransaction.accountId, removedTransaction);
		}
		
		return removedTransaction; 
	}
}