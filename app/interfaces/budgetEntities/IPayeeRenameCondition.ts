import { IBudgetEntity } from '../common/IBudgetEntity';

export interface IPayeeRenameCondition extends IBudgetEntity {

	payeeId:string;
	operator:string;
	operand:string;
}