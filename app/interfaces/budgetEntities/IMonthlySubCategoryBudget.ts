import { IBudgetEntity } from '../common/IBudgetEntity';

export interface IMonthlySubCategoryBudget extends IBudgetEntity {

	monthlyBudgetId:string;
	subCategoryId:string;
	budgeted:number;
	overspendingHandling:string;
	note:string;

	// These properties are actually coming from the monthly subcategory budget calculation entity from the server
	cashOutflows:number;
	positiveCashOutflows:number;
	creditOutflows:number;
	balance:number;
	overspendingAffectsBuffer:number;
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

	// Duplicated properties from other entities
	month:string;

	subCategoryInternalName:string;
	subCategoryType:string;
	subCategoryName:string;
	subCategorySortableIndex:number;
	subCategoryPinnedIndex:number;
	subCategoryNote:string;

	masterCategoryId:string;
	masterCategoryName:string;
	masterCategoryInternalName:string;
	masterCategorySortableIndex:number;

	deviceKnowledgeForCalculatedFields:number;
}