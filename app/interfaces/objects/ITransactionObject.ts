export interface ITransactionObject {

	entityId:string;
	isTransaction:boolean;
	account:string;
	date:string;
	payee:string;
	category:string;
	memo:string;
	amount:number;
}