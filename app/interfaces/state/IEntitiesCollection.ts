import * as collections from '../../collections';
import * as budgetEntities from '../budgetEntities';
import * as catalogEntities from '../catalogEntities';

export interface IEntitiesCollection {

	// The budget entity to which the below entitied belong
	budgets?:Array<catalogEntities.IBudget>;
	globalSettings?:Array<catalogEntities.IGlobalSetting>;
	
	// Arrays to save all budget entities by their types
	accounts?:collections.AccountsArray;
	accountMappings?:collections.AccountMappingsArray;
	masterCategories?:collections.MasterCategoriesArray;
	monthlyBudgets?:collections.MonthlyBudgetsArray;
	monthlySubCategoryBudgets?:collections.MonthlySubCategoryBudgetsArray;
	payees?:collections.PayeesArray;
	payeeLocations?:collections.PayeeLocationsArray;
	payeeRenameConditions?:collections.PayeeRenameConditionsArray;
	scheduledSubTransactions?:collections.ScheduledSubTransactionsArray;
	scheduledTransactions?:collections.ScheduledTransactionsArray;
	settings?:collections.SettingsArray;
	subCategories?:collections.SubCategoriesArray;
	subTransactions?:collections.SubTransactionsArray;
	transactions?:collections.TransactionsArray;
}

export interface ISimpleEntitiesCollection {

	budgets?:Array<catalogEntities.IBudget>;
	globalSettings?:Array<catalogEntities.IGlobalSetting>;

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
}