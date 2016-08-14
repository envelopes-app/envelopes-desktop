/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PSearchInput } from '../common/PSearchInput';
import { PButtonWithGlyph } from '../common/PButtonWithGlyph';
import { PContactsListItem } from './PContactsListItem';
import { PContactEditDialog } from './PContactEditDialog';

import { Contact } from '../../models/Contact';

import '../../styles/contacts/PContactsContainer.css';

export interface PContactsContainerProps {
    contacts: Array<Contact>;
	onAddContact: (contact:Contact)=>void;
	onUpdateContact: (contact:Contact)=>void;
	onDeleteContact: (contactId:string)=>void;
}

export class PContactsContainer extends React.Component<PContactsContainerProps, {}> {
  
  	private handleNewContactButtonClick(event:React.MouseEvent):void {
		var modal:PContactEditDialog = this.refs['contactEditDialog'] as PContactEditDialog;
		modal.show();
	}

  	private handleSearchButtonClick(event:React.MouseEvent):void {
		alert("Search button clicked.");
	}

	public render() {

		return (
			<div className="contacts-list-container">
				<div className="contacts-container-commands">
					<PSearchInput placeHolder="Search here" classNames={['contacts-container-searchbox']} clickHandler={this.handleSearchButtonClick.bind(this)} />
					<PButtonWithGlyph text="Contacts Manager" glyphName="glyphicon-plus-sign" clickHandler={this.handleNewContactButtonClick.bind(this)} />
				</div>
				<div className="contacts-container-table">

					<table className="table table-bordered table-hover">
						<thead>
						<tr className="contacts-container-tableheader">
							<th>First Name</th>
							<th>Last Name</th>
							<th>Date of Birth</th>
							<th>Phone</th>
							<th>Email</th>
							<th>Notes</th>
							<th/>
						</tr>
						</thead>
						<tbody>
							{ 
								this.props.contacts.map((contact:Contact)=>{
									return <PContactsListItem contact={contact} key={contact.contactId} />;
								}) }
						</tbody>
					</table>
				</div>
				<PContactEditDialog ref="contactEditDialog" onAddContact={this.props.onAddContact} />
      		</div>
    	);
	}
}