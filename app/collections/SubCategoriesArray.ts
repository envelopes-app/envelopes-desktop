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

	public getAllSubCategoriesForMasterCategory(masterCategoryId:string):Array<ISubCategory> {

		var subCategories:Array<ISubCategory> = [];		

		_.forEach(this.internalArray, (subCategory)=>{
			if(subCategory.masterCategoryId == masterCategoryId)
				subCategories.push(subCategory);
		});

		subCategories = _.sortBy(subCategories, 'sortableIndex');
		return subCategories;
	}

	public getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategoryId:string):Array<ISubCategory> {

		var subCategories:Array<ISubCategory> = [];		

		_.forEach(this.internalArray, (subCategory)=>{
			if(subCategory.masterCategoryId == masterCategoryId && subCategory.isTombstone == 0 && subCategory.isHidden == 0)
				subCategories.push(subCategory);
		});

		subCategories = _.sortBy(subCategories, 'sortableIndex');
		return subCategories;
	}

	public getSubCategoryByName(subCategoryName:string):ISubCategory {
		return _.find(this.internalArray, {name: subCategoryName});
	}

	public getDebtSubCategoryForAccount(accountId:string):ISubCategory {
		return _.find(this.internalArray, {accountId: accountId});
	}

	public getSortableIndexForNewSubCategoryInsertionAtBottom(masterCategoryId:string):number {

		var sortableIndex = 0;
		_.forEach(this.internalArray, (subCategory)=>{
			if(subCategory.masterCategoryId == masterCategoryId) {

				if(subCategory.sortableIndex > sortableIndex)
					sortableIndex = subCategory.sortableIndex;
			}
		});

		// Increment the sortableIndex by 10000
		sortableIndex += 10000;
		return sortableIndex;
	}

	public getSortableIndexForNewSubCategoryInsertionAtTop(masterCategoryId:string):number {

		var sortableIndex = 0;
		_.forEach(this.internalArray, (subCategory)=>{
			if(subCategory.masterCategoryId == masterCategoryId) {

				if(subCategory.sortableIndex < sortableIndex)
					sortableIndex = subCategory.sortableIndex;
			}
		});

		// Decrement the sortableIndex by 10000
		sortableIndex -= 10000;
		return sortableIndex;
	}

	public getSubCategoryAbove(masterCategoryId:string, subCategoryId:string):ISubCategory {

		var referenceSubCategory = this.getEntityById(subCategoryId);
		var referenceSortableIndex = referenceSubCategory.sortableIndex; 
		var subCategoryAbove:ISubCategory = null;

		// We want to find the subcategory with highest sortableIndex below the referenceSubCategory
		_.forEach(this.internalArray, (subCategory)=>{
			if(subCategory.masterCategoryId == masterCategoryId && subCategory.entityId != subCategoryId && subCategory.sortableIndex < referenceSortableIndex) {

				if(!subCategoryAbove || subCategoryAbove.sortableIndex < subCategory.sortableIndex)
					subCategoryAbove = subCategory;
			}
		});

		return subCategoryAbove;		
	}

	public getSubCategoryBelow(masterCategoryId:string, subCategoryId:string):ISubCategory {

		var referenceSubCategory = this.getEntityById(subCategoryId);
		var referenceSortableIndex = referenceSubCategory.sortableIndex; 
		var subCategoryBelow:ISubCategory = null;

		// We want to find the subCategory with lowest sortableIndex above the referenceSubCategory
		_.forEach(this.internalArray, (subCategory)=>{
			if(subCategory.masterCategoryId == masterCategoryId && subCategory.entityId != subCategoryId && subCategory.sortableIndex > referenceSortableIndex) {

				if(!subCategoryBelow || subCategoryBelow.sortableIndex > subCategory.sortableIndex)
					subCategoryBelow = subCategory;
			}
		});

		return subCategoryBelow;		
	}

	// ***********************************************************************************************
	// Base class method overrides 
	// ***********************************************************************************************
	protected addEntity(subCategory:ISubCategory):void {

		if(!this.hiddenSubCategories)
			this.hiddenSubCategories = [];

		super.addEntity(subCategory);
		if(subCategory.isHidden == 1)
			this.hiddenSubCategories.push(subCategory);
	}

	public removeEntityById(entityId:string):ISubCategory {
		var removedSubCategory = super.removeEntityById(entityId);
		if(removedSubCategory && removedSubCategory.isHidden == 1) {

			var index = _.findIndex(this.hiddenSubCategories, {entityId: entityId});
			this.hiddenSubCategories.splice(index, 1);
		}
		
		return removedSubCategory; 
	}
}