/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { SimpleObjectMap, RegisterTransactionObject } from '../utilities';

export class RegisterTransactionObjectsArray extends EntitiesArray<RegisterTransactionObject> {

/*
	private selectedIds:Array<string> = [];
	private selectionMap:SimpleObjectMap<boolean> = {};

	public isSelected(registerTransactionObject:RegisterTransactionObject):boolean {

		var entityId:string;
		// Select the entityId based on the type of the object
		if(registerTransactionObject.entityType == "transaction" || registerTransactionObject.entityType == "subTransaction")
			entityId = registerTransactionObject.refTransaction.entityId;
		else
			entityId = registerTransactionObject.refScheduledTransaction.entityId;

		if(this.selectionMap[entityId] == true)
			return true;
		else
			return false;
	}

	public selectTransaction(registerTransactionObject:RegisterTransactionObject, unselectAllOthers:boolean):void {
		
		if(unselectAllOthers) {
			this.selectedIds = [];
			this.selectionMap = {};
		}

		var entityId:string;
		// Select the entityId based on the type of the object
		if(registerTransactionObject.entityType == "transaction" || registerTransactionObject.entityType == "subTransaction")
			entityId = registerTransactionObject.refTransaction.entityId;
		else
			entityId = registerTransactionObject.refScheduledTransaction.entityId;

		// Only mark it as selected, if it is not already marked.
		if(this.selectionMap[entityId] != true) {
			this.selectedIds.push(entityId);
			this.selectionMap[entityId] = true;
		}
	}

	public unselectTransaction(registerTransactionObject:RegisterTransactionObject):void {

		var entityId:string;
		// Select the entityId based on the type of the object
		if(registerTransactionObject.entityType == "transaction" || registerTransactionObject.entityType == "subTransaction")
			entityId = registerTransactionObject.refTransaction.entityId;
		else
			entityId = registerTransactionObject.refScheduledTransaction.entityId;

		var index = _.findIndex(this.selectedIds, {entityId: entityId});
		this.selectedIds.splice(index, 1);
		this.selectionMap[entityId] = false;
	}

	public selectAllTransactions():void {

		_.forEach(this, (registerTransactionObject)=>{

			var entityId:string;
			// Select the entityId based on the type of the object
			if(registerTransactionObject.entityType == "transaction" || registerTransactionObject.entityType == "subTransaction")
				entityId = registerTransactionObject.refTransaction.entityId;
			else
				entityId = registerTransactionObject.refScheduledTransaction.entityId;

			// Mark it as selected, if it is not already selected.
			if(this.selectionMap[entityId] != true) {
				this.selectedIds.push(entityId);
				this.selectionMap[entityId] = true;
			}
		});
	}

	public unselectAllTransactions():void {

		// Simply reset the variables that we were using to keep track of selection
		this.selectedIds = [];
		this.selectionMap = {};
	}
*/	
}
