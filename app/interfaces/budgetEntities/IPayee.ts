import { IBudgetEntity } from '../common/IBudgetEntity';

export interface IPayee extends IBudgetEntity {

	accountId:string;
	enabled:number;
	autoFillSubCategoryId:string;
	autoFillMemo:string;
	autoFillAmount:number;
	autoFillSubCategoryEnabled:number;
	autoFillMemoEnabled:number;
	autoFillAmountEnabled:number;
	renameOnImportEnabled:number;
	name:string;
	internalName:string;
}