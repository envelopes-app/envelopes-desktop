export interface ITransactionObject {

	entityId:string;
	isTransaction:boolean;
	account:string;
	date:number;
	payee:string;
	category:string;
	memo:string;
	amount:number;
}