/// <reference path="../_includes.ts" />

import { combineReducers } from 'redux'
import { GlobalReducers } from './GlobalReducers';
import { SidebarReducers } from './SidebarReducers';

const combinedReducer = combineReducers({

	activeBudgetId: GlobalReducers.activeBudgetId,
	selectedBudgetMonth: GlobalReducers.selectedBudgetMonth,
	entitiesCollection: GlobalReducers.entitiesCollection,
	sidebarState: SidebarReducers.sidebarState
});

export default combinedReducer;
