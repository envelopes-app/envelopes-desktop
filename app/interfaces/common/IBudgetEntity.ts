import { IEntity } from './IEntity';

export interface IBudgetEntity extends IEntity {

	budgetVersionId:string;
	isTombstone:number;
}