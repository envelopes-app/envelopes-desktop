import * as budgetEntities from '../budgetEntities';

export interface IMonthlyCalculationsData {

	monthlyBudgets:Array<budgetEntities.IMonthlyBudget>;
	monthlySubCategoryBudgetsAggregated:Array<budgetEntities.IMonthlyBudget>;
}