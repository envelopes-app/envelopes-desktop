/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import { EntitiesArray } from './EntitiesArray'; 
import { ISubCategory } from '../interfaces/budgetEntities';
import { InternalCategories } from '../constants';

export class SubCategoriesArray extends EntitiesArray<ISubCategory> {

	private immediateIncomeSubCategory:ISubCategory;
	private splitSubCategory:ISubCategory;
	private uncategorizedSubCategory:ISubCategory;
	private hiddenSubCategories:Array<ISubCategory> = [];

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

			if(subCategory.isHidden == 1)
				this.hiddenSubCategories.push(subCategory);
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

	public getHiddenSubCategories():Array<ISubCategory> {
		return this.hiddenSubCategories;
	}

	public getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategoryId:string):Array<ISubCategory> {

		var subCategories:Array<ISubCategory> = [];		

		_.forEach(this, (subCategory)=>{
			if(subCategory.masterCategoryId == masterCategoryId && subCategory.isTombstone == 0 && subCategory.isHidden == 0)
				subCategories.push(subCategory);
		});

		return subCategories;
	}

	public getSubCategoryByName(subCategoryName:string):ISubCategory {
		return _.find(this, {name: subCategoryName});
	}

	public getDebtSubCategoryForAccount(accountId:string):ISubCategory {
		return _.find(this, {accountId: accountId});
	}

	protected addEntity(subCategory:ISubCategory):void {

		if(!this.hiddenSubCategories)
			this.hiddenSubCategories = [];

		super.addEntity(subCategory);
		if(subCategory.isHidden == 1)
			this.hiddenSubCategories.push(subCategory);
	}

	protected removeEntityById(entityId:string):ISubCategory {
		var removedSubCategory = super.removeEntityById(entityId);
		if(removedSubCategory && removedSubCategory.isHidden == 1) {

			var index = _.findIndex(this.hiddenSubCategories, {entityId: entityId});
			this.hiddenSubCategories.splice(index, 1);
		}
		
		return removedSubCategory; 
	}
}