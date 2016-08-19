import { IBudgetEntity } from '../common/IBudgetEntity';

export interface ISubTransaction extends IBudgetEntity {

	transactionId:string;
	payeeId:string;
	subCategoryId:string;
	amount:number;
	memo:string;
	transferAccountId:string;
	transferTransactionId:string;
	sortableIndex:number;

	cashAmount:number;
	creditAmount:number;
	subCategoryCreditAmountPreceding:number;
	deviceKnowledgeForCalculatedFields:number;
}