import { IEntity } from '../common/IEntity';

export interface IBudget extends IEntity {

	budgetName:string;
	dataFormat:string;
	lastAccessedOn:number;
	isTombstone:number;
}