import { IBudgetEntity } from '../common/IBudgetEntity';

export interface IMasterCategory extends IBudgetEntity {

	internalName:string;
	deletable:number;
	sortableIndex:number;
	name:string;
	note:string;
	isHidden:number;
}