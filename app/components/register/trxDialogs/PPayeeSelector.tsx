/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form, FormControl, FormGroup, Col, ControlLabel, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection } from '../../../interfaces/state';

export interface PPayeeSelectorProps { 
	selectedPayeeId:string;
	setSelectedPayeeId:(payeeId:string)=>void;
	handleTabPressed:(shiftPressed:boolean)=>void;
	// entities collections from the global state 
	entitiesCollection:IEntitiesCollection;
}

export interface PPayeeSelectorState { 
	showPopover:boolean;
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

export class PPayeeSelector extends React.Component<PPayeeSelectorProps, PPayeeSelectorState> {

	private payeeInput:FormControl;

	constructor(props: any) {
        super(props);
		this.onBlur = this.onBlur.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.setSelectedPayee = this.setSelectedPayee.bind(this);
		this.state = {showPopover:false};	
	}

	private setSelectedPayee(payeeId:string) {

		// This method is called when the user selects an item from the popover using mouse click
		if(this.props.selectedPayeeId != payeeId) {
			this.props.setSelectedPayeeId(payeeId);
			this.setState({showPopover:false});		
		}

		// Call handleTabPressed as we want to move the focus on to the next control
		this.props.handleTabPressed(false);
	}

	public showPopover():void {
		// If the popover is already showing then we dont need to do anything
		if(this.state.showPopover == false) {
			this.setState({showPopover:true});		
		}

		// Set the focus on the input control
		(ReactDOM.findDOMNode(this.payeeInput) as any).focus();
	}

	public hidePopover():void {
		// If the popover is already hidden then we dont need to do anything
		if(this.state.showPopover == true) {
			this.setState({showPopover:false});		
		}
	}

	private onFocus() {
		// If the popover is not already showing, then show it.
		this.showPopover();
	}

	private onBlur() {
		// If the popover is showing, hide it.
		this.hidePopover();
	}

	private onKeyDown(event:KeyboardEvent):void {

		if(this.state.showPopover == true && (event.keyCode == 38 || event.keyCode == 40)) {

			// Get the currently selected payeeId
			var currentPayeeId = this.props.selectedPayeeId;
			var payees = this.props.entitiesCollection.payees;
			var index = _.findIndex(payees, {entityId: currentPayeeId});

			// Up Arrow Key
			if(event.keyCode == 38) {
				// Decrement the index to get the previous account
				index--;
				// If we have gone below 0, go back to the last index
				if(index < 0)
					index = payees.length - 1;
			}
			// Down Arrow Key
			else if(event.keyCode == 40) {
				// Increment the index to get the next account
				index++;
				// If we have gone above the last index, go back to the first index
				if(index >= payees.length)
					index = 0;
			}

			// Get the payee corresponding to the index and set it as the selected payee
			var newPayee = payees[index];
			this.props.setSelectedPayeeId(newPayee.entityId);
		}
		// Tab Key
		else if(event.keyCode == 9) {
			// Prevent the default action from happening as we are manually handling it
			event.preventDefault();
			// Let the parent dialog know that tab was pressed
			this.props.handleTabPressed(event.shiftKey);
		}
	}

	public render() {

		var payeesPopoverItem;
		var payeesPopoverItems = [];
		var transferPayeesPopoverItems = [];
		var nonTransferPayeesPopoverItems = [];

		// Get the currently selected payee from state so that we can highlight the corresponding item
		var payees = this.props.entitiesCollection.payees;
		var selectedPayeeId = this.props.selectedPayeeId;
		var selectedPayee = selectedPayeeId ? payees.getEntityById(selectedPayeeId) : null;

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
						defaultValue={selectedPayee ? selectedPayee.name : ""} />
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
