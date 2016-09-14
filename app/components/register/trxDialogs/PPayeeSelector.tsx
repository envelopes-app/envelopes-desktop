/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form, FormControl, FormGroup, Col, ControlLabel, Overlay, Popover } from 'react-bootstrap';

import * as objects from '../../../interfaces/objects';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection } from '../../../interfaces/state';

export interface PPayeeSelectorProps {
	selectedPayeeId:string;
	manuallyEnteredPayeeName:string;
	payeesList:Array<objects.IPayeeObject>;
	setSelectedPayeeId:(payeeId:string)=>void;
	setManuallyEnteredPayeeName:(payeeName:string)=>void;
	handleTabPressed:(shiftPressed:boolean)=>void;
}

export interface PPayeeSelectorState { 
	showPopover:boolean;
}

const PayeeSelectorStyle = {
	borderColor: '#2FA2B5',
	borderTopWidth: '2px',
	borderBottomWidth: '2px',
	borderLeftWidth: '2px',
	borderRightWidth: '2px',
}

const PopoverStyle = {
	maxWidth: 'none', 
	width:'240px'
}

const ScrollableContainerStyle = {
	overflowY: "scroll",
}

const NewPayeeCreationMessageStyle = {
	color: "#588697",
	fontSize: "12px"
}

export class PPayeeSelector extends React.Component<PPayeeSelectorProps, PPayeeSelectorState> {

	private payeeInput:FormControl;

	constructor(props: any) {
        super(props);
		this.onBlur = this.onBlur.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.setSelectedPayeeId = this.setSelectedPayeeId.bind(this);
		this.state = {showPopover:false};	
	}

	private setSelectedPayeeId(payeeId:string) {

		// This method is called when the user selects an item from the popover using mouse click
		if(this.props.selectedPayeeId != payeeId) {
			this.props.setSelectedPayeeId(payeeId);
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
		//this.hidePopover();
	}

	private onChange(event:React.SyntheticEvent) {

		// Get the entered value from the payee input control and pass to the transaction dialog
		var value = (event.target as any).value;
		this.props.setManuallyEnteredPayeeName(value);
	}

	private onKeyDown(event:KeyboardEvent):void {

		if(this.state.showPopover == true && (event.keyCode == 38 || event.keyCode == 40)) {

			// Get the currently selected payeeId
			var currentPayeeId = this.props.selectedPayeeId;
			var payees = this.props.payeesList;
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

	private getPayeesDisplayList(payeesList:Array<objects.IPayeeObject>, selectedPayeeId:string):JSX.Element {

		var payeesPopoverItem;
		var payeesPopoverItems;
		var transferPayeesPopoverItems = [];
		var nonTransferPayeesPopoverItems = [];

		var selectedPayee = selectedPayeeId ? _.find(this.props.payeesList, {entityId: selectedPayeeId}) : null;

		payeesPopoverItem = <li key="0" className="custom-dropdown-2list-section">Transfer to/from account:</li>;
		transferPayeesPopoverItems.push(payeesPopoverItem);
		payeesPopoverItem = <li key="1" className="custom-dropdown-2list-section">Memorized:</li>;
		nonTransferPayeesPopoverItems.push(payeesPopoverItem);
		
		// Iterate through the passed payees and create list items for them
		_.forEach(payeesList, (payee)=>{

			if(selectedPayee && selectedPayee.entityId == payee.entityId)
				payeesPopoverItem = <li key={payee.entityId} className="custom-dropdown-2list-item-selected" id={payee.entityId}>{payee.name}</li>;
			else
				payeesPopoverItem = <li key={payee.entityId} className="custom-dropdown-2list-item" id={payee.entityId} onClick={this.setSelectedPayeeId.bind(this, payee.entityId)}>{payee.name}</li>;

			if(payee.isTransferPayee)
				transferPayeesPopoverItems.push(payeesPopoverItem);
			else
				nonTransferPayeesPopoverItems.push(payeesPopoverItem);
		});

		// Concatenate the two arrays to get the single array of items
		payeesPopoverItems = transferPayeesPopoverItems.concat(nonTransferPayeesPopoverItems);

		return (
			<ul className="custom-dropdown-list" style={ScrollableContainerStyle}>
				{payeesPopoverItems}
			</ul>
		);
	}

	public render() {

		var popoverContents;

		// Get the currently selected payee from state so that we can highlight the corresponding item
		var payees = this.props.payeesList;
		var selectedPayeeId = this.props.selectedPayeeId;
		var selectedPayee = selectedPayeeId ? _.find(payees, {entityId: selectedPayeeId}) : null;

		// Do we have a manuallyEnteredPayeeName for the input box. If we have, then set that in the input box.
		// If not, then check if we have a selected input. If so, then set the name of the selected payee in the input box.
		// If neither of the above is true, set it as blank.
		var payeeValue = "";
		if(this.props.manuallyEnteredPayeeName) {

			// Show the manuallyEnteredPayeeName in the payee input box
			payeeValue = this.props.manuallyEnteredPayeeName;
			// Filter the list of payees by the manuallyEnteredPayeeName
			var filteredPayeesList = _.filter(this.props.payeesList, (payeeObj:objects.IPayeeObject)=>{
				return payeeObj.name.includes(this.props.manuallyEnteredPayeeName);
			});

			if(filteredPayeesList.length == 0) {

				// There are no matches, and the filteredPayeesList is empty, so we will display a messaage at the
				// top informing the user that a new payee will be created. 
				var payeeCreationMessage = `"${this.props.manuallyEnteredPayeeName}" payee will be created`;
				popoverContents = <label style={NewPayeeCreationMessageStyle}>{payeeCreationMessage}</label>;
			}
			else if(filteredPayeesList.length == 1 && filteredPayeesList.length[0] == this.props.manuallyEnteredPayeeName) {

				// We got back one item in the filteredPayeesList and it is an exact match. We will just display
				// the payees list with that single item in it.
				popoverContents = this.getPayeesDisplayList(filteredPayeesList, this.props.selectedPayeeId);
			}
			else {
				// We got back one or more items in the filteredPayeesList, then display the link at the top 
				// offering to create a new payee by the entered name. Also display the list of filtered payees 
				// below that.
				popoverContents = this.getPayeesDisplayList(this.props.payeesList, this.props.selectedPayeeId);
			}
		}
		else {
			if(selectedPayee)
				payeeValue = selectedPayee.name;

			popoverContents = this.getPayeesDisplayList(this.props.payeesList, this.props.selectedPayeeId);
		}

		return (
			<FormGroup onKeyDown={this.onKeyDown}>
				<Col componentClass={ControlLabel} sm={3}>
					Payee
				</Col>
				<Col sm={9}>
					<FormControl ref={(n) => this.payeeInput = n } type="text" componentClass="input" style={PayeeSelectorStyle} 
						onFocus={this.onFocus} onBlur={this.onBlur} onChange={this.onChange} value={payeeValue} />
					<Overlay show={this.state.showPopover} placement="right" target={ ()=> ReactDOM.findDOMNode(this.payeeInput) }>
						<Popover id="selectPayeePopover" style={PopoverStyle} title="Payees">
							{popoverContents}
						</Popover>
					</Overlay>
				</Col>
			</FormGroup>
		);
	}
}
