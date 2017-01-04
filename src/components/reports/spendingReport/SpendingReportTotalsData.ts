/// <reference path='../../../_includes.ts' />

import * as _ from 'lodash';

import { SimpleObjectMap, MultiDictionary } from '../../../utilities';
import { ISpendingReportItemData } from '../../../interfaces/reports';

export class SpendingReportTotalsData {

	private overallItemDataMap:SimpleObjectMap<ISpendingReportItemData> = {};
	private monthlyItemDataMap = new MultiDictionary<string, ISpendingReportItemData>();

	public getSpendingReportItemData(itemId:string, itemName:string, monthName:string):ISpendingReportItemData {

		// First check if we already have an existing item against this itemId
		var itemData = this.overallItemDataMap[itemId];
		// If it is not found, then create and return a new one
		if(!itemData) {
			
			itemData = {
				itemId: itemId,
				itemName: itemName,
				monthName: monthName,
				value: 0,
				percentageOfTotal: 0
			};

			this.overallItemDataMap[itemId] = itemData;
			this.monthlyItemDataMap.setValue(monthName, itemData);
		}

		return itemData;
	}

	public getOverallItemDataArray():Array<ISpendingReportItemData> {

		var keys = _.keys(this.overallItemDataMap);
		var itemDataArray:Array<ISpendingReportItemData> = _.map(keys, (key)=>{
			return this.overallItemDataMap[key];
		});

		// Sort the items by value in descending order
		itemDataArray = _.orderBy(itemDataArray, ["value"], ["desc"]);
		return itemDataArray;
	}

	public getTotalSpending():number {

		var keys = _.keys(this.overallItemDataMap);
		var totalSpending = _.reduce(keys, (sum , key)=>{
			var itemData = this.overallItemDataMap[key];
			return sum + itemData.value;
		}, 0);

		return totalSpending;
	}
}
