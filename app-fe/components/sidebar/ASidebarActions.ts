/// <reference path="../../_includes.ts" />

import { Account, AccountTypeConstants } from '../../models/Account';
import { ApplicationState } from '../../models/ApplicationState';
import * as RSVP from 'es6-promise';

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
	accounts:Array<Account>;
}

export interface AddAccountAction extends Redux.Action {
	account:Account;
}

export interface UpdateAccountAction extends Redux.Action {
	account:Account;
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

	return function(dispatch:ReactRedux.Dispatch<ApplicationState>) {

		dispatch(requestAccounts);
		return getAccountsFromDB()
			.then((accounts:Array<Account>)=>{
				// Dispatch a RECEIVE_ACCOUNTS action with the returned accounts array
				dispatch(receiveAccounts(accounts));
			});
	};
}

export function receiveAccounts(accounts:Array<Account>):ReceiveAccountsAction {
	return {
		type: RECEIVE_ACCOUNTS,
		accounts: accounts
	};
}

export function addAccount(account:Account):AddAccountAction {
	return {
		type: ADD_ACCOUNT,
		account: account
	};
}

export function updateContact(account:Account):UpdateAccountAction {
	return {
		type: UPDATE_ACCOUNT,
		account: account
	};
}

export function deleteContact(accountId:string):DeleteAccountAction {
	return {
		type: DELETE_ACCOUNT,
		accountId: accountId
	};
}

// Dummy Async function that returns contacts data
function getAccountsFromDB():Promise<Array<Account>> {

	return RSVP.Promise.resolve([
		{
			accountId: "1",
			accountType: "Checking",
			name: "Checking",
			note: null,
			lastReconciledDate: null,
			lastReconciledBalance: 0,
			closed: false,
			sortableIndex: 0,
			onBudget: true
		}
	]);
}