/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Modal, Form, FormGroup, FormControl, ControlLabel, Glyphicon } from 'react-bootstrap';

import { DataFormatter } from '../../../utilities';
import { EntityFactory } from '../../../persistence';
import { IAccount } from '../../../interfaces/budgetEntities';
import { AccountTypes, AccountTypeNames } from '../../../constants';
import { IEntitiesCollection } from '../../../interfaces/state';

export interface PAccountCreationDialogProps { 
	dataFormatter:DataFormatter;
	entitiesCollection:IEntitiesCollection;
	addAccount: (account:IAccount, currentBalance:number)=>void;
}

export interface PAccountCreationDialogState {
	showModal:boolean;
	account:IAccount;
	accountName:string;
	accountType:string;
	accountBalance:string;
	nameValidationState:string;
	nameValidationMessage:string;
	typeValidationState:string;
	typeValidationMessage:string;
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

const FormSelectControlErrorStyle = Object.assign({}, FormControlStyle, {
	borderColor: '#D33C2D',
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

export class PAccountCreationDialog extends React.Component<PAccountCreationDialogProps, PAccountCreationDialogState> {

	constructor(props: any) {
        super(props);
		this.show = this.show.bind(this);
		this.save = this.save.bind(this);
		this.close = this.close.bind(this);
		this.onAccountNameChange = this.onAccountNameChange.bind(this);
		this.onAccountTypeChange = this.onAccountTypeChange.bind(this);
		this.onAccountBalanceChange = this.onAccountBalanceChange.bind(this);
        this.state = { 
			showModal: false, 
			account: null,
			accountName: null,
			accountType: null,
			accountBalance: null,
			nameValidationState: null,
			nameValidationMessage: null,
			typeValidationState: null,
			typeValidationMessage: null
		};
    }

	private onAccountNameChange(event:React.SyntheticEvent):void {

		var updatedName = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state);
		state.accountName = updatedName;
		this.setState(state);
	}

	private onAccountTypeChange(event:React.SyntheticEvent):void {

		var updatedType = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state);
		state.accountType = updatedType;
		this.setState(state);
	}

	private onAccountBalanceChange(event:React.SyntheticEvent):void {

		var updatedBalance = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state);
		state.accountBalance = updatedBalance;
		this.setState(state);
	}

	private close():void {
		// Hide the modal, and set the account in state to null
		this.setState({ 
			showModal: false, 
			account: null, 
			accountName: null,
			accountType: null,
			accountBalance: null,
			nameValidationState: null,
			nameValidationMessage: null,
			typeValidationState: null,
			typeValidationMessage: null
		});
	};

	private validateInput():boolean {

		var nameValidated:boolean = true;
		var newAccount:IAccount = this.state.account;
		let state = Object.assign({}, this.state);

		if(this.state.accountName == "") {

			nameValidated = false;
			state.nameValidationState = 'error';
			state.nameValidationMessage = 'The account name is required.';
		}
		else {
			_.forEach(this.props.entitiesCollection.accounts.getAllItems(), (account)=>{

				if(this.state.accountName == account.accountName && account.isTombstone == 0) {

					nameValidated = false;
					state.nameValidationState = 'error';
					state.nameValidationMessage = 'This account name already exists.';
					return false;
				}
			});
		}

		if(nameValidated == true && this.state.nameValidationState == 'error') {
			state.nameValidationState = null;
			state.nameValidationMessage = null;
		}

		var typeValidated:boolean = true;
		if(this.state.accountType == AccountTypes.None) {
			typeValidated = false;
			state.typeValidationState = 'error';
			state.typeValidationMessage = 'The account type is required.';
		}

		if(typeValidated == true && this.state.typeValidationState == 'error') {
			state.typeValidationState = null;
			state.typeValidationMessage = null;
		}

		this.setState(state);
		return (nameValidated && typeValidated);
	}

	private save():void {

		var validated = this.validateInput();
		if(validated) {

			var account:IAccount = this.state.account;
			// Update the account entity values from the form controls
			account.accountName = this.state.accountName;
			account.accountType = this.state.accountType;
			account.sortableIndex = this.props.entitiesCollection.accounts.getSortableIndexForNewAccount();

			var currentBalance:number = 0;
			if(this.state.accountBalance != "")
				currentBalance = this.props.dataFormatter.unformatCurrency(this.state.accountBalance);

			// Call the addAccount method to create the account entity
			this.props.addAccount(account, currentBalance);
			// Close the modal dialog
			this.close();
		}
	}

	public isShowing():boolean {
		return this.state.showModal;
	}

	public show():void {

		// Create a new account entity and set it in the state
		var account = EntityFactory.createNewAccount();
		this.setState({ 
			showModal: true, 
			account: account, 
			accountName: "",
			accountType: AccountTypes.None,
			accountBalance: "",
			nameValidationState: null,
			nameValidationMessage: null,
			typeValidationState: null,
			typeValidationMessage: null 
		});
	};

	private getAccountNameControl():JSX.Element {

		var element:JSX.Element;
		if(this.state.nameValidationState == "error") {
			element = (
				<FormGroup>
					<ControlLabel>Account Name:</ControlLabel>
					<FormControl style={FormControlErrorStyle} type="text" placeholder="New Account" value={this.state.accountName} onChange={this.onAccountNameChange} />
					<label style={ErrorMessageStyle}>{this.state.nameValidationMessage}</label>
				</FormGroup>
			);
		}
		else {
			element = (
				<FormGroup>
					<ControlLabel>Account Name:</ControlLabel>
					<FormControl style={FormControlStyle} type="text" placeholder="New Account" value={this.state.accountName} onChange={this.onAccountNameChange} />
				</FormGroup>
			);
		}

		return element;
	}

	private getAccountTypeControl():JSX.Element {
		
		var element:JSX.Element;
		if(this.state.typeValidationState == "error") {
			element = (
				<FormGroup>
					<ControlLabel>Account Type:</ControlLabel>
					<FormControl componentClass="select" style={FormSelectControlErrorStyle} value={this.state.accountType} onChange={this.onAccountTypeChange}>
						<option label="Select an Account Type...">{AccountTypes.None}</option>
						<optgroup label="Budget">
							<option label={AccountTypeNames.Checking}>{AccountTypes.Checking}</option>
							<option label={AccountTypeNames.Savings}>{AccountTypes.Savings}</option>
							<option label={AccountTypeNames.CreditCard}>{AccountTypes.CreditCard}</option>
							<option label={AccountTypeNames.Cash}>{AccountTypes.Cash}</option>
							<option label={AccountTypeNames.LineOfCredit}>{AccountTypes.LineOfCredit}</option>
							<option label={AccountTypeNames.PayPal}>{AccountTypes.PayPal}</option>
							<option label={AccountTypeNames.MerchantAccount}>{AccountTypes.MerchantAccount}</option>
						</optgroup>
						<optgroup label="Tracking">
							<option label={AccountTypeNames.InvestmentAccount}>{AccountTypes.InvestmentAccount}</option>
							<option label={AccountTypeNames.Mortgage}>{AccountTypes.Mortgage}</option>
							<option label={AccountTypeNames.OtherAsset}>{AccountTypes.OtherAsset}</option>
							<option label={AccountTypeNames.OtherLiability}>{AccountTypes.OtherLiability}</option>
						</optgroup>
					</FormControl>
				</FormGroup>
			);
		}
		else {
			element = (
				<FormGroup>
					<ControlLabel>Account Type:</ControlLabel>
					<FormControl componentClass="select" style={FormControlStyle} value={this.state.accountType} onChange={this.onAccountTypeChange}>
						<option label="Select an Account Type...">{AccountTypes.None}</option>
						<optgroup label="Budget">
							<option label={AccountTypeNames.Checking}>{AccountTypes.Checking}</option>
							<option label={AccountTypeNames.Savings}>{AccountTypes.Savings}</option>
							<option label={AccountTypeNames.CreditCard}>{AccountTypes.CreditCard}</option>
							<option label={AccountTypeNames.Cash}>{AccountTypes.Cash}</option>
							<option label={AccountTypeNames.LineOfCredit}>{AccountTypes.LineOfCredit}</option>
							<option label={AccountTypeNames.PayPal}>{AccountTypes.PayPal}</option>
							<option label={AccountTypeNames.MerchantAccount}>{AccountTypes.MerchantAccount}</option>
						</optgroup>
						<optgroup label="Tracking">
							<option label={AccountTypeNames.InvestmentAccount}>{AccountTypes.InvestmentAccount}</option>
							<option label={AccountTypeNames.Mortgage}>{AccountTypes.Mortgage}</option>
							<option label={AccountTypeNames.OtherAsset}>{AccountTypes.OtherAsset}</option>
							<option label={AccountTypeNames.OtherLiability}>{AccountTypes.OtherLiability}</option>
						</optgroup>
					</FormControl>
				</FormGroup>
			);
		}

		return element;
	}

	private getAccountBalanceControl():JSX.Element {

		var element:JSX.Element;
		element = (
			<FormGroup>
				<ControlLabel>Today's Balance:</ControlLabel>
				<FormControl type="text" style={FormControlStyle} placeholder="What is the balance of this account right now?" value={this.state.accountBalance} onChange={this.onAccountBalanceChange} />
			</FormGroup>
		);

		return element;
	}

	public render() {

		if(this.state.showModal) {

			var accountNameControl = this.getAccountNameControl();
			var accountTypeControl = this.getAccountTypeControl();
			var accountBalanceControl = this.getAccountBalanceControl();

			return (
				<Modal show={this.state.showModal} animation={true} onHide={this.close} backdrop="static" keyboard={false} dialogClassName="add-account-dialog">
					<Modal.Header bsClass="modal-header">
						<Modal.Title>Add a New Account</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form>
							{accountNameControl}
							{accountTypeControl}
							{accountBalanceControl}
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
		else {
			return <div />;
		}
	}
}
