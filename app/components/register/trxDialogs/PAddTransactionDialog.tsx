/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Modal, Form, FormGroup, FormControl, ControlLabel, Glyphicon } from 'react-bootstrap';

import { PFlagSelector } from './PFlagSelector';
import { PAccountSelector } from './PAccountSelector';
import { PDateSelector } from './PDateSelector';
import { PPayeeSelector } from './PPayeeSelector';
import { PCategorySelector } from './PCategorySelector';

import * as constants from '../../../constants';
import * as utilities from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ITransactionValues } from '../../../interfaces/state';

export interface PAddTransactionDialogProps { 

	// Entities collections from the global state 
	entitiesCollection:IEntitiesCollection;
	// Dispatch methods
	updateEntities:(entities:IEntitiesCollection)=>void;
}

export interface PAddTransactionDialogState {
	showModal: boolean;
	// Properties to save the values for the different fields. We wont create an actual transaction 
	// or scheduled transaction object until the user presses save.
	entityId?: string;
	flag?: string;
	accountId?: string;
	payeeId?: string;
	date?: utilities.DateWithoutTime;
	frequency?: string;
	subCategoryId?: string;
	memo?: string;
	amount?: number;
	cleared?: string;
}

export class PAddTransactionDialog extends React.Component<PAddTransactionDialogProps, PAddTransactionDialogState> {

	private accountSelector:PAccountSelector;
	private dateSelector:PDateSelector;
	private payeeSelector:PPayeeSelector;
	private categorySelector:PCategorySelector;

	constructor(props: any) {
        super(props);
		this.show = this.show.bind(this);
		this.save = this.save.bind(this);
		this.close = this.close.bind(this);
		this.onEntered = this.onEntered.bind(this);

		this.setSelectedAccountId = this.setSelectedAccountId.bind(this);
		this.setSelectedDate = this.setSelectedDate.bind(this);
		this.handleTabPressedOnAccountSelector = this.handleTabPressedOnAccountSelector.bind(this);
		this.handleTabPressedOnDateSelector = this.handleTabPressedOnDateSelector.bind(this);

        this.state = { showModal: false };
    }

	private saveAndAddAnother():void {

	}

	public show(accountId:string = null):void {

		// if this dialog is being shown from the "All Accounts", we would get a null accountId.
		// In that case, we need to choose a default account that would be set initially in the accounts field.
		if(!accountId) {
			var account = utilities.EntitiesLookupHelper.getDefaultAccountForAddTransactionDialog(this.props.entitiesCollection);
			if(account)
				accountId = account.entityId;
		}

		// If no account was passed, and neither were we able to select a default one, then that means there are
		// no usable accounts in the budget.
		if(accountId) {
			// Update the state of this dialog to make it visible. 
			// Also reset all the fields for storing the values for the new transaction 
			this.setState({ 
				showModal: true,
				entityId: utilities.KeyGenerator.generateUUID(),
				accountId: accountId,
				payeeId: null,
				date: utilities.DateWithoutTime.createForToday(),
				frequency: null,
				subCategoryId: null,
				memo: null,
				amount: 0,
			});
		}
		else {
			utilities.Logger.info("We cannot show the Add Transaction Dialog as there are no open accounts.");
		}
	};

	private save():void {

		// Close the modal dialog
		this.close();
	}

	private close():void {
		// Hide the modal, and set the account in state to null
		this.setState({ showModal: false });
	};

	private onEntered():void {
		var accountSelector = this.accountSelector;
		setTimeout(function(){
			accountSelector.showPopover();
		}, 100);
	}

	private setSelectedAccountId(accountId:string):void {
		var state = _.assign({}, this.state) as PAddTransactionDialogState;
		state.accountId = accountId;
		this.setState(state);
	}

	private setSelectedDate(date:utilities.DateWithoutTime):void {
		var state = _.assign({}, this.state) as PAddTransactionDialogState;
		state.date = date;
		this.setState(state);
	}

	private setSelectedPayeeId(payeeId:string):void {
		var state = _.assign({}, this.state) as PAddTransactionDialogState;
		state.payeeId = payeeId;
		this.setState(state);
	}

	private handleTabPressedOnAccountSelector(shiftKeyPressed:boolean):void {

		// If shift key is not pressed then move the focus on to the date selector. 
		if(!shiftKeyPressed) {
			// Show the date selector popover
			this.dateSelector.showPopover();
			// Hide the account selector popover
			this.accountSelector.hidePopover(); 
		}
	}

	private handleTabPressedOnDateSelector(shiftKeyPressed:boolean):void {

		// Hide the date selector popover
		this.dateSelector.hidePopover(); 
		// If shift key is not pressed then move the focus on to the payee selector. 
		// Otherwise move the focus back to the account selector. 
		if(!shiftKeyPressed) {
			// Show the payee selector popover
			this.payeeSelector.showPopover();
		}
		else {
			// Show the payee selector popover
			this.accountSelector.showPopover();
		}
	}

	private handleTabPressedOnPayeeSelector(shiftKeyPressed:boolean):void {

		// Hide the payee selector popover
		this.payeeSelector.hidePopover(); 
		// If shift key is not pressed then move the focus on to the category selector. 
		// Otherwise move the focus back to the date selector. 
		if(!shiftKeyPressed) {
			// Show the category selector popover
			//this.categorySelector.showPopover();
		}
		else {
			// Show the date selector popover
			this.dateSelector.showPopover();
		}
	}

	public render() {

		return (
			<Modal show={this.state.showModal} onEntered={this.onEntered} onHide={this.close} backdrop="static" keyboard={false} dialogClassName="add-transaction-dialog">
				<Modal.Header bsClass="modal-header">
					<Modal.Title>Add Transaction</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form horizontal>
						<PAccountSelector ref={(c) => this.accountSelector = c} 
							selectedAccountId={this.state.accountId} entitiesCollection={this.props.entitiesCollection} 
							setSelectedAccountId={this.setSelectedAccountId} handleTabPressed={this.handleTabPressedOnAccountSelector} />
						<PDateSelector ref={(c) => this.dateSelector = c} 
							selectedDate={this.state.date} setSelectedDate={this.setSelectedDate} handleTabPressed={this.handleTabPressedOnDateSelector} />
						<PPayeeSelector ref={(c) => this.payeeSelector = c} 
							selectedPayeeId={this.state.payeeId} entitiesCollection={this.props.entitiesCollection} 
							setSelectedPayeeId={this.setSelectedPayeeId} handleTabPressed={this.handleTabPressedOnPayeeSelector} />
						<PCategorySelector ref={(c) => this.categorySelector = c} selectedCategoryId={this.state.subCategoryId} entitiesCollection={this.props.entitiesCollection} />
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.close}>
						Cancel&nbsp;<Glyphicon glyph="remove-sign" />
					</Button>
					<Button onClick={this.save}>
						Save and add another&nbsp;<Glyphicon glyph="ok-sign" />
					</Button>
					<Button onClick={this.save}>
						Save&nbsp;<Glyphicon glyph="ok-sign" />
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
