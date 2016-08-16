import { IBudgetEntity } from '../common/IBudgetEntity';

export interface IPayee extends IBudgetEntity {

	accountId:string;
	enabled:number;
	autoFillSubCategoryId:string;
	name:string;
	internalName:string;
}