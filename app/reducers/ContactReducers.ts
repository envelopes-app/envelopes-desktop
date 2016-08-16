/// <reference path="../_includes.ts" />

import { Contact } from '../models/Contact';
import * as ContactActions from '../actionCreators/ContactActions';
import { ApplicationState } from '../models/ApplicationState';

export function contacts(previousValue:Array<Contact>, action:Redux.Action):Array<Contact> {

	var newValue:Array<Contact> = previousValue;
	if(!newValue)
		newValue = [];

	switch(action.type) {

		case ContactActions.RECEIVE_CONTACTS:
			newValue = receiveContacts(previousValue, action as ContactActions.ReceiveContactsAction);
			break;

		case ContactActions.ADD_CONTACT:
			newValue = addContact(previousValue, action as ContactActions.AddContactAction);
			break;

		case ContactActions.UPDATE_CONTACT:
			newValue = updateContact(previousValue, action);
			break;

		case ContactActions.DELETE_CONTACT:
			newValue = deleteContact(previousValue, action);
			break;
	}

	return newValue;
}

export function contactFilterPhrase(previousValue:string, action:Redux.Action):string {

	var newValue:string = previousValue;
	if(!newValue)
		newValue = "";

	if(action.type == ContactActions.SET_CONTACT_SEARCH_FILTER) {
		var contactSearchFilterAction = action as ContactActions.SetContactSearchFilterAction;
		newValue = contactSearchFilterAction.searchPhrase;
	}

	return newValue;
}


// ***************************************************************************************************
// Private Helper/Utility Methods
// ***************************************************************************************************
function receiveContacts(contacts:Array<Contact>, action:ContactActions.ReceiveContactsAction):Array<Contact> {

	return action.contacts;
}

function addContact(contacts:Array<Contact>, action:ContactActions.AddContactAction):Array<Contact> {

	contacts = contacts.concat(action.contact);
	return contacts;
}

function updateContact(contacts:Array<Contact>, action:Redux.Action):Array<Contact> {

	return contacts;
}

function deleteContact(contacts:Array<Contact>, action:Redux.Action):Array<Contact> {

	return contacts;
}
