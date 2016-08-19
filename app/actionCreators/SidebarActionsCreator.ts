/// <reference path="../_includes.ts" />

import { SetSelectedTabAction, SetBudgetAccountsExpandedAction, SetTrackingAccountsExpandedAction, SetClosedAccountsExpandedAction } from '../interfaces/actions';
import { ActionNames } from '../constants';

export class SidebarActionsCreator {

	// ********************************************************************************************
	// Sync Action Creators
	// ********************************************************************************************
	public static setSelectedTab(selectedTab:string, selectedAccountId:string):SetSelectedTabAction {
		return {
			type: ActionNames.SIDEBAR_SET_SELECTED_TAB,
			selectedTab: selectedTab,
			selectedAccountId: selectedAccountId
		};
	}

	public static setBudgetAccountsExpanded(expanded:boolean):SetBudgetAccountsExpandedAction {
		return {
			type: ActionNames.SIDEBAR_SET_BUDGETS_ACCOUNT_EXPANDED,
			expanded: expanded
		};
	}

	public static setTrackingAccountsExpanded(expanded:boolean):SetTrackingAccountsExpandedAction {
		return {
			type: ActionNames.SIDEBAR_SET_TRACKING_ACCOUNT_EXPANDED,
			expanded: expanded
		};
	}

	public static setClosedAccountsExpanded(expanded:boolean):SetClosedAccountsExpandedAction {
		return {
			type: ActionNames.SIDEBAR_SET_CLOSED_ACCOUNT_EXPANDED,
			expanded: expanded
		};
	}
}
