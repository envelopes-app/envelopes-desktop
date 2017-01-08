/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { IAccountMonthlyCalculation } from '../interfaces/budgetEntities';
import { DateWithoutTime, MultiDictionary } from '../utilities';

export class AccountMonthlyCalculationsArray extends EntitiesArray<IAccountMonthlyCalculation> {

	private accountCalcsByMonthDictionary = new MultiDictionary<string, IAccountMonthlyCalculation>();

	constructor(initialValues:Array<IAccountMonthlyCalculation>) {
		super(initialValues);

		// Iterate through the passed array, and save references to the entities by month
		_.forEach(initialValues, (accountMonthlyCalc:IAccountMonthlyCalculation)=>{
			this.accountCalcsByMonthDictionary.setValue(accountMonthlyCalc.month, accountMonthlyCalc);
		});
	}

	public getAccountMonthlyCalculationsByMonth(month:DateWithoutTime):Array<IAccountMonthlyCalculation> {
		return this.accountCalcsByMonthDictionary.getValue(month.toISOString());
	}

	protected addEntity(accountMonthlyCalculation:IAccountMonthlyCalculation):void {

		if(!this.accountCalcsByMonthDictionary)
			this.accountCalcsByMonthDictionary = new MultiDictionary<string, IAccountMonthlyCalculation>();

		super.addEntity(accountMonthlyCalculation);
		this.accountCalcsByMonthDictionary.setValue(accountMonthlyCalculation.month, accountMonthlyCalculation);
	}

	public removeEntityById(entityId:string):IAccountMonthlyCalculation {
		var removedAccountMonthlyCalculation = super.removeEntityById(entityId);
		if(removedAccountMonthlyCalculation) {

			this.accountCalcsByMonthDictionary.remove(removedAccountMonthlyCalculation.month, removedAccountMonthlyCalculation);
		}
		
		return removedAccountMonthlyCalculation; 
	}
}
