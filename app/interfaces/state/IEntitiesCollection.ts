import * as catalogEntities from '../catalogEntities';
import * as budgetEntities from '../budgetEntities';

export interface IEntitiesCollection {

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
}