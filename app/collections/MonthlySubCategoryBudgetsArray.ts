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

	public getMonthlySubCategoryBudgetsForSubCategoryInMonth(subCategoryId:string, month:string):IMonthlySubCategoryBudget {
		
		// Get all the monthlySubCategoryBudget entities for the month
		var monthlySubCategoryBudgets = this.getMonthlySubCategoryBudgetsByMonth(month);
		// Find the one corresponding to the passed subCategoryId
		return _.find(monthlySubCategoryBudgets, {subCategoryId:subCategoryId});
	}

	protected addEntity(monthlySubCategoryBudget:IMonthlySubCategoryBudget):void {

		if(!this.multiDictionary)
			this.multiDictionary = new MultiDictionary<string, IMonthlySubCategoryBudget>();

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
