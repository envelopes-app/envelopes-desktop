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

	public getAllMasterCategories():Array<IMasterCategory> {

		var masterCategories:Array<IMasterCategory> = [];		

		_.forEach(this, (masterCategory)=>{
			if(!masterCategory.internalName)
				masterCategories.push(masterCategory);
		});

		masterCategories = _.sortBy(masterCategories, 'sortableIndex');
		return masterCategories;
	}

	public getVisibleNonTombstonedMasterCategories():Array<IMasterCategory> {

		var masterCategories:Array<IMasterCategory> = [];		

		_.forEach(this, (masterCategory)=>{
			if(!masterCategory.internalName && masterCategory.isTombstone == 0 && masterCategory.isHidden == 0)
				masterCategories.push(masterCategory);
		});

		masterCategories = _.sortBy(masterCategories, 'sortableIndex');
		return masterCategories;
	}

	public getMasterCategoryByName(masterCategoryName:string):IMasterCategory {
		return _.find(this, {name: masterCategoryName});
	}

	public getSortableIndexForNewMasterCategoryInsertion():number {

		var sortableIndex = 0;
		_.forEach(this, (masterCategory)=>{
			if(masterCategory.sortableIndex > sortableIndex)
				sortableIndex = masterCategory.sortableIndex;
		});

		// Increment the sortableIndex by 10000
		sortableIndex += 10000;
		return sortableIndex;
	}

	public getMasterCategoryAbove(masterCategoryId:string):IMasterCategory {

		var referenceMasterCategory = this.getEntityById(masterCategoryId);
		var referenceSortableIndex = referenceMasterCategory.sortableIndex; 
		var masterCategoryAbove:IMasterCategory = null;

		// We want to find the master category with highest sortableIndex below the referenceMasterCategory
		_.forEach(this, (masterCategory)=>{
			if(!masterCategory.internalName && masterCategory.entityId != masterCategoryId && masterCategory.sortableIndex < referenceSortableIndex) {

				if(!masterCategoryAbove || masterCategoryAbove.sortableIndex < masterCategory.sortableIndex)
					masterCategoryAbove = masterCategory;
			}
		});

		return masterCategoryAbove;		
	}

	public getMasterCategoryBelow(masterCategoryId:string):IMasterCategory {

		var referenceMasterCategory = this.getEntityById(masterCategoryId);
		var referenceSortableIndex = referenceMasterCategory.sortableIndex; 
		var masterCategoryBelow:IMasterCategory = null;

		// We want to find the master category with lowest sortableIndex above the referenceMasterCategory
		_.forEach(this, (masterCategory)=>{
			if(!masterCategory.internalName && masterCategory.entityId != masterCategoryId && masterCategory.sortableIndex > referenceSortableIndex) {

				if(!masterCategoryBelow || masterCategoryBelow.sortableIndex > masterCategory.sortableIndex)
					masterCategoryBelow = masterCategory;
			}
		});

		return masterCategoryBelow;		
	}
}