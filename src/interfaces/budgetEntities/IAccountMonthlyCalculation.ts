import { IBudgetEntity } from '../common/IBudgetEntity';

export interface IAccountMonthlyCalculation extends IBudgetEntity {

	month:string;
	accountId:string;
	clearedBalance:number;
	unclearedBalance:number;
	infoCount:number;
	warningCount:number;
	errorCount:number;
	transactionCount:number;
}