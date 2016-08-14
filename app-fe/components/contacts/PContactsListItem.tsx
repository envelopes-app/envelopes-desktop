/// <reference path="../../_includes.ts" />

import * as React from 'react';

import { Contact } from '../../models/Contact';

export interface PContactsListItemProps {
	contact: Contact;
}

export class PContactsListItem extends React.Component<PContactsListItemProps, {}> {
  
	render() {

		// Get the contact object passed in the props
	  	var contact:Contact = this.props.contact;
		return (
			<tr>
				<td>{contact.firstName}</td>
				<td>{contact.lastName}</td>
				<td>{contact.dateOfBirth}</td>
				<td>{contact.phone}</td>
				<td>{contact.email}</td>
				<td>{contact.notes}</td>
				<td/>
			</tr>
		);
	}
}