import { IBudgetEntity } from '../common/IBudgetEntity';

export interface IAccountMapping extends IBudgetEntity {

	fid:string;
	shortenedAccountId:string;
	hash:string;
	salt:string;
	accountId:string;
	dateSequence:string;
	shouldFlipPayeesMemos:number;
	shouldImportMemos:number;
	skipImport:number;
}