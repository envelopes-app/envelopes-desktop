import { IEntity } from '../common/IEntity';

export interface IUserSetting extends IEntity {

	userId:string;
	settingName:string;
	settingValue:string;
}