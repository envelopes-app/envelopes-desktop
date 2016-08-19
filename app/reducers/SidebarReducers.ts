import * as _ from 'lodash';

import { ISidebarState } from '../interfaces/state';
import { ActionNames } from '../constants';
import { SetSelectedTabAction, SetBudgetAccountsExpandedAction, SetTrackingAccountsExpandedAction, SetClosedAccountsExpandedAction } from '../interfaces/actions';

export class SidebarReducers {

	public static sidebarState(previousValue:ISidebarState, action:Redux.Action):ISidebarState {

		var newValue:ISidebarState;
		if(!previousValue)
			newValue = {
				selectedTab: "Budget",
				selectedAccountId: null,
				budgetAccountsExpanded: true,
				trackingAccountsExpanded: false,
				closedAccountsExpanded: false
			};
		else
			newValue = _.assign({}, previousValue);

		switch(action.type) {

			case ActionNames.SIDEBAR_SET_SELECTED_TAB:
				newValue.selectedTab = (action as SetSelectedTabAction).selectedTab;
				newValue.selectedAccountId = (action as SetSelectedTabAction).selectedAccountId;
				break;

			case ActionNames.SIDEBAR_SET_BUDGETS_ACCOUNT_EXPANDED:
				newValue.budgetAccountsExpanded = (action as SetBudgetAccountsExpandedAction).expanded;
				break;

			case ActionNames.SIDEBAR_SET_TRACKING_ACCOUNT_EXPANDED:
				newValue.budgetAccountsExpanded = (action as SetTrackingAccountsExpandedAction).expanded;
				break;

			case ActionNames.SIDEBAR_SET_CLOSED_ACCOUNT_EXPANDED:
				newValue.budgetAccountsExpanded = (action as SetClosedAccountsExpandedAction).expanded;
				break;
		}

		return newValue;
	}
}
