import { IBudgetEntity } from '../common/IBudgetEntity';

export interface ITransaction extends IBudgetEntity {

	source:string;
	accountId:string;
	payeeId:string;
	subCategoryId:string;
	date:number;
	dateEnteredFromSchedule:number;
	amount:number;
	memo:string;
	cleared:string;
	accepted:number;
	checkNumber:string;
	flag:string;
	transferAccountId:string;
	transferTransactionId:string;
	transferSubTransactionId:string;
	scheduledTransactionId:string;
	matchedTransactionId:string;
	ynabId:string;
	importedPayee:string;
	importedDate:number;

	cashAmount:number;
	creditAmount:number;
	subCategoryCreditAmountPreceding:number;
	deviceKnowledgeForCalculatedFields:number;
}