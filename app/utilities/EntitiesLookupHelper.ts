/// <reference path='../_includes.ts' />

import * as _ from 'lodash';
import * as budgetEntities from '../interfaces/budgetEntities';
import { InternalCategories, InternalPayees } from '../constants';
import { IEntitiesCollectionWithMaps } from '../interfaces/state';

export class EntitiesLookupHelper {

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