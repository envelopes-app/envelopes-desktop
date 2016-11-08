/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Modal, Form, FormGroup, FormControl, ControlLabel, Glyphicon } from 'react-bootstrap';

import { IAccount } from '../../../interfaces/budgetEntities';
import { AccountTypes, AccountTypeNames } from '../../../constants';

export interface PAccountClosingDialogProps { 
	onAddAccount: (account:IAccount, currentBalance:number)=>void;
}

export interface PAccountClosingDialogState {
	showModal:boolean;
	account?:IAccount;
}

export class PAccountClosingDialog extends React.Component<PAccountClosingDialogProps, PAccountClosingDialogState> {

	private ctrlAccountName:FormControl;
	private ctrlAccountType:FormControl;
	private ctrlAccountBalance:FormControl;

	constructor(props: any) {
        super(props);
        this.state = { showModal: false, account: null };
		this.show = this.show.bind(this);
		this.save = this.save.bind(this);
		this.close = this.close.bind(this);
    }

	private close():void {
		// Hide the modal, and set the account in state to null
		this.setState({ showModal: false, account: null });
	};

	private save():void {
		var account:IAccount = this.state.account;
		// Update the account entity values from the form controls
		account.accountName = (ReactDOM.findDOMNode(this.ctrlAccountName) as any).value;
		account.accountType = (ReactDOM.findDOMNode(this.ctrlAccountType) as any).value;
		var currentBalance = (ReactDOM.findDOMNode(this.ctrlAccountBalance) as any).value;
		// Validate the values

		// Call the addAccount method to create the account entity
		this.props.onAddAccount(account, currentBalance);
		// Close the modal dialog
		this.close();
	}

	public show(account:IAccount):void {
		this.setState({ showModal: true, account: account });
	};

	public render() {
		return (
			<Modal show={this.state.showModal} animation={true} onHide={this.close} backdrop="static" keyboard={false} dialogClassName="add-account-dialog">
				<Modal.Header bsClass="modal-header">
					<Modal.Title>Close Account</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<FormGroup>
							<ControlLabel>Account Name:</ControlLabel>
							<FormControl ref={(c)=> {this.ctrlAccountName = c;}} type="text" placeholder="New Account" />
						</FormGroup>
						<FormGroup>
							<ControlLabel>Today's Balance:</ControlLabel>
							<FormControl ref={(c)=> {this.ctrlAccountBalance = c;}} type="text" placeholder="What is the balance of this account right now?"/>
						</FormGroup>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button className="dialog-secondary-button" onClick={this.close}>
						Cancel&nbsp;<Glyphicon glyph="remove-sign" />
					</Button>
					<Button className="dialog-primary-button" onClick={this.save}>
						Add Account&nbsp;<Glyphicon glyph="ok-sign" />
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
