/// <reference path='../../../_includes.ts' />

import * as _ from 'lodash';

import { DateWithoutTime, SimpleObjectMap } from '../../../utilities';
import { INetWorthReportItemData } from '../../../interfaces/reports';

export class NetWorthReportData {

	private startMonth:DateWithoutTime;
	private endMonth:DateWithoutTime;
	private itemDataMap:SimpleObjectMap<INetWorthReportItemData> = {};

	public changeInNetWorth:number;
	public percentageChangeInNetWorth:number;

	constructor(startMonth:DateWithoutTime, endMonth:DateWithoutTime) {
		this.startMonth = startMonth;
		this.endMonth = endMonth;
	}

	public getMonthlyItemData(monthName:string):INetWorthReportItemData {

		// First check if we already have an existing item against this month
		var itemData = this.itemDataMap[monthName];
		// If it is not found, then create and return a new one
		if(!itemData) {
			
			itemData = {
				monthName: monthName,
				assetValue: 0,
				debtValue: 0,
				netWorth: 0,
				netWorthIncreasing: false,
				netWorthDecreasing: false
			};

			this.itemDataMap[monthName] = itemData;
		}

		return itemData;
	}

	public prepareDataForPresentation():void {

		// Iterate through the items and calculate the remaining values in them
		var month = this.startMonth.clone();
		var monthNames:Array<string> = [];
		while(month.isAfter(this.endMonth) == false) {
			monthNames.push(month.toISOString());
			month.addMonths(1);
		} 

		var firstItemData = this.itemDataMap[ monthNames[0] ];
		firstItemData.netWorth = firstItemData.assetValue - firstItemData.debtValue;
		firstItemData.netWorthDecreasing = false;
		firstItemData.netWorthIncreasing = false;

		for(var i:number = 1; i < monthNames.length; i++) {

			var itemData = this.itemDataMap[ monthNames[i] ];
			var prevItemData = this.itemDataMap[ monthNames[i-1] ];
			itemData.netWorth = itemData.assetValue - itemData.debtValue;
			itemData.netWorthIncreasing = itemData.netWorth > prevItemData.netWorth;
			itemData.netWorthDecreasing = itemData.netWorth < prevItemData.netWorth;
		}

		var lastItemData = this.itemDataMap[ monthNames[monthNames.length - 1] ];
		this.changeInNetWorth = lastItemData.netWorth - firstItemData.netWorth;
		this.percentageChangeInNetWorth = (this.changeInNetWorth / firstItemData.netWorth) * 100; 
		// Round this percentage value to two decimal values
		this.percentageChangeInNetWorth = Math.round(this.percentageChangeInNetWorth*100)/100;
	}

	public getItemDataArray():Array<INetWorthReportItemData> {

		// Create an array from itemData objects in the overallItemDataMap 
		var keys = _.keys(this.itemDataMap);
		var itemDataArray:Array<INetWorthReportItemData> = _.map(keys, (key)=>{
			return this.itemDataMap[key];
		});

		return itemDataArray;
	}
 }