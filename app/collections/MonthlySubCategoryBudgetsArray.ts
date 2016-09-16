/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { IMonthlySubCategoryBudget } from '../interfaces/budgetEntities';
import { MultiDictionary } from '../utilities';

export class MonthlySubCategoryBudgetsArray extends EntitiesArray<IMonthlySubCategoryBudget> {

	private multiDictionary = new MultiDictionary<string, IMonthlySubCategoryBudget>();

	constructor(initialValues:Array<IMonthlySubCategoryBudget>) {
		super(initialValues);

		// Iterate through the passed array, and save references to the monthly subcategory budgets by month
		_.forEach(initialValues, (monthlySubCategoryBudget:IMonthlySubCategoryBudget)=>{
			this.multiDictionary.setValue(monthlySubCategoryBudget.month, monthlySubCategoryBudget);
		});
	}

	public getMonthlySubCategoryBudgetsByMonth(month:string):Array<IMonthlySubCategoryBudget> {
		return this.multiDictionary.getValue(month);
	}

	protected addEntity(monthlySubCategoryBudget:IMonthlySubCategoryBudget):void {
		super.addEntity(monthlySubCategoryBudget);
		this.multiDictionary.setValue(monthlySubCategoryBudget.month, monthlySubCategoryBudget);
	}

	protected removeEntityById(entityId:string):IMonthlySubCategoryBudget {
		var removedMonthlyBudget = super.removeEntityById(entityId);
		if(removedMonthlyBudget)
			this.multiDictionary.remove(removedMonthlyBudget.month, removedMonthlyBudget);
		
		return removedMonthlyBudget; 
	}
}
