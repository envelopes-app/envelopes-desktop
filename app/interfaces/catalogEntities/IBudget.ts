import { IEntity } from '../common/IEntity';

export interface IBudget extends IEntity {

	budgetName:string;
	dataFormat:string;
	firstMonth:string;
	lastMonth:string;
	lastAccessedOn:number;
	isTombstone:number;
}