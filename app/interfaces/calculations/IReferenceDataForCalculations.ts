import * as _ from 'lodash';
import { SimpleObjectMap, DateWithoutTime } from '../../utilities';
import * as budgetEntities from '../budgetEntities';

export interface IReferenceDataForCalculations {

	// collections hydrated by queries
	accounts?: Array<budgetEntities.IAccount>;
	masterCategories?: Array<budgetEntities.IMasterCategory>;
	subCategories?: Array<budgetEntities.ISubCategory>;
	paymentCategories?: Array<budgetEntities.ISubCategory>;
	
	// other reference data properties
	firstMonth:DateWithoutTime;
	lastMonth:DateWithoutTime;
	
	accountsMap?: SimpleObjectMap<budgetEntities.IAccount>;
	masterCategoriesMap?: SimpleObjectMap<budgetEntities.IMasterCategory>;
	subCategoriesMap?: SimpleObjectMap<budgetEntities.ISubCategory>;
	paymentCategoriesMap?: SimpleObjectMap<budgetEntities.ISubCategory>;
	
	accountBalanacesByAccountId:_.Dictionary<number>;
	
	splitSubCategoryId:string;
	uncategorizedSubCategoryId:string;
	immediateIncomeSubCategoryId:string;
	deferredIncomeSubCategoryId:string;
	startingBalancePayeeId:string;
	
	queuedTransactionCalculationsStartMonth:DateWithoutTime;
	queuedTransactionCalculationAccountIds:string[];
	queuedAccountCalculationsStartMonth:DateWithoutTime;
	queuedAccountCalculationAccountIds:string[];
	queuedSubCategoryCalculationsStartMonth:DateWithoutTime;
	queuedSubCategoryCalculationIds:string[];
	queuedScheduledTransactionCalculationIds:string[];
	runFullCalculations:boolean;
	runCalcsThroughMonth:DateWithoutTime;
}