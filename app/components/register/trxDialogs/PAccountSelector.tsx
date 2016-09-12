/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form, FormControl, FormGroup, Col, ControlLabel, Overlay, Popover } from 'react-bootstrap';

import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection } from '../../../interfaces/state';
import * as objects from '../../../interfaces/objects';

export interface PAccountSelectorProps { 
	selectedAccountId:string;
	accountsList:Array<objects.IAccountObject>;
	setSelectedAccountId:(accountId:string)=>void;
	handleTabPressed:(shiftPressed:boolean)=>void;
}

export interface PAccountSelectorState { 
	showPopover:boolean;
}

const AccountSelectorStyle = {
	borderColor: '#009CC2',
	borderTopWidth: '2px',
	borderBottomWidth: '2px',
	borderLeftWidth: '2px',
	borderRightWidth: '2px',
}

const PopoverStyle = {
	maxWidth: 'none',
	width:'240px'
}

export class PAccountSelector extends React.Component<PAccountSelectorProps, PAccountSelectorState> {

	private accountInput:FormControl;

	constructor(props: any) {
        super(props);
		this.onBlur = this.onBlur.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.setSelectedAccountId = this.setSelectedAccountId.bind(this);
		this.state = {showPopover:false};	
	}

	private setSelectedAccountId(accountId:string) {

		// This method is called when the user selects an item from the popover using mouse click
		if(this.props.selectedAccountId != accountId) {
			this.props.setSelectedAccountId(accountId);
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
		(ReactDOM.findDOMNode(this.accountInput) as any).focus();
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

	private onChange() { }

	private onKeyDown(event:KeyboardEvent):void {

		if(this.state.showPopover == true && (event.keyCode == 38 || event.keyCode == 40)) {

			// Get the currently selected accountId
			var currentAccountId = this.props.selectedAccountId;
			var accounts = this.props.accountsList;
			var index = _.findIndex(accounts, {entityId: currentAccountId});

			// Up Arrow Key
			if(event.keyCode == 38) {
				// Decrement the index to get the previous account
				index--;
				// If we have gone below 0, go back to the last index
				if(index < 0)
					index = accounts.length - 1;
			}
			// Down Arrow Key
			else if(event.keyCode == 40) {
				// Increment the index to get the next account
				index++;
				// If we have gone above the last index, go back to the first index
				if(index >= accounts.length)
					index = 0;
			}

			// Get the account corresponding to the index and set it as the selected account
			var newAccount = accounts[index];
			this.props.setSelectedAccountId(newAccount.entityId);
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

		var accountsPopoverItem;
		var accountsPopoverItems = [];

		// Get the currently selected account so that we can highlight the corresponding item
		var accounts = this.props.accountsList;
		var selectedAccountId = this.props.selectedAccountId;
		var selectedAccount = _.find(accounts, {entityId: selectedAccountId});

		_.forEach(accounts, (account)=>{
			var className = (selectedAccountId && selectedAccountId == account.entityId) ? "custom-dropdown-list-item-selected" : "custom-dropdown-list-item"; 
			accountsPopoverItem = <li key={account.entityId} className={className} id={account.entityId} onClick={this.setSelectedAccountId.bind(this, account.entityId)}>{account.name}</li>;
			accountsPopoverItems.push(accountsPopoverItem);
		});

		return (
			<FormGroup onKeyDown={this.onKeyDown}>
				<Col componentClass={ControlLabel} sm={3}>
					Account
				</Col>
				<Col sm={9}>
					<FormControl ref={(n) => this.accountInput = n } type="text" componentClass="input" style={AccountSelectorStyle} 
						onFocus={this.onFocus} onBlur={this.onBlur} onChange={this.onChange} contentEditable={false}
						value={selectedAccount ? selectedAccount.name : ""} />
					<Overlay show={this.state.showPopover} placement="right" target={ ()=> ReactDOM.findDOMNode(this.accountInput) }>
						<Popover id="selectAccountPopover" style={PopoverStyle} title="Accounts">
							<ul className="custom-dropdown-list">
								{accountsPopoverItems}
							</ul>
						</Popover>
					</Overlay>
				</Col>
			</FormGroup>
		);
	}
}
