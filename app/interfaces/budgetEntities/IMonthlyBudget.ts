import { IBudgetEntity } from '../common/IBudgetEntity';

export interface IMonthlyBudget extends IBudgetEntity {

	month:string;
	note:string;

	// These properties are actually coming from the monthly budget calculation entity from the server
	previousIncome:number;
	immediateIncome:number;
	deferredIncome:number;
	budgeted:number;
	cashOutflows:number;
	creditOutflows:number;
	balance:number;
	overSpent:number;
	availableToBudget:number;
	uncategorizedCashOutflows:number;
	uncategorizedCreditOutflows:number;
	uncategorizedBalance:number;
	hiddenBudgeted:number;
	hiddenCashOutflows:number;
	hiddenCreditOutflows:number;
	hiddenBalance:number;
	additionalToBeBudgeted:number;
	calculationNotes:string;
	ageOfMoney:number;

	deviceKnowledgeForCalculatedFields:number;
}