/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { IScheduledSubTransaction } from '../interfaces/budgetEntities';
import { MultiDictionary } from '../utilities';

export class ScheduledSubTransactionsArray extends EntitiesArray<IScheduledSubTransaction> {

	private subTransactionsByTransactionsIdDictionary = new MultiDictionary<string, IScheduledSubTransaction>();

	constructor(initialValues:Array<IScheduledSubTransaction>) {
		super(initialValues);

		// Iterate through the passed array, and save references to the subTransactions by transactionId
		_.forEach(initialValues, (subTransaction:IScheduledSubTransaction)=>{
			this.subTransactionsByTransactionsIdDictionary.setValue(subTransaction.scheduledTransactionId, subTransaction);
		});
	}

	public getSubTransactionsByTransactionId(transactionId:string):Array<IScheduledSubTransaction> {
		return this.subTransactionsByTransactionsIdDictionary.getValue(transactionId);
	}

	protected addEntity(subTransaction:IScheduledSubTransaction):void {

		if(!this.subTransactionsByTransactionsIdDictionary)
			this.subTransactionsByTransactionsIdDictionary = new MultiDictionary<string, IScheduledSubTransaction>();

		super.addEntity(subTransaction);
		this.subTransactionsByTransactionsIdDictionary.setValue(subTransaction.scheduledTransactionId, subTransaction);
	}

	public removeEntityById(entityId:string):IScheduledSubTransaction {
		var removedSubTransaction = super.removeEntityById(entityId);
		if(removedSubTransaction) {

			this.subTransactionsByTransactionsIdDictionary.remove(removedSubTransaction.scheduledTransactionId, removedSubTransaction);
		}
		
		return removedSubTransaction; 
	}
}
