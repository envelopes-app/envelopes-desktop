/// <reference path="../_includes.ts" />

import { Contact } from '../models/Contact';
import { ApplicationState } from '../models/ApplicationState';
import * as RSVP from 'es6-promise';

// ********************************************************************************************
// Action Names
// ********************************************************************************************
export const REQUEST_CONTACTS:string = "REQUEST_CONTACTS";
export const RECEIVE_CONTACTS:string = "RECEIVE_CONTACTS";
export const ADD_CONTACT:string = "ADD_CONTACT";
export const UPDATE_CONTACT:string = "UPDATE_CONTACT";
export const DELETE_CONTACT:string = "DELETE_CONTACT";
export const SET_CONTACT_SEARCH_FILTER:string = "SET_CONTACT_SEARCH_FILTER";

// ********************************************************************************************
// Actions
// ********************************************************************************************
export interface RequestContactsAction extends Redux.Action { }

export interface ReceiveContactsAction extends Redux.Action { 
	contacts:Array<Contact>;
}

export interface AddContactAction extends Redux.Action {
	contact:Contact;
}

export interface UpdateContactAction extends Redux.Action {
	contact:Contact;
}

export interface DeleteContactAction extends Redux.Action {
	contactId:string;
}

export interface SetContactSearchFilterAction extends Redux.Action {
	searchPhrase:string;
}

// ********************************************************************************************
// Action Creators
// ********************************************************************************************
export function requestContacts():RequestContactsAction {
	return {
		type: REQUEST_CONTACTS
	};
}

export function fetchContacts() {

	return function(dispatch:ReactRedux.Dispatch<ApplicationState>) {

		dispatch(requestContacts);
		return getContactsFromServer()
			.then((contacts:Array<Contact>)=>{
				// Dispatch a RECEIVE_CONTACTS action with the returned contacts array
				dispatch(receiveContacts(contacts));
			});
	};
}

export function receiveContacts(contacts:Array<Contact>):ReceiveContactsAction {
	return {
		type: RECEIVE_CONTACTS,
		contacts: contacts
	};
}

export function addContact(contact:Contact):AddContactAction {
	return {
		type: ADD_CONTACT,
		contact: contact
	};
}

export function updateContact(contact:Contact):UpdateContactAction {
	return {
		type: UPDATE_CONTACT,
		contact: contact
	};
}

export function deleteContact(contactId:string):DeleteContactAction {
	return {
		type: DELETE_CONTACT,
		contactId: contactId
	};
}

export function setContactSearchFilter(searchPhrase:string):SetContactSearchFilterAction {
	return {
		type: SET_CONTACT_SEARCH_FILTER,
		searchPhrase: searchPhrase
	};
}

// Dummy Async function that returns contacts data
function getContactsFromServer():Promise<Array<Contact>> {

	return RSVP.Promise.resolve([
		{
			contactId: null,
			firstName: "Faisal",
			lastName: "Ahmad",
			dateOfBirth: "02/02/1979",
			phone: null,
			email: null,
			notes:null
		}
	]);
}