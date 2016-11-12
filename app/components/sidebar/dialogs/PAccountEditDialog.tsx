/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Popover, Form, FormGroup, FormControl, HelpBlock, ControlLabel, Button, Glyphicon, Overlay } from 'react-bootstrap';

import { DataFormatter } from '../../../utilities';
import { IAccount } from '../../../interfaces/budgetEntities';
import { AccountTypes, AccountTypeNames } from '../../../constants';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PAccountEditDialogProps {
	dataFormatter:DataFormatter;
	showAccountClosingDialog:(account:IAccount)=>void;
	entitiesCollection:IEntitiesCollection;
	// Dispatcher method from CSidebar for updating the account
	updateAccount:(account:IAccount, currentBalance:number)=>void;
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PAccountEditDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	account:IAccount;
	accountName:string;
	accountNote:string;
	accountBalance:number;
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

const FormControlStyle = {
	borderColor: '#2FA2B5',
	borderTopWidth: '2px',
	borderBottomWidth: '2px',
	borderLeftWidth: '2px',
	borderRightWidth: '2px',
}

const FormControlErrorStyle = Object.assign({}, FormControlStyle, {
	borderBottomLeftRadius: "0px",
	borderBottomRightRadius: "0px"
});

const ErrorMessageStyle = {
	width: "100%",
	color: "#FFFFFF",
	backgroundColor: "#D33C2D",
	fontSize: "12px",
	fontWeight: "normal",
	borderTopLeftRadius: "0px",
	borderTopRightRadius: "0px",
	borderBottomLeftRadius: "3px",
	borderBottomRightRadius: "3px",
	paddingLeft: "8px",
	paddingRight: "8px",
	paddingTop: "3px",
	paddingBottom: "3px"
}

export class PAccountEditDialog extends React.Component<PAccountEditDialogProps, PAccountEditDialogState> {
  
	constructor(props: any) {
        super(props);
		this.onAccountNameChange = this.onAccountNameChange.bind(this);
		this.onAccountNoteChange = this.onAccountNoteChange.bind(this);
		this.onAccountBalanceChange = this.onAccountBalanceChange.bind(this);
		this.handleOk = this.handleOk.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.handleCloseAccount = this.handleCloseAccount.bind(this);
		this.handleDeleteAccount = this.handleDeleteAccount.bind(this);
		this.handleReopenAccount = this.handleReopenAccount.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"right",
			account: null,
			accountName: null,
			accountNote: null,
			accountBalance: 0
		};
	}

	private onAccountNameChange(event:React.SyntheticEvent):void {

		var state = Object.assign({}, this.state);
		state.accountName = (event.target as HTMLInputElement).value;
		this.setState(state);
	}

	private onAccountNoteChange(event:React.SyntheticEvent):void {

		var state = Object.assign({}, this.state);
		state.accountNote = (event.target as HTMLInputElement).value;
		this.setState(state);
	}

	private onAccountBalanceChange(event:React.SyntheticEvent):void {

		if(this.state.account.closed == 0) {
			var updatedBalance = this.props.dataFormatter.unformatCurrency((event.target as HTMLInputElement).value);
			var state = Object.assign({}, this.state);
			state.accountBalance = updatedBalance;
			this.setState(state);
		}
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
		state.accountName = account.accountName;
		state.accountBalance = account.clearedBalance + account.unclearedBalance;
		state.accountNote = account.note ? account.note : "";		
		this.setState(state);
	}

	public hide():void {
		var state = _.assign({}, this.state) as PAccountEditDialogState;
		state.show = false;
		this.setState(state);
	}

	private handleOk() {

		// If the user has changed any of the account properties, then call updateAccount
		var account:IAccount = this.state.account;
		if(
			account.accountName !== this.state.accountName ||
			account.note !== this.state.accountNote ||
			account.clearedBalance + account.unclearedBalance !== this.state.accountBalance 
		) {
			// Create a copy of the account entity, update the values in it and call the update method with it
			var updatedAccount = Object.assign({}, account) as IAccount;
			updatedAccount.accountName = this.state.accountName;
			updatedAccount.note = this.state.accountNote;
			this.props.updateAccount(updatedAccount, this.state.accountBalance);			 
		}

		// Hide the popover		
		this.hide();
	}

	private handleCancel() {

		// Hide the popover for editing the account		
		this.hide();
	}

	private handleCloseAccount() {

		var account = this.state.account;
		// If the account's current balance is zero, we can close it immediately
		if(account.clearedBalance + account.unclearedBalance == 0) {
			// Set the closed flag on the account and send it for update
			var updatedAccount = _.assign({}, account) as IAccount;
			updatedAccount.closed = 1;
			this.props.updateEntities({
				accounts: [updatedAccount]
			});			 
		}
		else {
			// We have balance in the account that needs to be reassigned. Show the account closing dialog.
			this.props.showAccountClosingDialog(account);
		}

		// Hide the popover for editing the account		
		this.hide();
	}

	private handleDeleteAccount() {

		var account = this.state.account;
		// Set the tombstone flag on the account and send it for update
		var updatedAccount = _.assign({}, account) as IAccount;
		updatedAccount.isTombstone = 1;
		this.props.updateEntities({
			accounts: [updatedAccount]
		});			 

		// Hide the popover for editing the account		
		this.hide();
	}

	private handleReopenAccount() {

		var account = this.state.account;
		// Set the closed flag on the account to false and send it for update
		var updatedAccount = _.assign({}, account) as IAccount;
		updatedAccount.closed = 0;
		this.props.updateEntities({
			accounts: [updatedAccount]
		});			 

		// Hide the popover for editing the account		
		this.hide();
	}

	private getActionButtons():Array<JSX.Element> {

		var account = this.state.account;

		// If the account is open, just show the close account button
		if(account.closed == 0) {
			return [
				<Button key="close-account-button" className="dialog-warning-button" onClick={this.handleCloseAccount}>
					<Glyphicon glyph="minus-sign" />&nbsp;Close Account
				</Button>
			];
		}
		else {
			// Else show the reopen account and delete account buttons
			// The delete account button is to enabled only if there are no transactions in the account
			var transactionCount = this.props.entitiesCollection.transactions.getTransactionsByAccountId(account.entityId).length;

			var buttons = [
				<Button key="reopen-account-button" className="dialog-secondary-button" onClick={this.handleReopenAccount}>
					<Glyphicon glyph="plus-sign" />&nbsp;Reopen
				</Button>
			];

			if(transactionCount > 0) {
				buttons = buttons.concat([
					<div key="space" style={{width: '8px'}} />,
					<Button key="delete-account-button" disabled={true} className="dialog-warning-button-disabled">
						<Glyphicon glyph="minus-sign" />&nbsp;Delete
					</Button>
				]);
			}
			else {
				var tooltip = "If you want to delete this account, first delete all of the transactions in it and transfers pointing to it. Be cautious, as this will potentially change your budget values.";
				buttons = buttons.concat([
					<div key="space" style={{width: '8px'}} />,
					<div title={tooltip}>
						<Button key="delete-account-button" className="dialog-warning-button" onClick={this.handleDeleteAccount}>
							<Glyphicon glyph="minus-sign" />&nbsp;Delete
						</Button>
					</div>
				]);
			}

			return buttons;
		}
	}

  	public render() {

		if(this.state.show) {
			var account = this.state.account;
			var dataFormatter = this.props.dataFormatter;
			var actionButtons = this.getActionButtons();

			return (
				<Overlay show={this.state.show} placement={this.state.placement} 
					rootClose={true} onHide={this.handleCancel} 
					target={()=> ReactDOM.findDOMNode(this.state.target)}>
					<Popover id="editAccountPopover" style={PopoverStyle}>
						<Form>
							<FormGroup>
								<FormControl componentClass="input" type="text" value={this.state.accountName} onChange={this.onAccountNameChange} style={FormControlStyle} />
							</FormGroup>
							<FormGroup>
								<FormControl componentClass="textarea" placeholder="Enter a note (not your account number)..." value={this.state.accountNote} onChange={this.onAccountNoteChange} style={FormControlStyle} />
							</FormGroup>
							<FormGroup>
								<ControlLabel>Today's Balance:</ControlLabel>
								<FormControl type="text" value={dataFormatter.formatCurrency(this.state.accountBalance)} onChange={this.onAccountBalanceChange} style={FormControlStyle} />
								<HelpBlock>An adjustment transaction will be created automatically if you change this amount.</HelpBlock>
							</FormGroup>
							<FormGroup>
								<ControlLabel>Last Reconciliation Date:</ControlLabel>
								<FormControl componentClass="input" type="text" readOnly={true} value={account.lastReconciledDate ? dataFormatter.formatDate(account.lastReconciledDate) : ""} style={FormControlStyle} />
							</FormGroup>
							<FormGroup>
								<ControlLabel>Last Reconciled Balance:</ControlLabel>
								<FormControl componentClass="input" type="text" readOnly={true} value={account.lastReconciledBalance ? dataFormatter.formatCurrency(account.lastReconciledBalance) : ""} style={FormControlStyle} />
							</FormGroup>
						</Form>
						<div className="buttons-container">
							{actionButtons}
							<div className="spacer" />
							<Button className="dialog-secondary-button" onClick={this.handleCancel}>
								Cancel&nbsp;<Glyphicon glyph="remove-sign" />
							</Button>
							<div style={{width: '8px'}} />
							<Button className="dialog-primary-button" onClick={this.handleOk}>
								OK&nbsp;<Glyphicon glyph="ok-sign" />
							</Button>
						</div>
					</Popover>
				</Overlay>
			);
		}
		else {
			return <div />;
		}
  	}
}