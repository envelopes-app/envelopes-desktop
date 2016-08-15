import { IBudgetEntity } from '../common/IBudgetEntity';

export interface IScheduledSubTransaction extends IBudgetEntity {

	scheduledTransactionId:string;
	payeeId:string;
	subCategoryId:string;
	amount:number;
	memo:string;
	transferAccountId:string;
	sortableIndex:number;
}