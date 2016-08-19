/// <reference path="../../_includes.ts" />

export interface SetSelectedTabAction extends Redux.Action { 

	selectedTab:string;
	selectedAccountId:string;
}

export interface SetBudgetAccountsExpandedAction extends Redux.Action {

	expanded:boolean;	
}

export interface SetTrackingAccountsExpandedAction extends Redux.Action {

	expanded:boolean;	
}

export interface SetClosedAccountsExpandedAction extends Redux.Action {

	expanded:boolean;	
}