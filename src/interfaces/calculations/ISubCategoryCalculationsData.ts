
import * as budgetEntities from '../../interfaces/budgetEntities';

export interface ISubCategoryCalculationsData {

	monthlySubCategoryBudgets:Array<budgetEntities.IMonthlySubCategoryBudget>;
	subCategoryOnBudgetLiabilityAccounts:Array<budgetEntities.IAccount>;
}
