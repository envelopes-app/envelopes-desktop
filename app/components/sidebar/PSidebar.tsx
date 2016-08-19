/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import * as colors from 'material-ui/styles/colors';
import MailOutline from 'material-ui/svg-icons/communication/mail-outline';
import AccountBalance from 'material-ui/svg-icons/action/account-balance';

import ColorPalette from '../common/ColorPalette';
import { PSidebarHeader } from './PSidebarHeader';
import { PModuleButton } from './PModuleButton';
import { PAccountButtonContainer } from './PAccountButtonContainer';
import { PAccountButton } from './PAccountButton';
import { PAccountCreationDialog } from './PAccountCreationDialog';

import { EntityFactory } from '../../persistence';
import { IAccount } from '../../interfaces/budgetEntities';
import { ISidebarState } from '../../interfaces/state';

let SelectableList = MakeSelectable(List);

const PSidebarStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	width: '100%',
	height: '100%',
	backgroundColor: colors.cyan400,
};

const ModuleButtonIconStyle = {
	display: 'inline-block',
	color: 'rgba(0, 0, 0, 0.870588)',
	fill: 'rgb(255, 255, 255)',
	height: '24px',
	width: '24px',
	verticalAlign: 'middle',
	marginLeft: '12px',
	marginRight: '0px'
}

export interface PSidebarProps {
	// State Variables
    accounts: Array<IAccount>;
	sidebarState: ISidebarState;
	// Dispatcher Functions
	setSelectedTab: (selectedTab:string, selectedAccountId:string)=>void;
	setBudgetAccountsExpanded: (expanded:boolean)=>void;
	setTrackingAccountsExpanded: (expanded:boolean)=>void;
	setClosedAccountsExpanded: (expanded:boolean)=>void;
	addAccount: (account:IAccount, currentBalance:number)=>void;
	updateAccount: (account:IAccount, currentBalance:number)=>void;
}

export class PSidebar extends React.Component<PSidebarProps, {}> {
  
	private accountCreationDialog:PAccountCreationDialog;

	constructor(props: any) {
        super(props);
		this.onAddAccountClick = this.onAddAccountClick.bind(this);
	}

	private onAddAccountClick() {

		// Create a new account entity and pass it to the account creation dialog
		var account = EntityFactory.createNewAccount();
		this.accountCreationDialog.show(account);
	}

  	public render() {
		
		var budgetAccountNodes = [];
		var trackingAccountNodes = [];
		var closedAccountNodes = [];
		var budgetAccountsBalance:number = 0;
		var trackingAccountsBalance:number = 0;

		_.forEach(this.props.accounts, (account)=>{
			if(account.onBudget == 1 && account.closed == 0) {
				budgetAccountNodes.push(
					<PAccountButton key={account.entityId} label={account.accountName} value={account.clearedBalance + account.unclearedBalance} selected={false} />
				);
				budgetAccountsBalance += account.clearedBalance + account.unclearedBalance;
			}
			else if(account.onBudget == 0 && account.closed == 0) {
				trackingAccountNodes.push(
					<PAccountButton key={account.entityId} label={account.accountName} value={account.clearedBalance + account.unclearedBalance} selected={false} />
				);
				trackingAccountsBalance += account.clearedBalance + account.unclearedBalance;
			}
			else if(account.closed == 1) {
				closedAccountNodes.push(
					<PAccountButton key={account.entityId} label={account.accountName} value={account.clearedBalance + account.unclearedBalance} selected={false} />
				);
			}
		});

		return (
			<div className="sidebar" style={PSidebarStyle}>
				<PSidebarHeader title="Home Budget 2016" />
				<PModuleButton label="Budget" selected={false}>
					<MailOutline style={ModuleButtonIconStyle} />
				</PModuleButton>
				<PModuleButton label="All Accounts" selected={false}>
					<AccountBalance style={ModuleButtonIconStyle} />
				</PModuleButton>
				<Divider style={{backgroundColor: ColorPalette.Shade600}} />
				<PAccountButtonContainer label="BUDGET" value={budgetAccountsBalance} identity="budget" 
					expanded={this.props.sidebarState.budgetAccountsExpanded} setExpanded={this.props.setBudgetAccountsExpanded}>
					{budgetAccountNodes}
				</PAccountButtonContainer>
				<PAccountButtonContainer label="TRACKING" value={trackingAccountsBalance} identity="tracking"
					expanded={this.props.sidebarState.trackingAccountsExpanded} setExpanded={this.props.setTrackingAccountsExpanded}>
					{trackingAccountNodes}
				</PAccountButtonContainer>

				<RaisedButton label="Add Account" primary={true} onClick={this.onAddAccountClick} />

				<PAccountCreationDialog ref={(d)=> this.accountCreationDialog = d } onAddAccount={this.props.addAccount} />
			</div>
		);
  	}
}