/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { IMonthlyBudget } from '../interfaces/budgetEntities';
import { DateWithoutTime, SimpleObjectMap } from '../utilities';

export class MonthlyBudgetsArray extends EntitiesArray<IMonthlyBudget> {

	private minMonth:DateWithoutTime;
	private maxMonth:DateWithoutTime;
	private monthlyMap:SimpleObjectMap<IMonthlyBudget> = {};

	constructor(initialValues:Array<IMonthlyBudget>) {
		super(initialValues);

		// Iterate through the passed array, and save references to the monthly budgets by month
		_.forEach(initialValues, (monthlyBudget:IMonthlyBudget)=>{
			this.monthlyMap[monthlyBudget.month] = monthlyBudget;
		});
	}

	public getMinMonth():DateWithoutTime {
		return this.minMonth.clone();
	}

	public getMaxMonth():DateWithoutTime {
		return this.maxMonth.clone();
	}

	public getMonthlyBudgetByMonth(month:string):IMonthlyBudget {
		return this.monthlyMap[month];
	}

	protected addEntity(monthlyBudget:IMonthlyBudget):void {

		if(!this.monthlyMap)
			this.monthlyMap = {};

		super.addEntity(monthlyBudget);
		this.monthlyMap[monthlyBudget.month] = monthlyBudget;

		var month = DateWithoutTime.createFromISOString(monthlyBudget.month);
		if(!this.minMonth || this.minMonth.isAfter(month))
			this.minMonth = month;
		if(!this.maxMonth || this.maxMonth.isBefore(month))
			this.maxMonth = month;
	}

	public removeEntityById(entityId:string):IMonthlyBudget {
		var removedMonthlyBudget = super.removeEntityById(entityId);
		if(removedMonthlyBudget)
			this.monthlyMap[removedMonthlyBudget.month] = null;
		
		return removedMonthlyBudget; 
	}
}
