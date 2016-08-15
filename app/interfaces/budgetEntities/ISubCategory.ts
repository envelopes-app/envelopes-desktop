import { IBudgetEntity } from '../common/IBudgetEntity';

export interface ISubCategory extends IBudgetEntity {

	masterCategoryId:string;
	accountId:string;
	internalName:string;
	sortableIndex:number;
	pinnedIndex:number;
	name:string;
	type:string;
	note:string;
	isHidden:number;
	goalType:string;
	goalCreationMonth:string;
	targetBalance:number;
	targetBalanceMonth:string;
	monthlyFunding:number;
}