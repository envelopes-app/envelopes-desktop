import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Modal, Form, FormGroup, FormControl, ControlLabel, Glyphicon } from 'react-bootstrap';

import { IAccount } from '../../interfaces/budgetEntities';
import { AccountTypes, AccountTypeNames } from '../../constants';

export interface PAccountCreationDialogProps { 
	onAddAccount: (account:IAccount, currentBalance:number)=>void;
}

export class PAccountCreationDialog extends React.Component<PAccountCreationDialogProps, {showModal:boolean, account?:IAccount}> {

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
			<Modal show={this.state.showModal} onHide={this.close} backdrop="static" keyboard={false}>
				<Modal.Header bsClass="modal-header">
					<Modal.Title>Add a New Account</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<FormGroup>
							<ControlLabel>Account Name:</ControlLabel>
							<FormControl ref={(c)=> {this.ctrlAccountName = c;}} type="text" placeholder="New Account" />
						</FormGroup>
						<FormGroup>
							<ControlLabel>Account Type:</ControlLabel>
							<FormControl ref={(c)=> {this.ctrlAccountType = c;}} componentClass="select">
								<option>Select an Account Type...</option>
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
						<FormGroup>
							<ControlLabel>Today's Balance:</ControlLabel>
							<FormControl ref={(c)=> {this.ctrlAccountBalance = c;}} type="text" placeholder="What is the balance of this account right now?"/>
						</FormGroup>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.close}>
						Cancel&nbsp;<Glyphicon glyph="remove-circle" />
					</Button>
					<Button onClick={this.save}>
						Add Account&nbsp;<Glyphicon glyph="ok-circle" />
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
