/// <reference path="../../_includes.ts" />

import { connect } from 'react-redux';

import { Contact } from '../../models/Contact';
import * as ContactActions from '../../actions/ContactActions';
import { ApplicationState } from '../../models/ApplicationState';
import { PContactsContainer} from './PContactsContainer';

// Filter function for extracting the contacts from the "allContacts" in the state
// that match the filterPhrase.
const getFilteredContacts = (contacts:Array<Contact>, filterPhrase:string) => {
	return contacts;
};

const mapStateToProps = (state:ApplicationState) => {
	return {
    	contacts: getFilteredContacts(state.contacts, state.contactFilterPhrase)
  	};
};

const mapDispatchToProps = (dispatch:ReactRedux.Dispatch<ApplicationState>) => {
  	return {
    	onAddContact: (contact:Contact) => {
      		dispatch(ContactActions.addContact(contact));
    	},
    	onUpdateContact: (contact:Contact) => {
      		dispatch(ContactActions.updateContact(contact));
    	},
    	onDeleteContact: (contactId:string) => {
      		dispatch(ContactActions.deleteContact(contactId));
    	}
	}
}

const CContactsContainer = connect(mapStateToProps, mapDispatchToProps)(PContactsContainer);
export default CContactsContainer;
