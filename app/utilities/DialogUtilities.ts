/// <reference path='../_includes.ts' />

import * as _ from 'lodash';

import { IEntitiesCollection } from '../interfaces/state';
import * as objects from '../interfaces/objects';
import * as budgetEntities from '../interfaces/budgetEntities';
import { DateWithoutTime, SimpleObjectMap } from '../utilities';

export class DialogUtilities {

	public static buildAccountsList(entitiesCollection:IEntitiesCollection):Array<objects.IAccountObject> {

		var accountsList:Array<objects.IAccountObject> = [];
		// Go through the account entities and build a list of open, non-tombstoned accounts
		_.forEach(entitiesCollection.accounts, (account)=>{

			if(account.isTombstone == 0 && account.closed == 0) {
				accountsList.push({
					entityId: account.entityId,
					name: account.accountName
				});
			}
		});

		return accountsList; 
	}

	public static buildPayeesList(entitiesCollection:IEntitiesCollection):Array<objects.IPayeeObject> {

		var payeesList:Array<objects.IPayeeObject> = [];
		// Go through the payee entities and build a list of non-tombstoned, non-internal payees
		_.forEach(entitiesCollection.payees, (payee)=>{

			if(payee.isTombstone == 0 && !payee.internalName) {
				payeesList.push({
					entityId: payee.entityId,
					name: payee.name,
					accountId: payee.accountId,
					isTransferPayee: payee.accountId ? true : false
				});
			}
		}); 

		return payeesList;
	}

	public static buildCategoriesList(entitiesCollection:IEntitiesCollection):Array<objects.ICategoryObject> {

		var categoriesList:Array<objects.ICategoryObject> = [];
		var masterCategories = entitiesCollection.masterCategories;
		var subCategories = entitiesCollection.subCategories;
		var monthlyBudgets = entitiesCollection.monthlyBudgets;
		var monthlySubCategoryBudgets = entitiesCollection.monthlySubCategoryBudgets;

		var internalMasterCategory = masterCategories.getInternalMasterCategory();
		var immediateIncomeSubCategory = subCategories.getImmediateIncomeSubCategory();
		// Get the MonthlyBudget and MonthlySubCategoryBudgets for the current month.
		var currentMonth = DateWithoutTime.createForCurrentMonth();
		var monthlyBudgetForCurrentMonth:budgetEntities.IMonthlyBudget = monthlyBudgets.getMonthlyBudgetByMonth(currentMonth.toISOString()); 
		var monthlySubCategoryBudgetsForCurrentMonth = monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsByMonth(currentMonth.toISOString()); 
		// Create a map of the montlySubCategoryBudgets by their subCategoryId
		var monthlySubCategoryBudgetsMap:SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget> = {};
		_.forEach(monthlySubCategoryBudgetsForCurrentMonth, (monthlySubCategoryBudget)=>{
			monthlySubCategoryBudgetsMap[monthlySubCategoryBudget.subCategoryId] = monthlySubCategoryBudget;
		});

		// At the top of the list, we want entries for "Inflow" and "To be Budgeted"
		categoriesList.push({
			entityId: internalMasterCategory.entityId,
			name: "Inflow",
			isMasterCategory: true,
			isInflow: false,
			masterCategoryId: null,
			availableAmount: 0
		});
		categoriesList.push({
			entityId: immediateIncomeSubCategory.entityId,
			name: "To be Budgeted",
			isMasterCategory: false,
			isInflow: true,
			masterCategoryId: internalMasterCategory.entityId,
			availableAmount: monthlyBudgetForCurrentMonth ? monthlyBudgetForCurrentMonth.availableToBudget : 0
		});

		// Go through the master categories and build a list of non-tombstoned, non-internal master categories
		_.forEach(masterCategories, (masterCategory)=>{

			if(masterCategory.isTombstone == 0 && masterCategory.isHidden == 0 && !masterCategory.internalName) {

				// Get all the subcategories for this master category 
				var filteredSubCategories = subCategories.getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategory.entityId);
				// If there are no subcategories for this master category, skip adding it to the list
				if(filteredSubCategories.length > 0) {

					categoriesList.push({
						entityId: masterCategory.entityId,
						name: masterCategory.name,
						isMasterCategory: true,
						isInflow: false,
						masterCategoryId: null,
						availableAmount: 0
					});

					// Add items for all the subCategories for this master category
					_.forEach(filteredSubCategories, (subCategory)=>{

						// Get the monthlySubCategoryBudget entity for this subCategory
						var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[subCategory.entityId];
						categoriesList.push({
							entityId: subCategory.entityId,
							name: subCategory.name,
							isMasterCategory: false,
							isInflow: false,
							masterCategoryId: masterCategory.entityId,
							availableAmount: monthlySubCategoryBudget ? monthlySubCategoryBudget.balance : 0
						});
					});
				}
			}
		});

		return categoriesList;
	}
}