/// <reference path='../../../_includes.ts' />

import * as _ from 'lodash';

import { SimpleObjectMap } from '../../../utilities';
import { ISpendingReportItemData } from '../../../interfaces/reports';

export class SpendingReportTrendsData {

	private itemDataMap:SimpleObjectMap<ISpendingReportItemData> = {};

	public getSpendingReportItemData(itemId:string, itemName:string, monthName:string):ISpendingReportItemData {

		var key = `${itemId}_${monthName}`;
		// First check if we already have an existing item against this
		var itemData = this.itemDataMap[key];
		// If it is not found, then create and return a new one
		if(!itemData) {
			
			itemData = {
				itemId: itemId,
				itemName: itemName,
				monthName: monthName,
				value: 0,
				percentageOfTotal: 0
			};

			this.itemDataMap[key] = itemData;
		}

		return itemData;
	}
}
