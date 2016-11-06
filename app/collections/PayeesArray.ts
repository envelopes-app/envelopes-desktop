/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { IPayee } from '../interfaces/budgetEntities';
import { InternalPayees } from '../constants';

export class PayeesArray extends EntitiesArray<IPayee> {

	private startingBalancePayee:IPayee;
	private manualBalanceAdjustmentPayee:IPayee;
	private reconciliationBalanceAdjustmentPayee:IPayee;

	constructor(initialValues:Array<IPayee>) {
		super(initialValues);

		// Iterate through the passed array, and save references to the internal payees
		_.forEach(initialValues, (payee:IPayee)=>{

			if(payee.internalName == InternalPayees.StartingBalance)
				this.startingBalancePayee = payee;
			else if(payee.internalName == InternalPayees.ManualBalanceAdjustment)
				this.manualBalanceAdjustmentPayee = payee;
			else if(payee.internalName == InternalPayees.ReconciliationBalanceAdjustment)
				this.reconciliationBalanceAdjustmentPayee = payee;
		});
	}

	public getPayeeByName(payeeName:string):IPayee {
		return _.find(this.internalArray, {name: payeeName});
	}

	public getStartingBalancePayee():IPayee {
		return this.startingBalancePayee;
	}

	public getManualBalanceAdjustmentPayee():IPayee {
		return this.manualBalanceAdjustmentPayee;
	}

	public getReconciliationBalanceAdjustmentPayee():IPayee {
		return this.reconciliationBalanceAdjustmentPayee;
	}
}