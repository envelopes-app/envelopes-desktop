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
import { IEntitiesCollection, IEntitiesCollectionWithMaps, ITransactionValues } from '../../../interfaces/state';

export interface PAddTransactionDialogProps { 
	// entities collections from the global state 
	entitiesCollection:IEntitiesCollectionWithMaps;
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

	private flagSelector:PFlagSelector;
	private accountSelector:PAccountSelector;
	private dateSelector:PDateSelector;
	private payeeSelector:PPayeeSelector;
	private categorySelector:PCategorySelector;

	constructor(props: any) {
        super(props);
        this.state = { showModal: false };
		this.show = this.show.bind(this);
		this.save = this.save.bind(this);
		this.close = this.close.bind(this);

		this.handleTabPressedOnFlagSelector = this.handleTabPressedOnFlagSelector.bind(this);
    }

	private close():void {
		// Hide the modal, and set the account in state to null
		this.setState({ showModal: false });
	};

	private save():void {

		// Close the modal dialog
		this.close();
	}

	private saveAndAddAnother():void {

	}

	public show():void {

		var account = this.props.entitiesCollection.accounts ? this.props.entitiesCollection.accounts[0] : null;
		var accountId = account ? account.entityId : null;

		if(accountId) {
			this.setState({ 
				showModal: true,
				entityId: utilities.KeyGenerator.generateUUID(),
				flag: 'None',
				accountId: null,
				payeeId: null,
				date: utilities.DateWithoutTime.createForToday(),
				frequency: null,
				subCategoryId: null,
				memo: null,
				amount: 0,
				cleared: constants.ClearedFlag.Uncleared
			});
		}
		else {
			utilities.Logger.info("We cannot show the Add Transaction Dialog as there are no defined accounts yet.");
		}
	};

	private handleTabPressedOnFlagSelector(shiftKeyPressed:boolean):void {

		// Get the selected flag from the flag selector and set it in the state
		var state = _.assign({}, this.state) as PAddTransactionDialogState;
		state.flag = this.flagSelector.getSelectedFlag();
		this.setState(state);

		// If shift key is not pressed then move the focus on to the account selector.
		if(!shiftKeyPressed)
			this.accountSelector.showPopover();
	}

	private handleTabPressedOnAccountSelector(shiftKeyPressed:boolean):void {

		// Get the selected account from the account selector and set it in the state
		var state = _.assign({}, this.state) as PAddTransactionDialogState;
		state.accountId = this.accountSelector.getSelectedAccountId();
		this.setState(state);

		// If shift key is not pressed then move the focus on to the date selector. 
		// Otherwise move the focus back to the flag selector. 
		if(!shiftKeyPressed)
			this.flagSelector.showPopover();
		else
			this.dateSelector.showPopover();
	}

	public render() {

		return (
			<Modal show={this.state.showModal} onHide={this.close} backdrop="static" keyboard={false} dialogClassName="add-transaction-dialog">
				<Modal.Header bsClass="modal-header">
					<Modal.Title>Add Transaction</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form horizontal>
						<PFlagSelector ref={(c) => this.flagSelector = c} selectedFlag={this.state.flag} handleTabPressed={this.handleTabPressedOnFlagSelector} />
						<PAccountSelector ref={(c) => this.accountSelector = c} selectedAccountId={this.state.accountId} entitiesCollection={this.props.entitiesCollection} handleTabPressed={this.handleTabPressedOnAccountSelector} />
						<PDateSelector ref={(c) => this.dateSelector = c} selectedDate={this.state.date} />
						<PPayeeSelector ref={(c) => this.payeeSelector = c} selectedPayeeId={this.state.payeeId} entitiesCollection={this.props.entitiesCollection} />
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
