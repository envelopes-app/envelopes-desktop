/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import MailOutline from 'material-ui/svg-icons/communication/mail-outline';
import AccountBalance from 'material-ui/svg-icons/action/account-balance';

import { PContainer } from '../common/PContainer';
import { PModuleButton } from './PModuleButton';
import { PAccountButtonContainer } from './PAccountButtonContainer';
import { PAccountButton } from './PAccountButton';
import { PAccountCreationDialog } from './PAccountCreationDialog';

import ColorPalette from '../common/ColorPalette';
import { EntityFactory } from '../../persistence';
import { IAccount } from '../../interfaces/budgetEntities';
import { ISidebarState } from '../../interfaces/state';

const PSidebarStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	height: "100%",
	backgroundColor: ColorPalette.Shade500,
};

const PModuleButtonStyle = {
	flex: "0 0 auto"
};

const PDividerStyle = {
	flex: "0 0 auto",
	backgroundColor: ColorPalette.Shade600
}

const PContainerStyle = {
	flex: "1 1 100%",
	overflowY: "scroll"
}

const PButtonStyle = {
	flex: "0 0 auto"
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
			<div style={PSidebarStyle}>
				<PModuleButton label="Budget" selected={false}>
					<MailOutline style={ModuleButtonIconStyle} />
				</PModuleButton>
				<PModuleButton label="All Accounts" selected={false}>
					<AccountBalance style={ModuleButtonIconStyle} />
				</PModuleButton>
				<Divider style={PDividerStyle} />
				<div style={PContainerStyle}>
					<PAccountButtonContainer label="BUDGET" value={budgetAccountsBalance} identity="budget" 
						expanded={this.props.sidebarState.budgetAccountsExpanded} setExpanded={this.props.setBudgetAccountsExpanded}>
						{budgetAccountNodes}
					</PAccountButtonContainer>
					<PAccountButtonContainer label="TRACKING" value={trackingAccountsBalance} identity="tracking"
						expanded={this.props.sidebarState.trackingAccountsExpanded} setExpanded={this.props.setTrackingAccountsExpanded}>
						{trackingAccountNodes}
					</PAccountButtonContainer>
				</div>

				<RaisedButton style={PButtonStyle} label="Add Account" primary={true} onClick={this.onAddAccountClick} />

				<PAccountCreationDialog ref={(d)=> this.accountCreationDialog = d } onAddAccount={this.props.addAccount} />
			</div>
		);
  	}
}