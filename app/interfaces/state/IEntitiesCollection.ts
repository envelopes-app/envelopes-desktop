import * as collections from '../../collections';
import * as catalogEntities from '../catalogEntities';

export interface IEntitiesCollection {

	// The budget entity to which the below entitied belong
	budget?:catalogEntities.IBudget;
	
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