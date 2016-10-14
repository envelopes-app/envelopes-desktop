/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { ITransaction } from '../interfaces/budgetEntities';
import { DateWithoutTime, MultiDictionary } from '../utilities';

export class TransactionsArray extends EntitiesArray<ITransaction> {

	private transactionsByMonthDictionary = new MultiDictionary<string, ITransaction>();
	private transactionsByAccountIdDictionary = new MultiDictionary<string, ITransaction>();

	constructor(initialValues:Array<ITransaction>) {
		super(initialValues);

		// Iterate through the passed array, and save references to the monthly subcategory budgets by month
		_.forEach(initialValues, (transaction:ITransaction)=>{
			var month = DateWithoutTime.createFromUTCTime(transaction.date).startOfMonth();
			this.transactionsByMonthDictionary.setValue(month.toISOString(), transaction);
			this.transactionsByAccountIdDictionary.setValue(transaction.accountId, transaction);
		});
	}

	public getTransactionsByMonth(month:DateWithoutTime):Array<ITransaction> {
		return this.transactionsByMonthDictionary.getValue(month.toISOString());
	}

	public getTransactionsByAccountId(accountId:string):Array<ITransaction> {
		return this.transactionsByAccountIdDictionary.getValue(accountId);
	}

	public getTransactionsForAccountByPayeeId(accountId:string, payeeId:string):Array<ITransaction> {

		var accountTransactions = this.getTransactionsByAccountId(accountId);
		return _.filter(accountTransactions, {payeeId: payeeId});
	}

	public getTransactionsForAccountBySubCategoryId(accountId:string, subCategoryId:string):Array<ITransaction> {

		var accountTransactions = this.getTransactionsByAccountId(accountId);
		return _.filter(accountTransactions, {subCategoryId: subCategoryId});
	}

	protected addEntity(transaction:ITransaction):void {

		if(!this.transactionsByMonthDictionary)
			this.transactionsByMonthDictionary = new MultiDictionary<string, ITransaction>();

		if(!this.transactionsByAccountIdDictionary)
			this.transactionsByAccountIdDictionary = new MultiDictionary<string, ITransaction>();

		super.addEntity(transaction);
		var month = DateWithoutTime.createFromUTCTime(transaction.date).startOfMonth();
		this.transactionsByMonthDictionary.setValue(month.toISOString(), transaction);
		this.transactionsByAccountIdDictionary.setValue(transaction.accountId, transaction);
	}

	protected removeEntityById(entityId:string):ITransaction {
		var removedTransaction = super.removeEntityById(entityId);
		if(removedTransaction) {

			var month = DateWithoutTime.createFromUTCTime(removedTransaction.date).startOfMonth();
			this.transactionsByMonthDictionary.remove(month.toISOString(), removedTransaction);
			this.transactionsByAccountIdDictionary.remove(removedTransaction.accountId, removedTransaction);
		}
		
		return removedTransaction; 
	}
}
