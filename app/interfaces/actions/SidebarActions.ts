/// <reference path="../../_includes.ts" />

export interface SetSelectedTabAction extends Redux.Action { 

	selectedTab:string;
	selectedAccountId:string;
}