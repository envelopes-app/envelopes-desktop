/// <reference path='../../../_includes.ts' />

import * as _ from 'lodash';

import { SimpleObjectMap } from '../../../utilities';
import { ISpendingReportItemData } from '../../../interfaces/reports';

export class SpendingReportTotalsData {

	private itemDataMap:SimpleObjectMap<ISpendingReportItemData> = {};

	public getSpendingReportItemData(itemId:string, itemName:string):ISpendingReportItemData {

		// First check if we already have an existing item against this itemId
		var itemData = this.itemDataMap[itemId];
		// If it is not found, then create and return a new one
		if(!itemData) {
			
			itemData = {
				itemId: itemId,
				itemName: itemName,
				monthName: null,
				value: 0,
				percentageOfTotal: 0
			};

			this.itemDataMap[itemId] = itemData;
		}

		return itemData;
	}

	public getItemIds():Array<string> {

		var keys = _.keys(this.itemDataMap);
		return keys;
	}

	public getItemDataArray():Array<ISpendingReportItemData> {

		var keys = this.getItemIds();
		var itemDataArray:Array<ISpendingReportItemData> = _.map(keys, (key)=>{
			return this.itemDataMap[key];
		});

		return itemDataArray;
	}
}
