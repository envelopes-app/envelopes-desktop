/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Modal, Form, FormGroup, FormControl, ControlLabel, Glyphicon } from 'react-bootstrap';

import { EntityFactory } from '../../../persistence';
import { DataFormatter, DateWithoutTime } from '../../../utilities';
import { IAccount } from '../../../interfaces/budgetEntities';
import { AccountTypes, AccountTypeNames } from '../../../constants';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PAccountClosingDialogProps { 
	dataFormatter:DataFormatter;
	entitiesCollection:IEntitiesCollection;
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PAccountClosingDialogState {
	show:boolean;
	account:IAccount;
}

const MessageStyle = {
	fontSize: "14px"
}

export class PAccountClosingDialog extends React.Component<PAccountClosingDialogProps, PAccountClosingDialogState> {

	private ctrlAccountSelection:FormControl;

	constructor(props: any) {
        super(props);
        this.state = { show: false, account: null };
		this.show = this.show.bind(this);
		this.transfer = this.transfer.bind(this);
		this.hide = this.hide.bind(this);
    }

	private onAccountBalanceChange() {}
	private onAccountSelectionChange() {}

	private hide():void {
		// Hide the modal, and set the account in state to null
		this.setState({ show: false, account: null });
	};

	private transfer():void {

		var account = this.state.account;
		var payee = this.props.entitiesCollection.payees.getPayeeByAccountId(account.entityId);

		var transferAccountId = (ReactDOM.findDOMNode(this.ctrlAccountSelection) as HTMLInputElement).value;
		var transferAccount = this.props.entitiesCollection.accounts.getEntityById(transferAccountId);
		var transferPayee = this.props.entitiesCollection.payees.getPayeeByAccountId(transferAccountId);
		var currentDate = DateWithoutTime.createForToday();

		// Set the closed flag on the account
		var updatedAccount = Object.assign({}, account);
		updatedAccount.closed = 1;

		// Create a transfer transaction from this account to the selected account 
		var transaction = EntityFactory.createNewTransaction();
		var otherSideTransaction = EntityFactory.createNewTransaction();

		transaction.accountId = account.entityId;
		transaction.payeeId = transferPayee.entityId;
		transaction.date = currentDate.getUTCTime();
		transaction.amount = -(account.clearedBalance + account.unclearedBalance);
		transaction.transferAccountId = transferAccountId;
		transaction.transferTransactionId = otherSideTransaction.entityId;

		otherSideTransaction.accountId = transferAccount.entityId;
		otherSideTransaction.payeeId = payee.entityId;
		otherSideTransaction.date = currentDate.getUTCTime();
		otherSideTransaction.amount = account.clearedBalance + account.unclearedBalance;
		otherSideTransaction.transferAccountId = account.entityId;
		otherSideTransaction.transferTransactionId = transaction.entityId;
		
		this.props.updateEntities({
			accounts: [updatedAccount],
			transactions: [transaction, otherSideTransaction]
		});

		// Close the modal dialog
		this.hide();
	}

	public show(account:IAccount):void {
		this.setState({ 
			show: true, 
			account: account 
		});
	};

	public render() {

		if(this.state.show) {
			var account = this.state.account;
			var accountBalance = account.clearedBalance + account.unclearedBalance;
			var dataFormatter = this.props.dataFormatter;
			var message = `Before you can close this account you'll need to transfer the remaining ${dataFormatter.formatCurrency(accountBalance)} to another account. Select the account that you want to transfer the balance to below.`;

			var budgetAccountOptions:Array<JSX.Element> = [];
			var trackingAccountOptions:Array<JSX.Element> = [];
			_.forEach(this.props.entitiesCollection.accounts.getAllItems(), (accountEntity)=>{

				if(accountEntity.isTombstone == 0 && accountEntity.closed == 0 && 
					account.entityId != accountEntity.entityId) {

					if(accountEntity.onBudget == 1) {
						budgetAccountOptions.push(
							<option key={accountEntity.entityId} value={accountEntity.entityId}>{accountEntity.accountName}</option>
						);
					}
					else {
						trackingAccountOptions.push(
							<option key={accountEntity.entityId} value={accountEntity.entityId}>{accountEntity.accountName}</option>
						);
					}
				}
			});

			return (
				<Modal show={this.state.show} animation={true} onHide={this.hide} backdrop="static" keyboard={false} dialogClassName="close-account-dialog">
					<Modal.Header bsClass="modal-header">
						<Modal.Title>Close Account</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form>
							<div style={MessageStyle}>
								{message}
							</div>
							<br />
							<FormGroup>
								<ControlLabel>Transfer Funds:</ControlLabel>
								<FormControl value={dataFormatter.formatCurrency(accountBalance)} contentEditable={false} onChange={this.onAccountBalanceChange} />
							</FormGroup>
							<FormGroup>
								<ControlLabel>To:</ControlLabel>
								<FormControl ref={(c)=> { this.ctrlAccountSelection = c; }} componentClass="select" onChange={this.onAccountSelectionChange}>
									<optgroup label="Budget">
										{budgetAccountOptions}
									</optgroup>
									<optgroup label="Tracking">
										{trackingAccountOptions}
									</optgroup>
								</FormControl>
							</FormGroup>
						</Form>
					</Modal.Body>
					<Modal.Footer>
						<Button className="dialog-secondary-button" onClick={this.hide}>
							Cancel&nbsp;<Glyphicon glyph="remove-sign" />
						</Button>
						<Button className="dialog-primary-button" onClick={this.transfer}>
							Transfer Funds&nbsp;<Glyphicon glyph="ok-sign" />
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
