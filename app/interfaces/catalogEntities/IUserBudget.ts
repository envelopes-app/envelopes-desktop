import { IEntity } from '../common/IEntity';

export interface IUserBudget extends IEntity {

	userId:string;
	budgetId:string;
	isTombstone:number;
}