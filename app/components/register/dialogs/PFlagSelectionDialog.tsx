/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { TransactionFlag } from '../../../constants';
import { ITransaction, IScheduledTransaction } from '../../../interfaces/budgetEntities';
import { ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PFlagSelectionDialogProps {
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PFlagSelectionDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	transaction:ITransaction;
	scheduledTransaction:IScheduledTransaction;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'200px'
}

export class PFlagSelectionDialog extends React.Component<PFlagSelectionDialogProps, PFlagSelectionDialogState> {

	constructor(props: any) {
        super(props);
		this.hide = this.hide.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"bottom",
			transaction:null,
			scheduledTransaction:null 
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}
	
	public showForTransaction(transaction:ITransaction, target:HTMLElement, placement:string = "bottom"):void {

		// Get the subCategory for the passed subCategoryId
		var state = Object.assign({}, this.state) as PFlagSelectionDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		state.transaction = transaction;
		this.setState(state);
	}
	
	public showForScheduledTransaction(scheduledTransaction:IScheduledTransaction, target:HTMLElement, placement:string = "left"):void {

		// Get the subCategory for the passed subCategoryId
		var state = Object.assign({}, this.state) as PFlagSelectionDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		state.scheduledTransaction = scheduledTransaction;
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PFlagSelectionDialogState;
		state.show = false;
		state.transaction = null;
		state.scheduledTransaction = null;
		this.setState(state);
	}

	private setSelectedFlag(flag:string):void {

		var changedEntities:ISimpleEntitiesCollection;

		if(this.state.transaction) {
			// Get the transaction from the state and make a clone of it for updating
			var updatedTransaction = Object.assign({}, this.state.transaction) as ITransaction;
			updatedTransaction.flag = flag;
			changedEntities = {
				transactions: [updatedTransaction]
			};
		}
		else {
			// Get the scheduled transaction from the state and make a clone of it for updating
			var updatedScheduledTransaction = Object.assign({}, this.state.scheduledTransaction) as IScheduledTransaction;
			updatedScheduledTransaction.flag = flag;
			changedEntities = {
				scheduledTransactions: [updatedScheduledTransaction]
			};
		}

		this.props.updateEntities(changedEntities);
		this.hide();
	}

	private getListItem(flagColorName:string, selected:boolean = false) {

		var flagColor = TransactionFlag.getFlagColor(flagColorName);
		var flagTextColor = TransactionFlag.getFlagTextColor(flagColorName);

		if(selected) {
			return (
				<div key={flagColorName} className="flag-dropdown-list-item-selected" style={{backgroundColor:flagColor}} onClick={this.setSelectedFlag.bind(this, flagColorName)}>
					<button className="flag-dropdown-list-item-button" style={{backgroundColor:flagTextColor, borderColor:flagTextColor}}>{flagColorName}</button>
					<Glyphicon glyph="ok-circle" style={{color:'white'}}/>
				</div>
			);
		}
		else {
			return (
				<div key={flagColorName} className="flag-dropdown-list-item" style={{backgroundColor:flagColor}} onClick={this.setSelectedFlag.bind(this, flagColorName)}>
					<button className="flag-dropdown-list-item-button" style={{backgroundColor:flagTextColor, borderColor:flagTextColor}}>{flagColorName}</button>
				</div>
			);
		}
	}

	public render() {

		if(this.state.transaction || this.state.scheduledTransaction) {
			var flag:string;
			// Get the transaction/scheduledTransaction from the state, and get the currently set flag from it
			if(this.state.transaction)
				flag = this.state.transaction.flag; 
			else
				flag = this.state.scheduledTransaction.flag; 
			
			var flagPopoverItems = [
				this.getListItem("None", flag === 'None'),
				this.getListItem("Red", flag === 'Red'),
				this.getListItem("Orange", flag === 'Orange'),
				this.getListItem("Yellow", flag === 'Yellow'),
				this.getListItem("Green", flag === 'Green'),
				this.getListItem("Blue", flag === 'Blue'),
				this.getListItem("Purple", flag === 'Purple')
			];

			return (
				<Overlay key="overlay" rootClose={true} show={this.state.show} placement={this.state.placement} 
					onHide={this.hide} target={ ()=> ReactDOM.findDOMNode(this.state.target) }>
					<Popover id="selectFlagPopover" style={PopoverStyle}>
						<ul className="flag-dropdown-list">
							{flagPopoverItems}
						</ul>
					</Popover>
				</Overlay>
			);
		}
		else {
			return <div />;
		}
	}
}
