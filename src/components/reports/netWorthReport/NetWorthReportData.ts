/// <reference path='../../../_includes.ts' />

import * as _ from 'lodash';

import { DateWithoutTime, SimpleObjectMap } from '../../../utilities';
import { INetWorthReportItemData } from '../../../interfaces/reports';

export class NetWorthReportData {

	private startMonth:DateWithoutTime;
	private endMonth:DateWithoutTime;
	private itemDataMap:SimpleObjectMap<INetWorthReportItemData> = {};

	private allMonthNames:Array<string>;
	private changeInNetWorth:number;
	private percentageChangeInNetWorth:number;
	private itemDataArray:Array<INetWorthReportItemData>;

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

		// Find out the min and max month for which we have data
		var minMonth, maxMonth:DateWithoutTime;
		var allMonths = _.keys(this.itemDataMap);
		_.forEach(allMonths, (monthString)=>{
			var month = DateWithoutTime.createFromISOString(monthString);
			if(!minMonth || month.isBefore(minMonth))
				minMonth = month;
			if(!maxMonth || month.isAfter(maxMonth))
				maxMonth = month;
		});

		// Starting from the minMonth and ending at maxMonth, update the asset and debt values
		var prevMonthItem, currentMonthItem:INetWorthReportItemData;
		var currentMonth = minMonth.clone();
		while(currentMonth.isAfter(maxMonth) == false) {
			// Get the itemData for the current month of the loop
			currentMonthItem = this.itemDataMap[currentMonth.toISOString()];
			// If we have a previous month item, then add it's values to the current month item
			if(prevMonthItem) {
				currentMonthItem.debtValue += prevMonthItem.debtValue;
				currentMonthItem.assetValue += prevMonthItem.assetValue;
			}

			// Set the currentMonthItem to be the prevMonthItem for next iteration
			prevMonthItem = currentMonthItem;
			// Increment the current month for the next iteration
			currentMonth.addMonths(1);
		}

		// **************************************************************************************
		// Iterate through the items and calculate the remaining values in them
		var month = this.startMonth.clone();
		this.allMonthNames = [];
		this.itemDataArray = [];

		while(month.isAfter(this.endMonth) == false) {
			this.allMonthNames.push(month.format("MM/YYYY"));
			this.itemDataArray.push(this.getMonthlyItemData(month.toISOString()));
			month.addMonths(1);
		} 

		var firstItemData = this.itemDataArray[0];
		firstItemData.netWorth = firstItemData.assetValue - firstItemData.debtValue;
		firstItemData.netWorthDecreasing = false;
		firstItemData.netWorthIncreasing = false;

		for(var i:number = 1; i < this.itemDataArray.length; i++) {

			var itemData = this.itemDataArray[i];
			var prevItemData = this.itemDataArray[i-1];
			itemData.netWorth = itemData.assetValue - itemData.debtValue;
			itemData.netWorthIncreasing = itemData.netWorth > prevItemData.netWorth;
			itemData.netWorthDecreasing = itemData.netWorth < prevItemData.netWorth;
		}

		var lastItemData = this.itemDataArray[this.itemDataArray.length - 1];
		this.changeInNetWorth = lastItemData.netWorth - firstItemData.netWorth;
		this.percentageChangeInNetWorth = (this.changeInNetWorth / firstItemData.netWorth) * 100; 
		// Round this percentage value to two decimal values
		this.percentageChangeInNetWorth = Math.round(this.percentageChangeInNetWorth*100)/100;
	}

	public getItemDataArray():Array<INetWorthReportItemData> {
		return this.itemDataArray;
	}

	public getAllMonthNames():Array<string> {
		return this.allMonthNames;
	}

	public getChangeInNetWorth():number {
		return this.changeInNetWorth;
	}

	public getPercentageChangeInNetWorth():number {
		return this.percentageChangeInNetWorth;		
	}

	public getAssetValues():Array<number> {
		return _.map(this.itemDataArray, "assetValue") as Array<number>;
	}	

	public getDebtValues():Array<number> {
		return _.map(this.itemDataArray, "debtValue") as Array<number>;
	}	

	public getNetWorthValues():Array<number> {
		return _.map(this.itemDataArray, "netWorth") as Array<number>;
	}	
}