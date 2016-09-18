/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { ITransaction } from '../interfaces/budgetEntities';
import { MultiDictionary } from '../utilities';

export class TransactionsArray extends EntitiesArray<ITransaction> {

	private multiDictionary = new MultiDictionary<string, ITransaction>();

	constructor(initialValues:Array<ITransaction>) {
		super(initialValues);

		// Iterate through the passed array, and save references to the monthly subcategory budgets by month
		_.forEach(initialValues, (transaction:ITransaction)=>{
			this.multiDictionary.setValue(transaction.accountId, transaction);
		});
	}

	public getTransactionsByAccountId(accountId:string):Array<ITransaction> {
		return this.multiDictionary.getValue(accountId);
	}

	protected addEntity(transaction:ITransaction):void {

		if(!this.multiDictionary)
			this.multiDictionary = new MultiDictionary<string, ITransaction>();

		super.addEntity(transaction);
		this.multiDictionary.setValue(transaction.accountId, transaction);
	}

	protected removeEntityById(entityId:string):ITransaction {
		var removedTransaction = super.removeEntityById(entityId);
		if(removedTransaction)
			this.multiDictionary.remove(removedTransaction.accountId, removedTransaction);
		
		return removedTransaction; 
	}
}
