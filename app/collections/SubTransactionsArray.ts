/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { ISubTransaction } from '../interfaces/budgetEntities';
import { MultiDictionary } from '../utilities';

export class SubTransactionsArray extends EntitiesArray<ISubTransaction> {

	private subTransactionsByTransactionsIdDictionary = new MultiDictionary<string, ISubTransaction>();

	constructor(initialValues:Array<ISubTransaction>) {
		super(initialValues);

		// Iterate through the passed array, and save references to the subTransactions by transactionId
		_.forEach(initialValues, (subTransaction:ISubTransaction)=>{
			this.subTransactionsByTransactionsIdDictionary.setValue(subTransaction.transactionId, subTransaction);
		});
	}

	public getSubTransactionsByTransactionId(transactionId:string):Array<ISubTransaction> {
		return this.subTransactionsByTransactionsIdDictionary.getValue(transactionId);
	}

	protected addEntity(subTransaction:ISubTransaction):void {

		if(!this.subTransactionsByTransactionsIdDictionary)
			this.subTransactionsByTransactionsIdDictionary = new MultiDictionary<string, ISubTransaction>();

		super.addEntity(subTransaction);
		this.subTransactionsByTransactionsIdDictionary.setValue(subTransaction.transactionId, subTransaction);
	}

	protected removeEntityById(entityId:string):ISubTransaction {
		var removedSubTransaction = super.removeEntityById(entityId);
		if(removedSubTransaction) {

			this.subTransactionsByTransactionsIdDictionary.remove(removedSubTransaction.transactionId, removedSubTransaction);
		}
		
		return removedSubTransaction; 
	}
}
