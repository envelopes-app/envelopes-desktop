/// <reference path="../_includes.ts" />

import { combineReducers } from 'redux'
import { GlobalReducers } from './GlobalReducers';
import * as ContactReducers from './ContactReducers';

const combinedReducer = combineReducers({
	entitiesCollection: GlobalReducers.entitiesCollection,

	contacts: ContactReducers.contacts,
	contactFilterPhrase: ContactReducers.contactFilterPhrase
});

export default combinedReducer;
