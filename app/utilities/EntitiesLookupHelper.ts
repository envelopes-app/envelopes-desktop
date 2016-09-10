/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import * as budgetEntities from '../interfaces/budgetEntities';
import { InternalCategories, InternalPayees } from '../constants';
import { IEntitiesCollectionWithMaps } from '../interfaces/state';

export class EntitiesLookupHelper {

	// ***********************************************************************************************************
	// Account lookup methods
	// ***********************************************************************************************************
	public static getDefaultAccountForAddTransactionDialog(entitiesCollection:IEntitiesCollectionWithMaps):budgetEntities.IAccount {

		// First try to find a non-tombstoned on-budget account.
		var selectedAccount:budgetEntities.IAccount = null;
		_.forEach(entitiesCollection.accounts, (account)=>{
			if(account.isTombstone == 0 && account.onBudget == 1 && account.closed == 0) {

				selectedAccount = account;
				return false; 
			}
		});

		// If the above iteration does not gets us an account, then try to find a non-tombstoned tracking account		
		_.forEach(entitiesCollection.accounts, (account)=>{
			if(account.isTombstone == 0 && account.closed == 0) {

				selectedAccount = account;
				return false; 
			}
		});

		return selectedAccount;
	}

	// ***********************************************************************************************************
	// Master Category lookup methods
	// ***********************************************************************************************************
	public static getInternalMasterCategory(entitiesCollection:IEntitiesCollectionWithMaps):budgetEntities.IMasterCategory {
		return entitiesCollection.masterCategoriesMapByInternalName[InternalCategories.InternalMasterCategory];
	}

	public static getHiddenMasterCategory(entitiesCollection:IEntitiesCollectionWithMaps):budgetEntities.IMasterCategory {
		return entitiesCollection.masterCategoriesMapByInternalName[InternalCategories.HiddenMasterCategory];
	}

	public static getDebtPaymentMasterCategory(entitiesCollection:IEntitiesCollectionWithMaps):budgetEntities.IMasterCategory {
		return entitiesCollection.masterCategoriesMapByInternalName[InternalCategories.DebtPaymentMasterCategory];
	}

	// ***********************************************************************************************************
	// SubCategory lookup methods
	// ***********************************************************************************************************
	public static getImmediateIncomeSubCategory(entitiesCollection:IEntitiesCollectionWithMaps):budgetEntities.ISubCategory {
		return entitiesCollection.subCategoriesMapByInternalName[InternalCategories.ImmediateIncomeSubCategory];
	}

	public static getSplitSubCategory(entitiesCollection:IEntitiesCollectionWithMaps):budgetEntities.ISubCategory {
		return entitiesCollection.subCategoriesMapByInternalName[InternalCategories.SplitSubCategory];
	}

	public static getUncategorizedSubCategory(entitiesCollection:IEntitiesCollectionWithMaps):budgetEntities.ISubCategory {
		return entitiesCollection.subCategoriesMapByInternalName[InternalCategories.UncategorizedSubCategory];
	}

	// ***********************************************************************************************************
	// Payee lookup methods
	// ***********************************************************************************************************
	public static getStartingBalancePayee(entitiesCollection:IEntitiesCollectionWithMaps):budgetEntities.IPayee {
		return entitiesCollection.payeesMapByInternalName[InternalPayees.StartingBalance];
	}

	public static getManualBalanceAdjustmentPayee(entitiesCollection:IEntitiesCollectionWithMaps):budgetEntities.IPayee {
		return entitiesCollection.payeesMapByInternalName[InternalPayees.ManualBalanceAdjustment];
	}

	public static getReconciliationBalanceAdjustmentPayee(entitiesCollection:IEntitiesCollectionWithMaps):budgetEntities.IPayee {
		return entitiesCollection.payeesMapByInternalName[InternalPayees.ReconciliationBalanceAdjustment];
	}
}