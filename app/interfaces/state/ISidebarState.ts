export interface ISidebarState {

	selectedTab?:string; // Budget/Reports/All Accounts/Account
	selectedAccountId?:string; // entityId of a particular account, or null 

	budgetAccountsExpanded?:boolean;
	trackingAccountsExpanded?:boolean;
	closedAccountsExpanded?:boolean;
}