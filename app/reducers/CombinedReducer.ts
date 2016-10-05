/// <reference path="../_includes.ts" />

import { combineReducers } from 'redux'
import { GlobalReducers } from './GlobalReducers';
import { SidebarReducers } from './SidebarReducers';
import { BudgetReducers } from './BudgetReducers';

const combinedReducer = combineReducers({

	selectedBudgetMonth: GlobalReducers.selectedBudgetMonth,
	entitiesCollection: GlobalReducers.entitiesCollection,
	sidebarState: SidebarReducers.sidebarState,
	budgetState: BudgetReducers.budgetState,
});

export default combinedReducer;
