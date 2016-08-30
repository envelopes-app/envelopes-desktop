/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form, FormControl, FormGroup, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PAccountSelectorProps { 
	width: number;
	accounts: Array<budgetEntities.IAccount>;
}

const AccountSelectorStyle = {
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
	width:'150px'
}

const AccountSelectionListItemStyle = {
	width: '100%',
}

export class PAccountSelector extends React.Component<PAccountSelectorProps, {showPopover:boolean, selectedAccount:budgetEntities.IAccount}> {

	private accountInput:FormControl;

	constructor(props: any) {
        super(props);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.setSelectedAccount = this.setSelectedAccount.bind(this);
		this.state = {showPopover:false, selectedAccount: this.props.accounts[0]};	
	}

	private onFocus() {
		var state:any = _.assign({}, this.state);
		state.showPopover = true;
		this.setState(state);
	}

	private onBlur() {
		// this.setState({showPopover:false});
	}

	private setSelectedAccount(entityId:string) {
		// Get the account from the list of accounts that corresponds to this entityId
		var selectedAccount = _.find(this.props.accounts, { entityId: entityId});
		var state:any = _.assign({}, this.state);
		state.selectedAccount = selectedAccount;
		this.setState(state);
	}

	public render() {

		var accountsPopoverItem;
		var accountsPopoverItems = [];

		// Get the currently selected account from state so that we can highlight the corresponding item
		var selectedAccount = this.state.selectedAccount;

		_.forEach(this.props.accounts, (account)=>{

			if(selectedAccount && selectedAccount.entityId == account.entityId)
				accountsPopoverItem = <li key={account.entityId} className="custom-dropdown-list-item-selected" id={account.entityId}>{account.accountName}</li>;
			else
				accountsPopoverItem = <li key={account.entityId} className="custom-dropdown-list-item" id={account.entityId} onClick={this.setSelectedAccount.bind(this, account.entityId)}>{account.accountName}</li>;

			accountsPopoverItems.push(accountsPopoverItem);
		});

		return (
			<div>
				<FormGroup width={this.props.width}>
					<FormControl ref={(n) => this.accountInput = n } type="text" componentClass="input" style={AccountSelectorStyle} 
						onFocus={this.onFocus} onBlur={this.onBlur} contentEditable={false} 
						defaultValue={this.state.selectedAccount ? this.state.selectedAccount.accountName : ""} />
					<FormControl.Feedback>
						<Glyphicon glyph="triangle-bottom" style={GlyphIconStyle} />
					</FormControl.Feedback>
				</FormGroup>
				<Overlay show={this.state.showPopover} placement="bottom" target={ ()=> ReactDOM.findDOMNode(this.accountInput) }>
					<Popover id="selectAccountPopover" style={PopoverStyle} title="Accounts">
						<ul className="custom-dropdown-list">
							{accountsPopoverItems}
						</ul>
					</Popover>
				</Overlay>
			</div>
		);
	}
}
