/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon } from 'react-bootstrap';
import MailOutline from 'material-ui/svg-icons/communication/mail-outline';
import AccountBalance from 'material-ui/svg-icons/action/account-balance';

import { PModuleButton } from './PModuleButton';
import { PAccountButtonContainer } from './PAccountButtonContainer';
import { PAccountButton } from './PAccountButton';
import { PAccountEditDialog } from './dialogs/PAccountEditDialog';
import { PAccountCreationDialog } from './dialogs/PAccountCreationDialog';
import { PAccountClosingDialog } from './dialogs/PAccountClosingDialog';
import { PReorderAccountsDialog } from './dialogs/PReorderAccountsDialog';

import * as collections from '../../collections';
import { DataFormats, DataFormatter } from '../../utilities';
import { IDataFormat } from '../../interfaces/formatters';
import { IAccount } from '../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection, ISidebarState } from '../../interfaces/state';

export interface PSidebarProps {
	// State Variables
	sidebarState: ISidebarState;
	activeBudgetId:string;
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	setExpanded:(expanded:boolean)=>void;
	setSelectedTab: (selectedTab:string, selectedAccountId:string)=>void;
	addAccount: (account:IAccount, currentBalance:number)=>void;
	updateAccount: (account:IAccount, currentBalance:number)=>void;
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PSidebarState {
	dataFormat:string;
	dataFormatter:DataFormatter;
	budgetAccountsExpanded:boolean;
	trackingAccountsExpanded:boolean;
	closedAccountsExpanded:boolean;
}

const PSidebarExpandedStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'column nowrap',
	height: "100%",
	width: "260px",
	backgroundImage: "linear-gradient(#34aebe, #227e99)"
};

const PSidebarCollapsedStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'column nowrap',
	alignItems: 'center',
	justifyContent: 'center',
	height: "100%",
	width: "30px",
	backgroundImage: "linear-gradient(#34aebe, #227e99)",
	cursor: "pointer"
};

const PModuleButtonStyle:React.CSSProperties = {
	flex: "0 0 auto"
};

const PContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	width: "100%",
	height: "100%",
	overflowY: "auto"
}

const ModuleButtonIconStyle:React.CSSProperties = {
	display: 'inline-block',
	color: 'rgba(0, 0, 0, 0.870588)',
	fill: 'rgb(255, 255, 255)',
	height: '24px',
	width: '24px',
	verticalAlign: 'middle',
	marginLeft: '12px',
	marginRight: '0px'
}

const PBottomButtonsContainer:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'row nowrap',
	alignItems: "center",
	width: "100%"
};

export class PSidebar extends React.Component<PSidebarProps, PSidebarState> {
  
	private accountEditDialog:PAccountEditDialog;
	private accountCreationDialog:PAccountCreationDialog;
	private accountClosingDialog:PAccountClosingDialog;
	private reorderAccountsDialog:PReorderAccountsDialog;

	constructor(props:PSidebarProps) {
        super(props);
		this.setBudgetAccountsExpanded = this.setBudgetAccountsExpanded.bind(this);
		this.setTrackingAccountsExpanded = this.setTrackingAccountsExpanded.bind(this);
		this.setClosedAccountsExpanded = this.setClosedAccountsExpanded.bind(this);
		this.onBudgetSelect = this.onBudgetSelect.bind(this);
		this.onAllAccountsSelect = this.onAllAccountsSelect.bind(this);
		this.onAccountSelect = this.onAccountSelect.bind(this);
		this.onAddAccountClick = this.onAddAccountClick.bind(this);
		this.onReorderAccountsClick = this.onReorderAccountsClick.bind(this);
		this.onCollapseClick = this.onCollapseClick.bind(this);
		this.onExpandClick = this.onExpandClick.bind(this);
		this.showAccountEditDialog = this.showAccountEditDialog.bind(this);
		this.showAccountClosingDialog = this.showAccountClosingDialog.bind(this);
		// Default the formatter to en_US so that we have something to work with at startup
		var dataFormat = DataFormats.locale_mappings["en_US"];
		this.state = {
			dataFormat: JSON.stringify(dataFormat),
			dataFormatter: new DataFormatter(dataFormat),
			budgetAccountsExpanded: true,
			trackingAccountsExpanded: false,
			closedAccountsExpanded: false
		}
	}

	public componentWillReceiveProps(nextProps:PSidebarProps):void {

		// If the dataFormat in the active budget has changed, then recreate the dataFormatter.
		var activeBudgetId = nextProps.activeBudgetId;
		if(activeBudgetId && nextProps.entitiesCollection.budgets) {

			var activeBudget = nextProps.entitiesCollection.budgets.getEntityById(activeBudgetId);
			if(activeBudget && activeBudget.dataFormat != this.state.dataFormat) {
				var dataFormat = JSON.parse(activeBudget.dataFormat) as IDataFormat;
				var dataFormatter = new DataFormatter(dataFormat);
				var state = Object.assign({}, this.state) as PSidebarState;
				state.dataFormat = activeBudget.dataFormat;
				state.dataFormatter = dataFormatter;
				this.setState(state);
			}
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

	private onBudgetSelect():void {
		// If the "Budget" tab is not already the selected tab then
		if(this.props.sidebarState.selectedTab != "Budget") {

			// Set the "Budget" as selected tab in the sidebar state 
			this.props.setSelectedTab("Budget", null);
			// Navigate to the Budget
		}
	}

	private onAllAccountsSelect():void {
		// If the "Budget" tab is not already the selected tab then
		if(this.props.sidebarState.selectedTab != "All Accounts") {

			// Set the "All Accounts" as selected tab in the sidebar state 
			this.props.setSelectedTab("All Accounts", null);
			// Navigate to All Accounts
		}
	}

	private onAccountSelect(accountId:string):void {

		// If the selection is not already set to this particular account then
		if(this.props.sidebarState.selectedTab != "Account" || this.props.sidebarState.selectedAccountId != accountId) {

			// Set the "Account" as selected tab in the sidebar state 
			this.props.setSelectedTab("Account", accountId);
		}
	}

	private onAddAccountClick(event:React.MouseEvent<any>):void {

		if(this.accountCreationDialog.isShowing() == false) {
			this.accountCreationDialog.show();
		}
	}

	private onReorderAccountsClick(event:React.MouseEvent<any>):void {

		var accounts = this.props.entitiesCollection.accounts.getNonTombstonedOpenAccounts();
		if(accounts.length > 1 && this.reorderAccountsDialog.isShowing() == false) {
			this.reorderAccountsDialog.show();
		}
	}

	private onCollapseClick(event:React.MouseEvent<any>):void {
		this.props.setExpanded(false);
	}

	private onExpandClick(event:React.MouseEvent<any>):void {
		this.props.setExpanded(true);
	}

	private showAccountEditDialog(account:IAccount, target:HTMLElement):void {
		// Show the popover for editing the account
		this.accountEditDialog.show(account, target);
	}

	private showAccountClosingDialog(account:IAccount):void {
		// Show the popover for closing the account
		this.accountClosingDialog.show(account);
	}

	private getAccountButtonContainerNodes():Array<JSX.Element> {

		var budgetAccountNodes = [];
		var trackingAccountNodes = [];
		var closedAccountNodes = [];
		var budgetAccountsBalance:number = 0;
		var trackingAccountsBalance:number = 0;

		var accountButtonContainers:Array<JSX.Element> = [];
		var entitiesCollection = this.props.entitiesCollection; 
		if(entitiesCollection.accounts) {

			_.forEach(entitiesCollection.accounts.getAllItems(), (account)=>{

				if(account.isTombstone == 0) {
					// Is this account button selected?
					var accountSelected = (this.props.sidebarState.selectedTab == "Account" && this.props.sidebarState.selectedAccountId == account.entityId); 
					var accountBalance = account.clearedBalance + account.unclearedBalance;
					var accountNode = <PAccountButton 
											account={account} 
											selectAccount={this.onAccountSelect} 
											updateAccount={this.props.updateAccount} 
											key={account.entityId} 
											selected={accountSelected}
											dataFormatter={this.state.dataFormatter}
											showAccountEditDialog={this.showAccountEditDialog} />;

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
				}
			});

			if(budgetAccountNodes.length > 0) {
				accountButtonContainers.push(
					<PAccountButtonContainer 
						key="budget-accounts-container" 
						label="BUDGET" 
						value={budgetAccountsBalance} 
						identity="budget" 
						expanded={this.state.budgetAccountsExpanded} 
						dataFormatter={this.state.dataFormatter}
						setExpanded={this.setBudgetAccountsExpanded}>
						{budgetAccountNodes}
					</PAccountButtonContainer>
				);
			}

			if(trackingAccountNodes.length > 0) {
				accountButtonContainers.push(
					<PAccountButtonContainer 
						key="tracking-accounts-container" 
						label="TRACKING" 
						value={trackingAccountsBalance} 
						identity="tracking"
						expanded={this.state.trackingAccountsExpanded}
						dataFormatter={this.state.dataFormatter} 
						setExpanded={this.setTrackingAccountsExpanded}>
						{trackingAccountNodes}
					</PAccountButtonContainer>
				);
			}

			if(closedAccountNodes.length > 0) {
				accountButtonContainers.push(
					<PAccountButtonContainer 
						key="closed-accounts-container" 
						label="CLOSED" 
						identity="closed"
						expanded={this.state.closedAccountsExpanded} 
						dataFormatter={this.state.dataFormatter}
						setExpanded={this.setClosedAccountsExpanded}>
						{closedAccountNodes}
					</PAccountButtonContainer>
				);
			}
		}

		return accountButtonContainers;
	}

  	public render() {
		
		if(this.props.entitiesCollection.accounts) {

			var isBudgetSelected:boolean = this.props.sidebarState.selectedTab == "Budget";
			var isAllAccountsSelected:boolean = this.props.sidebarState.selectedTab == "All Accounts";
			var accountButtonContainers:Array<JSX.Element> = this.getAccountButtonContainerNodes();

			if(this.props.sidebarState.expanded) {
				return (
					<div style={PSidebarExpandedStyle}>
						<PModuleButton label="Budget" selected={isBudgetSelected} onClick={this.onBudgetSelect}>
							<MailOutline style={ModuleButtonIconStyle} />
						</PModuleButton>
						<PModuleButton label="All Accounts" selected={isAllAccountsSelected} onClick={this.onAllAccountsSelect}>
							<AccountBalance style={ModuleButtonIconStyle} />
						</PModuleButton>
						<hr className="sidebar-horizontal-rule" />
						<div style={PContainerStyle}>
							{accountButtonContainers}
						</div>

						<div style={PBottomButtonsContainer}>
							<button className="sidebar-button" title="Reorder Accounts" onClick={this.onReorderAccountsClick}>
								<Glyphicon glyph="retweet"/>
							</button>
							<button className="sidebar-button" title="Add Account" style={{flex:"1 1 auto"}} onClick={this.onAddAccountClick}>
								<Glyphicon glyph="plus-sign"/>&nbsp;Add Account
							</button>
							<button className="sidebar-button" title="Collapse Sidebar" onClick={this.onCollapseClick}>
								<Glyphicon glyph="chevron-left"/>
							</button>
						</div>

						<PAccountCreationDialog 
							ref={(d)=> this.accountCreationDialog = d } 
							dataFormatter={this.state.dataFormatter}
							entitiesCollection={this.props.entitiesCollection}
							addAccount={this.props.addAccount} 
						/>

						<PAccountEditDialog 
							ref={(d)=> { this.accountEditDialog = d; }}
							dataFormatter={this.state.dataFormatter}
							entitiesCollection={this.props.entitiesCollection}
							showAccountClosingDialog={this.showAccountClosingDialog}
							updateAccount={this.props.updateAccount}
							updateEntities={this.props.updateEntities}
						/>

						<PAccountClosingDialog 
							ref={(d)=> { this.accountClosingDialog = d; }}
							dataFormatter={this.state.dataFormatter}
							entitiesCollection={this.props.entitiesCollection}
							updateEntities={this.props.updateEntities}
						/>

						<PReorderAccountsDialog 
							ref={(d)=> { this.reorderAccountsDialog = d; }}
							entitiesCollection={this.props.entitiesCollection}
							updateEntities={this.props.updateEntities}
						/>
					</div>
				);
			}
			else {
				return (
					<div style={PSidebarCollapsedStyle} onClick={this.onExpandClick}>
						<Glyphicon glyph="chevron-right" style={{fontSize:"18px", color:"#FFFFFF"}}/>
					</div>
				);
			}
		}
		else {
			return <div />;
		}
  	}
}