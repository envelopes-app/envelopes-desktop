import * as catalogEntities from '../catalogEntities';
import * as budgetEntities from '../budgetEntities';
import { SimpleObjectMap } from '../../utilities'; 

export interface ApplicationState {

	// Arrays to save all entities by their types
	accounts?:Array<budgetEntities.IAccount>;
	accountMappings?:Array<budgetEntities.IAccountMapping>;
	masterCategories?:Array<budgetEntities.IMasterCategory>;
	monthlyBudgets?:Array<budgetEntities.IMonthlyBudget>;
	monthlySubCategoryBudgets?:Array<budgetEntities.IMonthlySubCategoryBudget>;
	payees?:Array<budgetEntities.IPayee>;
	payeeLocations?:Array<budgetEntities.IPayeeLocation>;
	payeeRenameConditions?:Array<budgetEntities.IPayeeRenameCondition>;
	scheduledSubTransactions?:Array<budgetEntities.IScheduledSubTransaction>;
	scheduledTransactions?:Array<budgetEntities.IScheduledTransaction>;
	settings?:Array<budgetEntities.ISetting>;
	subCategories?:Array<budgetEntities.ISubCategory>;
	subTransactions?:Array<budgetEntities.ISubTransaction>;
	transactions?:Array<budgetEntities.ITransaction>;
	
	// Maps to index the entities saved in the above Arrays
	accountsMap?:SimpleObjectMap<budgetEntities.IAccount>;
	accountMappingsMap?:SimpleObjectMap<budgetEntities.IAccountMapping>;
	masterCategoriesMap?:SimpleObjectMap<budgetEntities.IMasterCategory>;
	monthlyBudgetsMap?:SimpleObjectMap<budgetEntities.IMonthlyBudget>;
	monthlySubCategoryBudgetsMap?:SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget>;
	payeesMap?:SimpleObjectMap<budgetEntities.IPayee>;
	payeeLocationsMap?:SimpleObjectMap<budgetEntities.IPayeeLocation>;
	payeeRenameConditionsMap?:SimpleObjectMap<budgetEntities.IPayeeRenameCondition>;
	scheduledSubTransactionsMap?:SimpleObjectMap<budgetEntities.IScheduledSubTransaction>;
	scheduledTransactionsMap?:SimpleObjectMap<budgetEntities.IScheduledTransaction>;
	settingsMap?:SimpleObjectMap<budgetEntities.ISetting>;
	subCategoriesMap?:SimpleObjectMap<budgetEntities.ISubCategory>;
	subTransactionsMap?:SimpleObjectMap<budgetEntities.ISubTransaction>;
	transactionsMap?:SimpleObjectMap<budgetEntities.ITransaction>;
	
	// ****************************************************************************************************
	// UI-Related State
	// ****************************************************************************************************
	sidebar_selectedTab:string; // Budget or Accounts
	sidebar_selectedAccountId:string; // 'allAccount' or a specific account's id 
}