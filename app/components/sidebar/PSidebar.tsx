/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import MailOutline from 'material-ui/svg-icons/communication/mail-outline';
import AccountBalance from 'material-ui/svg-icons/action/account-balance';

import { PModuleButton } from './PModuleButton';
import { PAccountButtonContainer } from './PAccountButtonContainer';
import { PAccountButton } from './PAccountButton';
import { PAccountCreationDialog } from './dialogs/PAccountCreationDialog';

import ColorPalette from '../common/ColorPalette';
import { EntityFactory } from '../../persistence';
import { IAccount } from '../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection, ISidebarState } from '../../interfaces/state';
import * as collections from '../../collections';

export interface PSidebarProps {
	// State Variables
	sidebarState: ISidebarState;
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	setSelectedTab: (selectedTab:string, selectedAccountId:string)=>void;
	addAccount: (account:IAccount, currentBalance:number)=>void;
	updateAccount: (account:IAccount, currentBalance:number)=>void;
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PSidebarState {
	budgetAccountsExpanded:boolean;
	trackingAccountsExpanded:boolean;
	closedAccountsExpanded:boolean;
}

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

export class PSidebar extends React.Component<PSidebarProps, PSidebarState> {
  
	private accountCreationDialog:PAccountCreationDialog;

	constructor(props: any) {
        super(props);
		this.setBudgetAccountsExpanded = this.setBudgetAccountsExpanded.bind(this);
		this.setTrackingAccountsExpanded = this.setTrackingAccountsExpanded.bind(this);
		this.setClosedAccountsExpanded = this.setClosedAccountsExpanded.bind(this);
		this.onBudgetSelect = this.onBudgetSelect.bind(this);
		this.onAllAccountsSelect = this.onAllAccountsSelect.bind(this);
		this.onAccountSelect = this.onAccountSelect.bind(this);
		this.onAddAccountClick = this.onAddAccountClick.bind(this);
		this.state = {
			budgetAccountsExpanded: true,
			trackingAccountsExpanded: false,
			closedAccountsExpanded: false
		}
	}

	private setBudgetAccountsExpanded(expanded:boolean):void {

		var state = Object.assign({}, this.state) as PSidebarState;
		state.budgetAccountsExpanded = expanded;
		this.setState(state);
	}

	private setTrackingAccountsExpanded(expanded:boolean):void {

		var state = Object.assign({}, this.state) as PSidebarState;
		state.trackingAccountsExpanded = expanded;
		this.setState(state);
	}

	private setClosedAccountsExpanded(expanded:boolean):void {

		var state = Object.assign({}, this.state) as PSidebarState;
		state.closedAccountsExpanded = expanded;
		this.setState(state);
	}

	private onBudgetSelect() {
		// If the "Budget" tab is not already the selected tab then
		if(this.props.sidebarState.selectedTab != "Budget") {

			// Set the "Budget" as selected tab in the sidebar state 
			this.props.setSelectedTab("Budget", null);
			// Navigate to the Budget
		}
	}

	private onAllAccountsSelect() {
		// If the "Budget" tab is not already the selected tab then
		if(this.props.sidebarState.selectedTab != "All Accounts") {

			// Set the "All Accounts" as selected tab in the sidebar state 
			this.props.setSelectedTab("All Accounts", null);
			// Navigate to All Accounts
		}
	}

	private onAccountSelect(accountId:string) {

		// If the selection is not already set to this particular account then
		if(this.props.sidebarState.selectedTab != "Account" || this.props.sidebarState.selectedAccountId != accountId) {

			// Set the "Account" as selected tab in the sidebar state 
			this.props.setSelectedTab("Account", accountId);
			// Navigate to this account
		}
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
		var isBudgetSelected:boolean = this.props.sidebarState.selectedTab == "Budget";
		var isAllAccountsSelected:boolean = this.props.sidebarState.selectedTab == "All Accounts";

		if(this.props.entitiesCollection.accounts) {

			_.forEach(this.props.entitiesCollection.accounts.getAllItems(), (account)=>{

				// Is this account button selected?
				var accountSelected = (this.props.sidebarState.selectedTab == "Account" && this.props.sidebarState.selectedAccountId == account.entityId); 
				var accountNode = <PAccountButton account={account} selectAccount={this.onAccountSelect} updateAccount={this.props.updateAccount} key={account.entityId} selected={accountSelected} />;
				var accountBalance = account.clearedBalance + account.unclearedBalance;

				if(account.onBudget == 1 && account.closed == 0) {
					budgetAccountNodes.push(accountNode);
					budgetAccountsBalance += accountBalance;
				}
				else if(account.onBudget == 0 && account.closed == 0) {
					trackingAccountNodes.push(accountNode);
					trackingAccountsBalance += accountBalance;
				}
				else if(account.closed == 1) {
					closedAccountNodes.push(accountNode);
				}
			});

			return (
				<div style={PSidebarStyle}>
					<PModuleButton label="Budget" selected={isBudgetSelected} onClick={this.onBudgetSelect}>
						<MailOutline style={ModuleButtonIconStyle} />
					</PModuleButton>
					<PModuleButton label="All Accounts" selected={isAllAccountsSelected} onClick={this.onAllAccountsSelect}>
						<AccountBalance style={ModuleButtonIconStyle} />
					</PModuleButton>
					<Divider style={PDividerStyle} />
					<div style={PContainerStyle}>
						<PAccountButtonContainer label="BUDGET" value={budgetAccountsBalance} identity="budget" 
							expanded={this.state.budgetAccountsExpanded} setExpanded={this.setBudgetAccountsExpanded}>
							{budgetAccountNodes}
						</PAccountButtonContainer>
						<PAccountButtonContainer label="TRACKING" value={trackingAccountsBalance} identity="tracking"
							expanded={this.state.trackingAccountsExpanded} setExpanded={this.setTrackingAccountsExpanded}>
							{trackingAccountNodes}
						</PAccountButtonContainer>
					</div>

					<RaisedButton style={PButtonStyle} label="Add Account" primary={true} onClick={this.onAddAccountClick} />

					<PAccountCreationDialog ref={(d)=> this.accountCreationDialog = d } onAddAccount={this.props.addAccount} />
				</div>
			);
		}
		else {
			return <div />;	
		}
  	}
}