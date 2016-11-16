/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon } from 'react-bootstrap';

import { PButtonWithGlyph } from '../common/PButtonWithGlyph';
import { PAccountEditDialog } from './dialogs/PAccountEditDialog';

import { DataFormatter } from '../../utilities';
import { IAccount } from '../../interfaces/budgetEntities';
import { AccountTypes, AccountTypeNames } from '../../constants';

const AccountButtonContainerStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'row nowrap',	
	height: '30px',
	top: '0px',
	alignItems: 'center',
	cursor: 'pointer',
	backgroundColor: "transparent"
};

const AccountButtonLabelStyle:React.CSSProperties = {

	fontSize: '16px',
	fontWeight: 'normal', 
	margin: '0px', 
	paddingLeft: '4px', 
	paddingRight: '4px', 
	color: 'white'
};

const AccountButtonValueStyle:React.CSSProperties = {
	fontSize: '12px',
	fontWeight: 'normal', 
	textAlign: 'right',
	color: 'white'
};

const AccountButtonValueWithBadgeStyle:React.CSSProperties = {
	fontSize: '12px',
	fontWeight: 'normal', 
	color: '#D33C2D',
	backgroundColor: 'white'
};

const BadgeContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: "flex-end",
	width: '27px'
} 

const BaseBadgeStyle:React.CSSProperties = {
	fontSize: '10px',
	fontWeight: 'normal', 
	color: '#FFFFFF',
}

const InfoCountBadgeStyle = Object.assign({}, BaseBadgeStyle, {
	backgroundColor: '#009CC2',
	borderColor: '#FFFFFF',
	borderWidth: '1px',
	borderRadius: '5px',
	borderStyle: 'solid',
	paddingLeft: '3px',
	paddingRight: '3px'
});

const WarningCountBadgeStyle = Object.assign({}, BaseBadgeStyle, {
	backgroundColor: '#E59100',
	borderColor: '#FFFFFF',
	borderWidth: '1px',
	borderRadius: '5px',
	borderStyle: 'solid',
	paddingLeft: '3px',
	paddingRight: '3px'
});

export interface PAccountButtonProps {
	account:IAccount;
	selected: boolean;
	dataFormatter:DataFormatter;
	// Method to call on PSidebar for selecting the account
	selectAccount?: (accountId:string)=>void;
	showAccountEditDialog:(account:IAccount, target:HTMLElement)=>void;
	// Dispatcher method from CSidebar for updating the account
	updateAccount:(account:IAccount, currentBalance:number)=>void;
}

export class PAccountButton extends React.Component<PAccountButtonProps, {hoverState:boolean}> {
  
	private accountButtonContainer:HTMLDivElement;

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

		var state:any = Object.assign({}, this.state);
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {

		var state:any = Object.assign({}, this.state);
		state.hoverState = false;
		this.setState(state);
	}

	private onAccountEditClick() {
		// Show the popover for editing the account
		this.props.showAccountEditDialog(this.props.account, this.accountButtonContainer);
	}

  	public render() {

		var hoverState = (this.state as any).hoverState;

		// Based on the hoverState, set the backgroundColor value for the buttons
		var accountButtonContainerStyle = Object.assign({}, AccountButtonContainerStyle); 
		if(this.props.selected == true)
			accountButtonContainerStyle["backgroundColor"] = "#00596F";
		else {
			if(hoverState == true)
				accountButtonContainerStyle["backgroundColor"] = "#1D879B";
		}

		var account = this.props.account;
		var dataFormatter = this.props.dataFormatter;

		// If there are info or warning counts, then we want to show the information glyph before the account name
		var counterNode:JSX.Element;
		if(account.infoCount > 0) {
			counterNode = (
				<div style={BadgeContainerStyle}>
					<div style={InfoCountBadgeStyle}>
						{account.infoCount < 100 ? account.infoCount.toString() : "99+" }
					</div>
				</div>
			);
		}
		else if (account.warningCount > 0) {
			counterNode = (
				<div style={BadgeContainerStyle}>
					<div style={WarningCountBadgeStyle}>
						{account.warningCount < 100 ? account.warningCount.toString() : "99+" }
					</div>
				</div>
			);
		}
		else {
			counterNode = <div style={BadgeContainerStyle} />;
		}

		// If the value is negative, we need to show it with a badge around it
		var valueNode:JSX.Element;
		var accountBalance = account.clearedBalance + account.unclearedBalance;
		if(accountBalance < 0)
			valueNode = <span className="badge" style={AccountButtonValueWithBadgeStyle}>{dataFormatter.formatCurrency(accountBalance)}</span>;
		else
			valueNode = <span style={AccountButtonValueStyle}>{dataFormatter.formatCurrency(accountBalance)}</span>;

		return (
			<div>
				<div ref={(d)=> this.accountButtonContainer = d} style={accountButtonContainerStyle} 
					onClick={this.handleClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
					{counterNode}
					<span style={AccountButtonLabelStyle}>{account.accountName}</span>
					<PButtonWithGlyph showGlyph={this.state.hoverState} 
						glyphName="glyphicon-edit" glyphColor="#FFFFFF" clickHandler={this.onAccountEditClick} />
					<span style={{flex: '1 1 auto'}} />
					{valueNode}
					<span style={{width:'8px'}} />
				</div>
			</div>				
		);
  	}
}