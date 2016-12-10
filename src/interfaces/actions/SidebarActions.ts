/// <reference path="../../_includes.ts" />

export interface SetSidebarExpandedAction extends Redux.Action { 

	expanded:boolean;
}

export interface SetSelectedTabAction extends Redux.Action { 

	selectedTab:string;
	selectedAccountId:string;
}