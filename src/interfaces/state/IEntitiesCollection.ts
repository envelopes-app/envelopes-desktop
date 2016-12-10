import * as collections from '../../collections';
import * as budgetEntities from '../budgetEntities';
import * as catalogEntities from '../catalogEntities';

export interface IEntitiesCollection {

	// The budget entity to which the below entitied belong
	budgets?:collections.BudgetsArray;
	globalSettings?:collections.GlobalSettingsArray;
	
	// Arrays to save all budget entities by their types
	accounts?:collections.AccountsArray;
	masterCategories?:collections.MasterCategoriesArray;
	monthlyBudgets?:collections.MonthlyBudgetsArray;
	monthlySubCategoryBudgets?:collections.MonthlySubCategoryBudgetsArray;
	payees?:collections.PayeesArray;
	payeeLocations?:collections.PayeeLocationsArray;
	payeeRenameConditions?:collections.PayeeRenameConditionsArray;
	scheduledTransactions?:collections.ScheduledTransactionsArray;
	settings?:collections.SettingsArray;
	subCategories?:collections.SubCategoriesArray;
	transactions?:collections.TransactionsArray;
}

export interface ISimpleEntitiesCollection {

	budgets?:Array<catalogEntities.IBudget>;
	globalSettings?:Array<catalogEntities.IGlobalSetting>;

	accounts?:Array<budgetEntities.IAccount>;
	masterCategories?:Array<budgetEntities.IMasterCategory>;
	monthlyBudgets?:Array<budgetEntities.IMonthlyBudget>;
	monthlySubCategoryBudgets?:Array<budgetEntities.IMonthlySubCategoryBudget>;
	payees?:Array<budgetEntities.IPayee>;
	payeeLocations?:Array<budgetEntities.IPayeeLocation>;
	payeeRenameConditions?:Array<budgetEntities.IPayeeRenameCondition>;
	scheduledTransactions?:Array<budgetEntities.IScheduledTransaction>;
	settings?:Array<budgetEntities.ISetting>;
	subCategories?:Array<budgetEntities.ISubCategory>;
	transactions?:Array<budgetEntities.ITransaction>;
}