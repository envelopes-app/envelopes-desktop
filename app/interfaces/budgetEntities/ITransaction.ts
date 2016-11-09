import { IBudgetEntity } from '../common/IBudgetEntity';

export interface ITransaction extends IBudgetEntity {

	accountId:string;
	payeeId:string;
	subCategoryId:string;
	date:number;
	dateEnteredFromSchedule:number;
	amount:number;
	memo:string;
	checkNumber:string;
	cleared:string;
	accepted:number;
	flag:string;
	source:string;
	transferAccountId:string;
	transferTransactionId:string;
	transferSubTransactionId:string;
	scheduledTransactionId:string;
	matchedTransactionId:string;
	importId:string;
	importedPayee:string;
	importedDate:number;

	cashAmount:number;
	creditAmount:number;
	subCategoryCreditAmountPreceding:number;
	deviceKnowledgeForCalculatedFields:number;
}