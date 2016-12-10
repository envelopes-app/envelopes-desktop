import { IBudgetEntity } from '../common/IBudgetEntity';

export interface IAccountMonthlyBalance extends IBudgetEntity {

	accountId:string;
	asOfMonth:string;
	balance:number;
}