/// <reference path='../_includes.ts' />

export interface IDatabaseQuery {

	name?: string;
	query: string;
	arguments: Array<any>;
}