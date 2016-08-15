import { IBudgetEntity } from '../common/IBudgetEntity';

export interface IScheduledTransaction extends IBudgetEntity {

	accountId:string;
	payeeId:string;
	subCategoryId:string;
	date:number;
	frequency:string;
	amount:number;
	memo:string;
	flag:string;
	transferAccountId:string;

	upcomingInstances:string;
	deviceKnowledgeForCalculatedFields:number;
}