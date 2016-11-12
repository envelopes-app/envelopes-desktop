/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, FormControl, Modal, Glyphicon } from 'react-bootstrap';

import { DialogUtilities } from '../../../utilities';
import * as objects from '../../../interfaces/objects';
import { ITransaction, IScheduledTransaction } from '../../../interfaces/budgetEntities';
import { IRegisterState, IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PMoveToAccountDialogProps {
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PMoveToAccountDialogState {
	showModal:boolean;
	registerState:IRegisterState;
	selectedAccountId:string;
	accountsList:Array<objects.IAccountObject>;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'200px'
}

export class PMoveToAccountDialog extends React.Component<PMoveToAccountDialogProps, PMoveToAccountDialogState> {

	constructor(props: any) {
        super(props);
		this.hide = this.hide.bind(this);
		this.handleOkClicked = this.handleOkClicked.bind(this);
		this.state = {
			showModal:false, 
			registerState:null,
			selectedAccountId:null,
			accountsList:null
		};
	}

	private setSelectedAccountId(accountId:string) {

		// This method is called when the user selects an item from the popover using mouse click
		if(this.state.selectedAccountId != accountId) {
			var state = Object.assign({}, this.state);
			state.selectedAccountId = accountId;
			this.setState(state);
		}
	}

	public isShowing():boolean {
		return this.state.showModal;
	}
	
	public show(registerState:IRegisterState):void {

		// Get the subCategory for the passed subCategoryId
		var state = Object.assign({}, this.state) as PMoveToAccountDialogState;
		state.showModal = true;
		state.registerState = registerState;
		state.accountsList = DialogUtilities.buildAccountsList(this.props.entitiesCollection);
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PMoveToAccountDialogState;
		state.showModal = false;
		state.registerState = null;
		state.selectedAccountId = null;
		this.setState(state);
	}

	private handleOkClicked():void {

		if(!this.state.selectedAccountId)
			return;

		// Get all the selected transactions from the registerState and set their accounts
		// equal to te selected account id.
		// Don't move transfer transactions if they are transferring to the target account
		var changedEntities:ISimpleEntitiesCollection = {
			transactions:[],
			scheduledTransactions: []
		};

		var transactionsArray = this.props.entitiesCollection.transactions;
		var scheduledTransactionsArray = this.props.entitiesCollection.scheduledTransactions;
		var selectedTransactionIds = this.state.registerState.selectedTransactions;

		_.forEach(selectedTransactionIds, (transactionId)=>{

			var transaction = transactionsArray.getEntityById(transactionId);
			if(transaction && transaction.transferAccountId != this.state.selectedAccountId) {
				var updatedTransaction = Object.assign({}, transaction);
				updatedTransaction.accountId = this.state.selectedAccountId;
				changedEntities.transactions.push(updatedTransaction);
			}
			else {
				var scheduledTransaction = scheduledTransactionsArray.getEntityById(transactionId);
				if(scheduledTransaction && scheduledTransaction.transferAccountId != this.state.selectedAccountId) {
					var updatedScheduledTransaction = Object.assign({}, scheduledTransaction);
					updatedScheduledTransaction.accountId = this.state.selectedAccountId;
					changedEntities.scheduledTransactions.push(updatedScheduledTransaction);
				}
			}
		});

		this.props.updateEntities(changedEntities);
		this.hide();
	}

	private getAccountsDisplayList():JSX.Element {

		var accountsItem;
		var accountsItems = [];

		// Get the currently selected account so that we can highlight the corresponding item
		var accounts = this.state.accountsList;
		var selectedAccountId = this.state.selectedAccountId;
		var selectedAccount = _.find(accounts, {entityId: selectedAccountId});

		_.forEach(accounts, (account)=>{
			var className = (selectedAccountId && selectedAccountId == account.entityId) ? "custom-dropdown-list-item-selected" : "custom-dropdown-list-item"; 
			accountsItem = <li key={account.entityId} className={className} id={account.entityId} onClick={this.setSelectedAccountId.bind(this, account.entityId)}>{account.name}</li>;
			accountsItems.push(accountsItem);
		});

		return (
			<ul className="custom-dropdown-list">
				{accountsItems}
			</ul>
		);
	}

	public render() {

		if(this.state.showModal) {

			var accountsList = this.getAccountsDisplayList();
			var selectedAccountName = "";
			if(this.state.selectedAccountId) {
				_.forEach(this.state.accountsList, (accountObject)=>{

					if(accountObject.entityId == this.state.selectedAccountId) {
						selectedAccountName = accountObject.name;
						return false;
					}
				});
			}

			return (
				<Modal show={this.state.showModal} animation={false} onHide={this.hide} keyboard={false} dialogClassName="bulk-categorize-dialog">
					<Modal.Header className="modal-header">
						<Modal.Title>Move transactions to</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<FormControl type="text" componentClass="input"  
							readOnly={true} value={selectedAccountName} />
						<div style={{height:"5px"}} />
						{accountsList}
					</Modal.Body>
					<Modal.Footer>
						<Button className="dialog-secondary-button" onClick={this.hide}>
							Cancel&nbsp;<Glyphicon glyph="remove-sign" />
						</Button>
						<Button className="dialog-primary-button" onClick={this.handleOkClicked}>
							OK&nbsp;<Glyphicon glyph="ok-sign" />
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
