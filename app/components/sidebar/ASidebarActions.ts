/// <reference path="../../_includes.ts" />

import { AccountTypeConstants } from '../../models/Account';
import { IAccount } from '../../interfaces/budgetEntities'; 
import { IApplicationState } from '../../interfaces/state';
import { Promise } from 'es6-promise';

// ********************************************************************************************
// Action Names
// ********************************************************************************************
export const REQUEST_ACCOUNTS:string = "REQUEST_ACCOUNTS";
export const RECEIVE_ACCOUNTS:string = "RECEIVE_ACCOUNTS";
export const ADD_ACCOUNT:string = "ADD_ACCOUNT";
export const UPDATE_ACCOUNT:string = "UPDATE_ACCOUNT";
export const DELETE_ACCOUNT:string = "DELETE_ACCOUNT";

// ********************************************************************************************
// Actions
// ********************************************************************************************
export interface RequestAccountsAction extends Redux.Action { }

export interface ReceiveAccountsAction extends Redux.Action { 
	accounts:Array<IAccount>;
}

export interface AddAccountAction extends Redux.Action {
	account:IAccount;
}

export interface UpdateAccountAction extends Redux.Action {
	account:IAccount;
}

export interface DeleteAccountAction extends Redux.Action {
	accountId:string;
}

// ********************************************************************************************
// Action Creators
// ********************************************************************************************
export function requestAccounts():RequestAccountsAction {
	return {
		type: REQUEST_ACCOUNTS
	};
}

export function fetchAccounts() {

	return function(dispatch:ReactRedux.Dispatch<IApplicationState>) {

		dispatch(requestAccounts);
		return getAccountsFromDB()
			.then((accounts:Array<IAccount>)=>{
				// Dispatch a RECEIVE_ACCOUNTS action with the returned accounts array
				dispatch(receiveAccounts(accounts));
			});
	};
}

export function receiveAccounts(accounts:Array<IAccount>):ReceiveAccountsAction {
	return {
		type: RECEIVE_ACCOUNTS,
		accounts: accounts
	};
}

export function addAccount(account:IAccount):AddAccountAction {
	return {
		type: ADD_ACCOUNT,
		account: account
	};
}

export function updateAccount(account:IAccount):UpdateAccountAction {
	return {
		type: UPDATE_ACCOUNT,
		account: account
	};
}

export function deleteAccount(accountId:string):DeleteAccountAction {
	return {
		type: DELETE_ACCOUNT,
		accountId: accountId
	};
}

// Dummy Async function that returns contacts data
function getAccountsFromDB():Promise<Array<IAccount>> {

	return Promise.resolve([]);
}