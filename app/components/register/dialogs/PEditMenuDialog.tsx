/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { ClearedFlag } from '../../../constants';
import { ITransaction, IScheduledTransaction } from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PEditMenuDialogProps {
	entitiesCollection:IEntitiesCollection;

	showBulkCategorizeDialog:()=>void;
	showMoveToAccountDialog:()=>void;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PEditMenuDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	selectedTransactionIds:Array<string>;
	enableClearUnclearMenus:boolean;
	enableApproveRejectMenus:boolean;
	enableMoveToAccountMenu:boolean;
}

const PopoverStyle = {
	maxWidth: 'none',
	width:'220px',
	display: "flex",
	flexFlow: "column nowrap",
	alignItems: "stretch"
}

export class PEditMenuDialog extends React.Component<PEditMenuDialogProps, PEditMenuDialogState> {

	constructor(props: any) {
        super(props);
		this.hide = this.hide.bind(this);
		this.clearSelectedTransactions = this.clearSelectedTransactions.bind(this);
		this.unclearSelectedTransactions = this.unclearSelectedTransactions.bind(this);
		this.approveSelectedTransactions = this.approveSelectedTransactions.bind(this);
		this.rejectSelectedTransactions = this.rejectSelectedTransactions.bind(this);
		this.deleteSelectedTransactions = this.deleteSelectedTransactions.bind(this);
		this.showBulkCategorizeDialog = this.showBulkCategorizeDialog.bind(this);
		this.showMoveToAccountDialog = this.showMoveToAccountDialog.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"bottom",
			selectedTransactionIds:null,
			enableClearUnclearMenus:false,
			enableApproveRejectMenus:false,
			enableMoveToAccountMenu:false
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}
	
	public show(selectedTransactionIds:Array<string>, target:HTMLElement, placement:string = "bottom"):void {

		// Get the subCategory for the passed subCategoryId
		var state = Object.assign({}, this.state) as PEditMenuDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		state.selectedTransactionIds = selectedTransactionIds;
		state.enableApproveRejectMenus = this.getEnableApproveRejectMenus(selectedTransactionIds);
		state.enableClearUnclearMenus = this.getEnableClearUnclearMenus(selectedTransactionIds);
		state.enableMoveToAccountMenu = this.getEnableMoveToAccountMenu();
		state.enableMoveToAccountMenu = this.getEnableMoveToAccountMenu();
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PEditMenuDialogState;
		state.show = false;
		state.selectedTransactionIds = null; 
		state.enableApproveRejectMenus = false; 
		state.enableClearUnclearMenus = false; 
		state.enableMoveToAccountMenu = false; 
		this.setState(state);
	}

	private getEnableApproveRejectMenus(selectedTransactionIds:Array<string>):boolean {

		var retVal = false;
		// In order to enable the approve/reject menu, we should have atleast one Transaction
		// within the selected transactions that has it's accepted flag set to false
		var entitiesCollection = this.props.entitiesCollection;
		_.forEach(selectedTransactionIds, (transactionId)=>{

			var transaction = entitiesCollection.transactions.getEntityById(transactionId);
			if(transaction && transaction.accepted == 0) {
				retVal = true;
				return false;
			}
		});

		return retVal;
	}

	private getEnableClearUnclearMenus(selectedTransactionIds:Array<string>):boolean {

		var retVal = false;
		// In order to enable the clear/Unclear menu, we should have atleast one Transaction
		// within the selected transactions.
		// Note: The selectedTransactionIds contains ids for both transactions and scheduled transactions.
		// So we are looking for atleast one id that belongs to a transaction.
		var entitiesCollection = this.props.entitiesCollection;
		_.forEach(selectedTransactionIds, (transactionId)=>{

			var transaction = entitiesCollection.transactions.getEntityById(transactionId);
			if(transaction) {
				retVal = true;
				return false;
			}
		});

		return retVal;
	}

	private getEnableMoveToAccountMenu():boolean {

		var retVal = false;
		// In order to enable the move to account menu, we should have more then one account in the budget
		var entitiesCollection = this.props.entitiesCollection;
		var accounts = entitiesCollection.accounts.getNonTombstonedOpenAccounts();
		return (accounts.length > 1);
	}

	private clearSelectedTransactions():void {

		var changedEntities:ISimpleEntitiesCollection = {
			transactions: []
		};

		var entitiesCollection = this.props.entitiesCollection;
		var selectedTransactionIds = this.state.selectedTransactionIds;
		_.forEach(selectedTransactionIds, (transactionId)=>{

			var transaction = entitiesCollection.transactions.getEntityById(transactionId);
			if(transaction && transaction.cleared == ClearedFlag.Uncleared) {
				var updatedTransaction = Object.assign({}, transaction);
				updatedTransaction.accepted = 1;
				updatedTransaction.cleared = ClearedFlag.Cleared;
				changedEntities.transactions.push(updatedTransaction);
			}
		});

		if(changedEntities.transactions.length > 0) {
			this.props.updateEntities(changedEntities);
		}

		this.hide();
	}

	private unclearSelectedTransactions():void {

		var changedEntities:ISimpleEntitiesCollection = {
			transactions: []
		};

		var entitiesCollection = this.props.entitiesCollection;
		var selectedTransactionIds = this.state.selectedTransactionIds;
		_.forEach(selectedTransactionIds, (transactionId)=>{

			var transaction = entitiesCollection.transactions.getEntityById(transactionId);
			if(transaction && transaction.cleared == ClearedFlag.Cleared) {
				var updatedTransaction = Object.assign({}, transaction);
				updatedTransaction.cleared = ClearedFlag.Uncleared;
				changedEntities.transactions.push(updatedTransaction);
			}
		});

		if(changedEntities.transactions.length > 0) {
			this.props.updateEntities(changedEntities);
		}

		this.hide();
	}

	private approveSelectedTransactions():void {

		var changedEntities:ISimpleEntitiesCollection = {
			transactions: []
		};

		var entitiesCollection = this.props.entitiesCollection;
		var selectedTransactionIds = this.state.selectedTransactionIds;
		_.forEach(selectedTransactionIds, (transactionId)=>{

			var transaction = entitiesCollection.transactions.getEntityById(transactionId);
			if(transaction && transaction.accepted == 0) {
				var updatedTransaction = Object.assign({}, transaction);
				updatedTransaction.accepted = 1;
				changedEntities.transactions.push(updatedTransaction);
			}
		});

		if(changedEntities.transactions.length > 0) {
			this.props.updateEntities(changedEntities);
		}

		this.hide();
	}

	private rejectSelectedTransactions():void {

		var changedEntities:ISimpleEntitiesCollection = {
			transactions: []
		};

		var entitiesCollection = this.props.entitiesCollection;
		var selectedTransactionIds = this.state.selectedTransactionIds;
		_.forEach(selectedTransactionIds, (transactionId)=>{

			var transaction = entitiesCollection.transactions.getEntityById(transactionId);
			if(transaction && transaction.accepted == 0) {
				var updatedTransaction = Object.assign({}, transaction);
				updatedTransaction.isTombstone = 1;
				changedEntities.transactions.push(updatedTransaction);
			}
		});

		if(changedEntities.transactions.length > 0) {
			this.props.updateEntities(changedEntities);
		}

		this.hide();
	}

	private deleteSelectedTransactions():void {

		var changedEntities:ISimpleEntitiesCollection = {
			transactions: [],
			scheduledTransactions: []
		};

		var entitiesCollection = this.props.entitiesCollection;
		var selectedTransactionIds = this.state.selectedTransactionIds;
		_.forEach(selectedTransactionIds, (transactionId)=>{

			var transaction = entitiesCollection.transactions.getEntityById(transactionId);
			if(transaction) {
				var updatedTransaction = Object.assign({}, transaction);
				updatedTransaction.isTombstone = 1;
				changedEntities.transactions.push(updatedTransaction);
			}
			else {
				var scheduledTransaction = entitiesCollection.scheduledTransactions.getEntityById(transactionId);
				if(scheduledTransaction) {
					var updatedScheduledTransaction = Object.assign({}, scheduledTransaction);
					updatedScheduledTransaction.isTombstone = 1;
					changedEntities.scheduledTransactions.push(updatedScheduledTransaction);
				}
			}
		});

		if(changedEntities.transactions.length > 0 || changedEntities.scheduledTransactions.length > 0) {
			this.props.updateEntities(changedEntities);
		}

		this.hide();
	}
	
	public showBulkCategorizeDialog():void {

		this.hide();
		this.props.showBulkCategorizeDialog();
	}

	public showMoveToAccountDialog():void {

		this.hide();
		this.props.showMoveToAccountDialog();
	}

	public render() {

		if(this.state.show) {

			return (
				<Overlay key="overlay" rootClose={true} show={this.state.show} placement={this.state.placement} 
					onHide={this.hide} target={ ()=> ReactDOM.findDOMNode(this.state.target) }>
					<Popover id="editMenuPopover" style={PopoverStyle}>
						<div className={this.state.enableClearUnclearMenus ? "menu-item" : "menu-item-disabled"} onClick={this.clearSelectedTransactions}>
							<Glyphicon glyph="copyright-mark" />
							&nbsp;Mark as Cleared
						</div>
						<div className={this.state.enableClearUnclearMenus ? "menu-item" : "menu-item-disabled"} onClick={this.unclearSelectedTransactions}>
							<Glyphicon glyph="copyright-mark" style={{opacity:"0.5"}} />
							&nbsp;Mark as Uncleared
						</div>
						<div className="menu-item-separator" />
						<div className={this.state.enableApproveRejectMenus ? "menu-item" : "menu-item-disabled"} onClick={this.approveSelectedTransactions}>
							<Glyphicon glyph="ok-circle" />
							&nbsp;Approve
						</div>
						<div className={this.state.enableApproveRejectMenus ? "menu-item" : "menu-item-disabled"} onClick={this.rejectSelectedTransactions}>
							<Glyphicon glyph="minus-sign" />
							&nbsp;Reject
						</div>
						<div className="menu-item-separator" />
						<div className="menu-item" onClick={this.showBulkCategorizeDialog}>
							<Glyphicon glyph="envelope" />
							&nbsp;Categorize as
						</div>
						<div className="menu-item-separator" />
						<div className={this.state.enableMoveToAccountMenu ? "menu-item" : "menu-item-disabled"} onClick={this.showMoveToAccountDialog}>
							<Glyphicon glyph="transfer" />
							&nbsp;Move to account
						</div>
						<div className="menu-item-separator" />
						<div className="menu-item" onClick={this.deleteSelectedTransactions}>
							<Glyphicon glyph="remove-circle" />
							&nbsp;Delete
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
