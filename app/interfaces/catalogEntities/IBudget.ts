import { IEntity } from '../common/IEntity';

export interface IBudget extends IEntity {

	budgetName:string;
	lastAccessedOn:number;
	dateFormat:string;
	currencyFormat:string;
	source:string;
	isTombstone:number;
}