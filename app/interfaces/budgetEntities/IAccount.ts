import { IBudgetEntity } from '../common/IBudgetEntity';

export interface IAccount extends IBudgetEntity {

	accountType:string;
	accountName:string;
	lastEnteredCheckNumber:string;
	lastReconciledDate:number;
	lastReconciledBalance:number;
	note:string;
	closed:number;
	sortableIndex:number;
	onBudget:number;
	clearedBalance:number;
	unclearedBalance:number;
	infoCount:number;
	warningCount:number;
	errorCount:number;
	transactionCount:number;

	deviceKnowledgeForCalculatedFields:number;
}