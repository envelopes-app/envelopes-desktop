import * as _ from 'lodash';

import { ISidebarState } from '../interfaces/state';
import { ActionNames } from '../constants';
import { SetSidebarExpandedAction, SetSelectedTabAction } from '../interfaces/actions';

export class SidebarReducers {

	public static sidebarState(previousValue:ISidebarState, action:Redux.Action):ISidebarState {

		var newValue:ISidebarState;
		if(!previousValue)
			newValue = {
				expanded: true,
				selectedTab: "Budget",
				selectedAccountId: null
			};
		else
			newValue = Object.assign({}, previousValue);

		switch(action.type) {

			case ActionNames.GLOBAL_LOAD_BUDGET_COMPLETED:
				newValue.selectedTab = "Reports";
				newValue.selectedAccountId = null;
				break;

			case ActionNames.SIDEBAR_SET_EXPANDED:
				newValue.expanded = (action as SetSidebarExpandedAction).expanded;
				break;

			case ActionNames.SIDEBAR_SET_SELECTED_TAB:
				newValue.selectedTab = (action as SetSelectedTabAction).selectedTab;
				newValue.selectedAccountId = (action as SetSelectedTabAction).selectedAccountId;
				break;
		}

		return newValue;
	}
}