/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { RegisterTransactionObject } from '../utilities';

export class RegisterTransactionObjectsArray extends EntitiesArray<RegisterTransactionObject> {

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
}
