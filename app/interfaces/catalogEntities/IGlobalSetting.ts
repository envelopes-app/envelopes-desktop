import { IEntity } from '../common/IEntity';

export interface IGlobalSetting extends IEntity {

	settingName:string;
	settingValue:string;
}