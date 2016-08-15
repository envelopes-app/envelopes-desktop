import { IEntity } from '../common/IEntity';

export interface IUser extends IEntity {

	userName:string;
	email:string;
}