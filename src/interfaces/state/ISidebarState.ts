export interface ISidebarState {

	expanded?:boolean;
	selectedTab?:string; // Budget/Reports/All Accounts/Account
	selectedAccountId?:string; // entityId of a particular account, or null 
}