/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Contact } from '../../models/Contact';
import { Button, Modal, Form, FormGroup, FormControl, Col, Checkbox, ControlLabel } from 'react-bootstrap';

import '../../styles/contacts/PContactEditDialog.css';

export interface PContactEditDialogProps {
	onAddContact: (contact:Contact)=>void;
}

export class PContactEditDialog extends React.Component<PContactEditDialogProps, {showModal:boolean, contact?:Contact}> {

	constructor(props: any) {
        super(props);
        this.state = { showModal: false, contact: null };
		this.show = this.show.bind(this);
		this.save = this.save.bind(this);
		this.close = this.close.bind(this);
    }

	private close():void {
		// Hide the modal, and set the contact in state to null
		this.setState({ showModal: false, contact: null });
	};

	private save():void {
		var contact:Contact = this.state.contact;
		debugger;
		contact.firstName = "Faisal";
		contact.lastName = "Ahmad";
		this.props.onAddContact(contact);
		// Close the modal dialog
		this.close();
	}

	public show(contact:Contact = new Contact()):void {
		this.setState({ showModal: true, contact: contact });
	};

	render() {
		return (
			<Modal show={this.state.showModal} onHide={this.close}>
				<Modal.Header bsClass="modal-header contact-edit-dialog-header" closeButton>
					<Modal.Title>Contacts Manager</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form horizontal>
						<FormGroup controlId="formFirstName">
							<Col componentClass={ControlLabel} sm={3}>
								First Name
							</Col>
							<Col sm={9}>
								<FormControl ref="inputFirstName" type="text" placeholder="First Name" />
							</Col>
						</FormGroup>
						<FormGroup controlId="formLastName">
							<Col componentClass={ControlLabel} sm={3}>
								Last Name
							</Col>
							<Col sm={9}>
								<FormControl ref="inputLastName" type="text" placeholder="Last Name" />
							</Col>
						</FormGroup>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.save}>Save</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
