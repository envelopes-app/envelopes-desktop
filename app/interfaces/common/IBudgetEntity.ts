import { IEntity } from './IEntity';

export interface IBudgetEntity extends IEntity {

	budgetId:string;
	isTombstone:number;
}