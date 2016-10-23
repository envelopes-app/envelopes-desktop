/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { SimpleObjectMap, RegisterTransactionObject } from '../utilities';
import { MultiDictionary } from '../utilities';

export class RegisterTransactionObjectsArray extends EntitiesArray<RegisterTransactionObject> {

	private objectsByparentEntityIdDictionary = new MultiDictionary<string, RegisterTransactionObject>();

	constructor(initialValues:Array<RegisterTransactionObject> = null) {
		super(initialValues);

		// Iterate through the passed array, and save references to the registerTransactionObjects by parentEntityId
		_.forEach(initialValues, (registerTransactionObject:RegisterTransactionObject)=>{
			if(registerTransactionObject.entityType == "subTransaction" || registerTransactionObject.entityType == "scheduledSubTransaction") {
				this.objectsByparentEntityIdDictionary.setValue(registerTransactionObject.parentEntityId, registerTransactionObject);
			}
		});
	}

	public sortArray(fieldNames:Array<string>, sortOrders:Array<string>):void {

		var combinedFieldNames = ["entityType"].concat(fieldNames);
		var combinedSortOrders = ["asc"].concat(sortOrders);
		this.internalArray = _.orderBy(this.internalArray, combinedFieldNames, combinedSortOrders);
	}

//	protected getIndexForInsertion(registerTransactionObject:RegisterTransactionObject):number {
//
//		// We will get fancy later. For now, just hard code sorting by the date field.
//		var index = _.sortedLastIndexBy(this, registerTransactionObject, 'date');
//		return index;
//	}

	public getObjectsByParentEntityId(parentEntityId:string):Array<RegisterTransactionObject> {
		return this.objectsByparentEntityIdDictionary.getValue(parentEntityId);
	}

	protected addEntity(registerTransactionObject:RegisterTransactionObject):void {

		if(!this.objectsByparentEntityIdDictionary)
			this.objectsByparentEntityIdDictionary = new MultiDictionary<string, RegisterTransactionObject>();

		super.addEntity(registerTransactionObject);
		if(registerTransactionObject.entityType == "subTransaction" || registerTransactionObject.entityType == "scheduledSubTransaction") {
			this.objectsByparentEntityIdDictionary.setValue(registerTransactionObject.parentEntityId, registerTransactionObject);
		}
	}

	public removeEntityById(entityId:string):RegisterTransactionObject {

		var removedObject = super.removeEntityById(entityId);
		if(removedObject) {
			if(removedObject.entityType == "transaction" || removedObject.entityType == "scheduledTransaction") {

				// We remove a registerTransactionObject that was representing a transaction or a scheduled transaction
				// if it was a split, we need to make sure that we also remove it's children
				if(removedObject.isSplit) {

					var childRegisterTransactionObjects = this.getObjectsByParentEntityId(removedObject.entityId);
					_.forEach(childRegisterTransactionObjects, (childRegisterTransactionObject)=>{
						
						var removedChildObject = super.removeEntityById(childRegisterTransactionObject.entityId);
						this.objectsByparentEntityIdDictionary.remove(removedChildObject.parentEntityId, removedChildObject);
					});
				}
			}
			else if(removedObject.entityType == "subTransaction" || removedObject.entityType == "scheduledSubTransaction") {
				this.objectsByparentEntityIdDictionary.remove(removedObject.parentEntityId, removedObject);
			}
		}
		
		return removedObject; 
	}
}
