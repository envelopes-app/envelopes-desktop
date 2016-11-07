import { IBudgetEntity } from '../common/IBudgetEntity';

export interface IMonthlySubCategoryBudget extends IBudgetEntity {

	monthlyBudgetId:string;
	subCategoryId:string;
	budgeted:number;
	note:string;
	month:string;

	cashOutflows:number;
	positiveCashOutflows:number;
	creditOutflows:number;
	balance:number;
	budgetedCashOutflows:number;
	budgetedCreditOutflows:number;
	unBudgetedCashOutflows:number;
	unBudgetedCreditOutflows:number;
	budgetedPreviousMonth:number;
	spentPreviousMonth:number;
	paymentPreviousMonth:number;
	balancePreviousMonth:number;
	budgetedAverage:number;
	spentAverage:number;
	paymentAverage:number;
	budgetedSpending:number;
	allSpending:number;
	allSpendingSinceLastPayment:number;
	upcomingTransactions:number;
	upcomingTransactionsCount:number;
	additionalToBeBudgeted:number;

	// Goals
	goalTarget:number;
	goalOverallFunded:number;
	goalOverallLeft:number;
	goalUnderFunded:number;
	goalExpectedCompletion:number;

	deviceKnowledgeForCalculatedFields:number;
}