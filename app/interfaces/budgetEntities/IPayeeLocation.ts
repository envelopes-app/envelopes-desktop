import { IBudgetEntity } from '../common/IBudgetEntity';

export interface IPayeeLocation extends IBudgetEntity {

	payeeId:string;
	latitude:number;
	longitude:number;
}