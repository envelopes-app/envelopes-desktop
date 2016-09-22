/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { IMasterCategory } from '../interfaces/budgetEntities';
import { InternalCategories } from '../constants';

export class MasterCategoriesArray extends EntitiesArray<IMasterCategory> {

	private internalMasterCategory:IMasterCategory;
	private debtPaymentMasterCategory:IMasterCategory;
	private hiddenMasterCategory:IMasterCategory;

	constructor(initialValues:Array<IMasterCategory>) {
		super(initialValues);

		// Iterate through the passed array, and save references to the internal master categories
		_.forEach(initialValues, (masterCategory:IMasterCategory)=>{

			if(masterCategory.internalName == InternalCategories.InternalMasterCategory)
				this.internalMasterCategory = masterCategory;
			else if(masterCategory.internalName == InternalCategories.DebtPaymentMasterCategory)
				this.debtPaymentMasterCategory = masterCategory;
			else if(masterCategory.internalName == InternalCategories.HiddenMasterCategory)
				this.hiddenMasterCategory = masterCategory;
		});
	}

	public getInternalMasterCategory():IMasterCategory {
		return this.internalMasterCategory;
	}

	public getDebtPaymentMasterCategory():IMasterCategory {
		return this.debtPaymentMasterCategory;
	}

	public getHiddenMasterCategory():IMasterCategory {
		return this.hiddenMasterCategory;
	}

	public getVisibleNonTombstonedMasterCategories():Array<IMasterCategory> {

		var masterCategories:Array<IMasterCategory> = [];		

		_.forEach(this, (masterCategory)=>{
			if(masterCategory.isTombstone == 0 && masterCategory.isHidden == 0)
				masterCategories.push(masterCategory);
		});

		return masterCategories;
	}
}