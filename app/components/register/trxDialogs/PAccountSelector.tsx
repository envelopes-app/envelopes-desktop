/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form, FormControl, FormGroup, Col, ControlLabel, Overlay, Popover } from 'react-bootstrap';

import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollectionWithMaps } from '../../../interfaces/state';

export interface PAccountSelectorProps { 
	selectedAccountId?:string;
	handleTabPressed:(shiftPressed:boolean)=>void;
	// entities collections from the global state 
	entitiesCollection:IEntitiesCollectionWithMaps;
}

export interface PAccountSelectorState { 
	showPopover:boolean;
	selectedAccountId:string;
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
		this.onClick = this.onClick.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.setSelectedAccountId = this.setSelectedAccountId.bind(this);
		this.state = {showPopover:false, selectedAccountId: this.props.selectedAccountId};	
	}

	public getSelectedAccountId():string {
		return this.state.selectedAccountId;
	}

	public showPopover():void {
		// If the popover is already showing then we dont need to do anything
		if(this.state.showPopover == false) {
			var state:any = _.assign({}, this.state);
			state.showPopover = true;
			this.setState(state);
		}

		// Set the focus on the input control
		(ReactDOM.findDOMNode(this.accountInput) as any).focus();
	}

	public hidePopover():void {
		// If the popover is already hidden then we dont need to do anything
		if(this.state.showPopover == true) {
			var state:any = _.assign({}, this.state);
			state.showPopover = false;
			this.setState(state);
		}
	}

	private onClick() {
		// If the popover is not already showing, then show it.
		this.showPopover();
	}

	private onKeyDown(event:KeyboardEvent):void {

		if(this.state.showPopover == true && event.keyCode == 38 || event.keyCode == 40) {

			// Get the currently selected flag color
			var currentAccountId = this.state.selectedAccountId;
			var accounts = this.props.entitiesCollection.accounts;
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
			var state:any = _.assign({}, this.state);
			state.selectedAccountId = newAccount.entityId;
			this.setState(state);
		}
		// Escape Key
		else if(event.keyCode == 27) {
			// If the popover is showing, then hide it.
			if(this.state.showPopover == true) {
				var state:any = _.assign({}, this.state);
				state.showPopover = false;
				this.setState(state);
			}
		}
		// Tab Key
		else if(event.keyCode == 9) {
			// Prevent the default action from happening as we are manually handling it
			event.preventDefault();
			// Hide the popover
			this.hidePopover();
			// Let the parent dialog know that tab was pressed
			this.props.handleTabPressed(event.shiftKey);
		}
	}

	private setSelectedAccountId(entityId:string) {
		var state:any = _.assign({}, this.state);
		state.selectedAccountId = entityId;
		this.setState(state);
	}

	public render() {

		var accountsPopoverItem;
		var accountsPopoverItems = [];

		// Get the currently selected account from state so that we can highlight the corresponding item
		var accounts = this.props.entitiesCollection.accounts;
		var accountsMap = this.props.entitiesCollection.accountsMap;
		var selectedAccountId = this.state.selectedAccountId;
		var selectedAccount = this.state.selectedAccountId ? accountsMap[selectedAccountId] : null;

		_.forEach(accounts, (account)=>{

			if(selectedAccountId && selectedAccountId == account.entityId)
				accountsPopoverItem = <li key={account.entityId} className="custom-dropdown-list-item-selected" id={account.entityId}>{account.accountName}</li>;
			else
				accountsPopoverItem = <li key={account.entityId} className="custom-dropdown-list-item" id={account.entityId} onClick={this.setSelectedAccountId.bind(this, account.entityId)}>{account.accountName}</li>;

			accountsPopoverItems.push(accountsPopoverItem);
		});

		return (
			<FormGroup onKeyDown={this.onKeyDown}>
				<Col componentClass={ControlLabel} sm={3}>
					Account
				</Col>
				<Col sm={9}>
					<FormControl ref={(n) => this.accountInput = n } type="text" componentClass="input" style={AccountSelectorStyle} 
						onClick={this.onClick} contentEditable={false} readOnly={true}
						value={selectedAccount ? selectedAccount.accountName : ""} />
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
