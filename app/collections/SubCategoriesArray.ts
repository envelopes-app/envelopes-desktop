/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { ISubCategory } from '../interfaces/budgetEntities';
import { InternalCategories } from '../constants';

export class SubCategoriesArray extends EntitiesArray<ISubCategory> {

	private immediateIncomeSubCategory:ISubCategory;
	private splitSubCategory:ISubCategory;
	private uncategorizedSubCategory:ISubCategory;

	constructor(initialValues:Array<ISubCategory>) {
		super(initialValues);

		// Iterate through the passed array, and save references to the internal subcategories
		_.forEach(initialValues, (subCategory:ISubCategory)=>{

			if(subCategory.internalName == InternalCategories.ImmediateIncomeSubCategory)
				this.immediateIncomeSubCategory = subCategory;
			else if(subCategory.internalName == InternalCategories.SplitSubCategory)
				this.splitSubCategory = subCategory;
			else if(subCategory.internalName == InternalCategories.UncategorizedSubCategory)
				this.uncategorizedSubCategory = subCategory;
		});
	}

	public getImmediateIncomeSubCategory():ISubCategory {
		return this.immediateIncomeSubCategory;
	}

	public getSplitSubCategory():ISubCategory {
		return this.splitSubCategory;
	}

	public getUncategorizedSubCategory():ISubCategory {
		return this.uncategorizedSubCategory;
	}

	public getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategoryId:string):Array<ISubCategory> {

		var subCategories:Array<ISubCategory> = [];		

		_.forEach(this, (subCategory)=>{
			if(subCategory.masterCategoryId == masterCategoryId && subCategory.isTombstone == 0 && subCategory.isHidden == 0)
				subCategories.push(subCategory);
		});

		return subCategories;
	}
}