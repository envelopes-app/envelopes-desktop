/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Popover, Form, FormGroup, FormControl, HelpBlock, ControlLabel, Button, Glyphicon, Overlay } from 'react-bootstrap';

import { DataFormatter } from '../../../utilities';
import { IAccount } from '../../../interfaces/budgetEntities';
import { AccountTypes, AccountTypeNames } from '../../../constants';

export interface PAccountEditDialogProps {
	dataFormatter:DataFormatter;
	// Dispatcher method from CSidebar for updating the account
	updateAccount:(account:IAccount, currentBalance:number)=>void;
}

export interface PAccountEditDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	account:IAccount;
}

const PopoverStyle = {
	maxWidth: 'none', 
	width:'400px'
}

const ButtonsContainerStyle = {
	display: "flex",
	flexFlow: "row nowrap",	
	width: "100%",
	justifyContent: "space-between"
}

const ButtonStyle = {
	flex: "0 0 auto",
	fontSize: "14px"
}

export class PAccountEditDialog extends React.Component<PAccountEditDialogProps, PAccountEditDialogState> {
  
	private ctrlAccountName:FormControl;
	private ctrlNote:FormControl;
	private ctrlAccountBalance:FormControl;

	constructor(props: any) {
        super(props);
		this.handleOk = this.handleOk.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.handleCloseAccount = this.handleCloseAccount.bind(this);
		this.handleDeleteAccount = this.handleDeleteAccount.bind(this);
		this.handleReopenAccount = this.handleReopenAccount.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"right",
			account: null
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}

	public show(account:IAccount, target:HTMLElement, placement:string = "right"):void {

		var state = _.assign({}, this.state) as PAccountEditDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		state.account = account;
		this.setState(state);
	}

	public hide():void {
		var state = _.assign({}, this.state) as PAccountEditDialogState;
		state.show = false;
		this.setState(state);
	}

	private handleOk() {

		// Get the values from the form controls
		var accountName = (ReactDOM.findDOMNode(this.ctrlAccountName) as any).value;
		var accountNote = (ReactDOM.findDOMNode(this.ctrlNote) as any).value;
		var accountBalance = (ReactDOM.findDOMNode(this.ctrlAccountBalance) as any).value;

		// Hide the popover		
		this.hide();

		// If the user has changed any of the account properties, then call updateAccount
		var account:IAccount = this.state.account;
		if(
			account.accountName !== accountName ||
			account.note !== accountNote ||
			account.clearedBalance + account.unclearedBalance !== accountBalance 
		) {
			// Create a copy of the account entity, update the values in it and call the update method with it
			var updatedAccount = Object.assign({}, account) as IAccount;
			updatedAccount.accountName = accountName;
			updatedAccount.note = accountNote;
			this.props.updateAccount(updatedAccount, accountBalance);			 
		}
	}

	private handleCancel() {

		// Hide the popover for editing the account		
		this.hide();
	}

	private handleCloseAccount() {

		// Get the values from the form controls
		var accountName = (ReactDOM.findDOMNode(this.ctrlAccountName) as any).value;
		var accountNote = (ReactDOM.findDOMNode(this.ctrlNote) as any).value;
		var accountBalance = (ReactDOM.findDOMNode(this.ctrlAccountBalance) as any).value;

		// Hide the popover for editing the account		
		this.hide();

		// If the account's current balance is zero, we can close it immediately

		// Set the closed flag on the account and send it for update
		var updatedAccount = _.assign({}, this.state.account) as IAccount;
		updatedAccount.closed = 1;
		updatedAccount.accountName = accountName;
		updatedAccount.note = accountNote;
		this.props.updateAccount(updatedAccount, accountBalance);			 
	}

	private handleDeleteAccount() {
		// TODO
	}

	private handleReopenAccount() {
		// TODO
	}

  	public render() {

		if(!this.state.account) {

			return <div />;
		}
		else {
			var account = this.state.account;
			var accountBalance = account.clearedBalance + account.unclearedBalance;
			var dataFormatter = this.props.dataFormatter;

			return (
				<Overlay show={this.state.show} placement={this.state.placement} 
					rootClose={true} onHide={this.handleCancel} 
					target={()=> ReactDOM.findDOMNode(this.state.target)}>
					<Popover id="editAccountPopover" style={PopoverStyle}>
						<Form>
							<FormGroup>
								<FormControl ref={(c)=> { this.ctrlAccountName = c; }} componentClass="input" type="text" value={account.accountName} />
							</FormGroup>
							<FormGroup>
								<FormControl ref={(c)=> { this.ctrlNote = c; }} componentClass="textarea" placeholder="Enter a note (not your account number)..." value={account.note} />
							</FormGroup>
							<FormGroup>
								<ControlLabel>Today's Balance:</ControlLabel>
								<FormControl ref={(c)=> { this.ctrlAccountBalance = c; }} type="text" value={accountBalance} />
								<HelpBlock>An adjustment transaction will be created automatically if you change this amount.</HelpBlock>
							</FormGroup>
							<FormGroup>
								<ControlLabel>Last Reconciliation Date:</ControlLabel>
								<FormControl componentClass="input" type="text" readOnly={true} value={account.lastReconciledDate ? dataFormatter.formatDate(account.lastReconciledDate) : ""} />
							</FormGroup>
							<FormGroup>
								<ControlLabel>Last Reconciled Balance:</ControlLabel>
								<FormControl componentClass="input" type="text" readOnly={true} value={account.lastReconciledBalance ? dataFormatter.formatCurrency(account.lastReconciledBalance) : ""} />
							</FormGroup>
						</Form>
						<div className="buttons-container">
							<Button className="dialog-warning-button" style={ButtonStyle} onClick={this.handleCloseAccount}>
								<Glyphicon glyph="minus-sign" />&nbsp;Close Account
							</Button>
							<div className="spacer" />
							<Button className="dialog-secondary-button" style={ButtonStyle} onClick={this.handleCancel}>
								Cancel&nbsp;<Glyphicon glyph="remove-sign" />
							</Button>
							<div style={{width: '8px'}} />
							<Button className="dialog-primary-button" style={ButtonStyle} onClick={this.handleOk}>
								OK&nbsp;<Glyphicon glyph="ok-sign" />
							</Button>
						</div>
					</Popover>
				</Overlay>
			);
		}
  	}
}