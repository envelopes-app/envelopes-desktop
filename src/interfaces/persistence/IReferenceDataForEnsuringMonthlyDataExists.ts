import * as budgetEntities from '../budgetEntities'; 
import { SimpleObjectMap } from '../../utilities';

export interface IReferenceDataForEnsuringMonthlyDataExists {

	// Collections for Entities
	masterCategories?: Array<budgetEntities.IMasterCategory>;
	subCategories?: Array<budgetEntities.ISubCategory>;
	monthlyBudgets?: Array<budgetEntities.IMonthlyBudget>;
	monthlySubCategoryBudgets?: Array<budgetEntities.IMonthlySubCategoryBudget>;

	// Maps for above entities
	masterCategoriesMap?: SimpleObjectMap<budgetEntities.IMasterCategory>;
	subCategoriesMap?: SimpleObjectMap<budgetEntities.ISubCategory>;
	monthlyBudgetsMap?: SimpleObjectMap<budgetEntities.IMonthlyBudget>;
	monthlySubCategoryBudgetsMap?: SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget>;
}