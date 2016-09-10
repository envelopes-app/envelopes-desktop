/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form, FormControl, FormGroup, Col, ControlLabel, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollectionWithMaps } from '../../../interfaces/state';

export interface PPayeeSelectorProps { 
	selectedPayeeId:string;
	// entities collections from the global state 
	entitiesCollection:IEntitiesCollectionWithMaps;
}

const PayeeSelectorStyle = {
	borderColor: '#009CC2',
	borderTopWidth: '2px',
	borderBottomWidth: '2px',
	borderLeftWidth: '2px',
	borderRightWidth: '2px',
}

const GlyphIconStyle = {
	color: '#009CC2'
}

const PopoverStyle = {
	maxWidth: 'none', 
	width:'240px'
}

export class PPayeeSelector extends React.Component<PPayeeSelectorProps, {showPopover:boolean, selectedPayee:budgetEntities.IPayee}> {

	private payeeInput:FormControl;

	constructor(props: any) {
        super(props);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.setSelectedPayee = this.setSelectedPayee.bind(this);
		this.state = {showPopover:false, selectedPayee: this.props.entitiesCollection.payees[0]};	
	}

	private onFocus() {
		var state:any = _.assign({}, this.state);
		state.showPopover = true;
		this.setState(state);
	}

	private onBlur() {
		// this.setState({showPopover:false});
	}

	private setSelectedPayee(entityId:string) {
		// Get the payee from the list of payees that corresponds to this entityId
		var selectedPayee = _.find(this.props.entitiesCollection.payees, { entityId: entityId});
		var state:any = _.assign({}, this.state);
		state.selectedPayee = selectedPayee;
		this.setState(state);
	}

	public render() {

		var payeesPopoverItem;
		var payeesPopoverItems = [];
		var transferPayeesPopoverItems = [];
		var nonTransferPayeesPopoverItems = [];

		// Get the currently selected payee from state so that we can highlight the corresponding item
		var selectedPayee = this.state.selectedPayee;

		// Create section items for transfer and non-transfer payees
		payeesPopoverItem = <li key="transferPayeesSection" className="custom-dropdown-2list-section">Transfer to/from account:</li>;
		transferPayeesPopoverItems.push(payeesPopoverItem);
		payeesPopoverItem = <li key="nonTransferPayeesSection" className="custom-dropdown-2list-section">Memorized:</li>;
		nonTransferPayeesPopoverItems.push(payeesPopoverItem);

		// Iterate through all the payees and create list items for them
		_.forEach(this.props.entitiesCollection.payees, (payee)=>{

			if(selectedPayee && selectedPayee.entityId == payee.entityId)
				payeesPopoverItem = <li key={payee.entityId} className="custom-dropdown-2list-item-selected" id={payee.entityId}>{payee.name}</li>;
			else
				payeesPopoverItem = <li key={payee.entityId} className="custom-dropdown-2list-item" id={payee.entityId} onClick={this.setSelectedPayee.bind(this, payee.entityId)}>{payee.name}</li>;

			if(payee.accountId)
				transferPayeesPopoverItems.push(payeesPopoverItem);
			else
				nonTransferPayeesPopoverItems.push(payeesPopoverItem);
		});

		// Concatenate the two popovr items arrays
		payeesPopoverItems = transferPayeesPopoverItems.concat(nonTransferPayeesPopoverItems);

		return (
			<FormGroup>
				<Col componentClass={ControlLabel} sm={3}>
					Payee
				</Col>
				<Col sm={9}>
					<FormControl ref={(n) => this.payeeInput = n } type="text" componentClass="input" style={PayeeSelectorStyle} 
						onFocus={this.onFocus} onBlur={this.onBlur} contentEditable={false} 
						defaultValue={this.state.selectedPayee ? this.state.selectedPayee.name : ""} />
					<Overlay show={this.state.showPopover} placement="right" target={ ()=> ReactDOM.findDOMNode(this.payeeInput) }>
						<Popover id="selectPayeePopover" style={PopoverStyle} title="Payees">
							<ul className="custom-dropdown-list">
								{payeesPopoverItems}
							</ul>
						</Popover>
					</Overlay>
				</Col>
			</FormGroup>
		);
	}
}
