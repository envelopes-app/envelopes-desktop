/// <reference path="../_includes.ts" />

import { combineReducers } from 'redux'
import { GlobalReducers } from './GlobalReducers';
import { SidebarReducers } from './SidebarReducers';
import { RegisterReducers } from './RegisterReducers';
import { BudgetReducers } from './BudgetReducers';

import * as ContactReducers from './ContactReducers';

const combinedReducer = combineReducers({

	entitiesCollection: GlobalReducers.entitiesCollection,
	sidebarState: SidebarReducers.sidebarState,
	registerState: RegisterReducers.registerState,
	budgetState: BudgetReducers.budgetState,
	
	contacts: ContactReducers.contacts,
	contactFilterPhrase: ContactReducers.contactFilterPhrase
});

export default combinedReducer;
