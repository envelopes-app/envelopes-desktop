import { IBudgetEntity } from '../common/IBudgetEntity';

export interface ICalculationTransactionAmount extends IBudgetEntity {

	accountId:string;
	transactionId:string;
	subTransactionId:string;
	isTransaction:boolean;
	isSubTransaction:boolean;
	isSplit:boolean;
	subCategoryId:string;
	date:number;
	amount:number;
	cashAmount:number;
	creditAmount:number;
	subCategoryCreditAmountPreceding:number;
}