/// <reference path="../_includes.ts" />

import { Account } from './Account';
import { Contact } from './Contact';

export interface ApplicationState {

	accounts?:Array<Account>;


	// UI Related State
	sidebar_selectedTab:string; // Budget or Accounts
	sidebar_selectedAccountId:string; // 'allAccount' or a specific account's id 



	// List of all contacts
	contacts?:Array<Contact>;

	// Contains the search phrase for filtering the contacts list
	contactFilterPhrase?:string;
}