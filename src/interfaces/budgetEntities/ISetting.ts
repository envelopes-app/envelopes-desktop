import { IBudgetEntity } from '../common/IBudgetEntity';

export interface ISetting extends IBudgetEntity {

	settingName:string;
	settingValue:string;
}