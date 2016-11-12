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

		// If we are not already sorting by either "Outflow" or "Inflow", then add 
		// ascending "Amount" at the end of the fieldNames.
		var addAmountSorting = true;
		_.forEach(fieldNames, (fieldName)=>{
			if(fieldName == "outflow" || fieldName == 'inflow')
				addAmountSorting = false;
		});

		var combinedFieldNames:Array<string>;
		var combinedSortOrders:Array<string>;

		if(addAmountSorting == true) {
			combinedFieldNames = ["entityType"].concat(fieldNames, ["amount"]);
			combinedSortOrders = ["asc"].concat(sortOrders, ["asc"]);
		}
		else {
			combinedFieldNames = ["entityType"].concat(fieldNames);
			combinedSortOrders = ["asc"].concat(sortOrders);
		}

		this.internalArray = _.orderBy(this.internalArray, combinedFieldNames, combinedSortOrders);
	}

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
