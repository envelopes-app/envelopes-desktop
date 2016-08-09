/// <reference path="../_includes.ts" />

import { combineReducers } from 'redux'
import * as ContactReducers from './ContactReducers';
import { ApplicationState } from '../models/ApplicationState';

const combinedReducer = combineReducers({
	contacts: ContactReducers.contacts,
	contactFilterPhrase: ContactReducers.contactFilterPhrase
});

export default combinedReducer;
