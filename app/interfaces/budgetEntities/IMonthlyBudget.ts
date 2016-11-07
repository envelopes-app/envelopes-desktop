import { IBudgetEntity } from '../common/IBudgetEntity';

export interface IMonthlyBudget extends IBudgetEntity {

	month:string;
	note:string;

	previousIncome:number;
	immediateIncome:number;
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
	ageOfMoney:number;

	deviceKnowledgeForCalculatedFields:number;
}