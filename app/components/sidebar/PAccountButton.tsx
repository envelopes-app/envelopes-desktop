/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PButtonWithGlyph } from '../common/PButtonWithGlyph';
import { PAccountEditDialog } from './dialogs/PAccountEditDialog';

import { DataFormatter } from '../../utilities';
import { IAccount } from '../../interfaces/budgetEntities';
import { AccountTypes, AccountTypeNames } from '../../constants';

const AccountButtonContainerStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',	
	height: '30px',
	top: '0px',
	paddingLeft: '16px', 
	alignItems: 'center',
	cursor: 'pointer',
	backgroundColor: "transparent"
};

const AccountButtonLabelStyle = {

	fontSize: '16px',
	fontWeight: 'normal', 
	margin: '0px', 
	paddingLeft: '8px', 
	paddingRight: '4px', 
	color: 'white'
};

const AccountButtonValueStyle = {

	fontSize: '12px',
	fontWeight: 'normal', 
	textAlign: 'right',
	color: 'white'
};

const AccountButtonValueWithBadgeStyle = {

	fontSize: '12px',
	fontWeight: 'normal', 
	color: '#D33C2D',
	backgroundColor: 'white'
};

export interface PAccountButtonProps {
	account:IAccount;
	selected: boolean;
	dataFormatter:DataFormatter;
	// Method to call on PSidebar for selecting the account
	selectAccount?: (accountId:string)=>void;
	// Dispatcher method from CSidebar for updating the account
	updateAccount: (account:IAccount, currentBalance:number)=>void;
}

export class PAccountButton extends React.Component<PAccountButtonProps, {hoverState:boolean}> {
  
	private accountButtonContainer:HTMLDivElement;
	private accountEditDialog:PAccountEditDialog;

	constructor(props: any) {
        super(props);
		this.handleClick = this.handleClick.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.onAccountEditClick = this.onAccountEditClick.bind(this);
		this.state = { hoverState:false };
	}

	private handleClick() {
		this.props.selectAccount(this.props.account.entityId);
	}

	private handleMouseEnter() {

		var state:any = _.assign({}, this.state);
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {

		var state:any = _.assign({}, this.state);
		state.hoverState = false;
		this.setState(state);
	}

	private onAccountEditClick() {
		// Show the popover for editing the account
		this.accountEditDialog.show(this.props.account, this.accountButtonContainer);
	}

  	public render() {

		var hoverState = (this.state as any).hoverState;

		// Based on the hoverState, set the backgroundColor value for the buttons
		var accountButtonContainerStyle = _.assign({}, AccountButtonContainerStyle); 
		if(this.props.selected == true)
			accountButtonContainerStyle["backgroundColor"] = "#00596F";
		else {
			if(hoverState == true)
				accountButtonContainerStyle["backgroundColor"] = "#1D879B";
		}

		// If the value is negative, we need to show it with a badge around it
		var valueNode:JSX.Element;
		var account = this.props.account;
		var dataFormatter = this.props.dataFormatter;
		var accountBalance = account.clearedBalance + account.unclearedBalance;
		if(accountBalance < 0)
			valueNode = <span className="badge" style={AccountButtonValueWithBadgeStyle}>{dataFormatter.formatCurrency(accountBalance)}</span>;
		else
			valueNode = <span style={AccountButtonValueStyle}>{dataFormatter.formatCurrency(accountBalance)}</span>;

		return (
			<div>
				<div ref={(d)=> this.accountButtonContainer = d} style={accountButtonContainerStyle} 
					onClick={this.handleClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
					<span style={AccountButtonLabelStyle}>{account.accountName}</span>
					<PButtonWithGlyph showGlyph={this.state.hoverState} 
						glyphName="glyphicon-edit" glyphColor="#FFFFFF" clickHandler={this.onAccountEditClick} />
					<span style={{flex: '1 1 auto'}} />
					{valueNode}
					<span style={{width:'8px'}} />
				</div>

				<PAccountEditDialog 
					ref={(d)=> { this.accountEditDialog = d; }}
					dataFormatter={this.props.dataFormatter}
					updateAccount={this.props.updateAccount}
				/>
			</div>				
		);
  	}
}