/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Checkbox, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { PHoverableDiv } from '../../common/PHoverableDiv';

import { SimpleObjectMap } from '../../../utilities';
import { ReportNames } from '../../../constants';
import { IAccount } from '../../../interfaces/budgetEntities';
import { IReportState, IEntitiesCollection } from '../../../interfaces/state';

export interface PAccountSelectionDialogProps {
	entitiesCollection:IEntitiesCollection;
	setReportState(reportState:IReportState):void;
}

export interface PAccountSelectionDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	selectedReport:string;
	reportState:IReportState;
	selectedAccountIdsMap:SimpleObjectMap<boolean>;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'250px'
}

const TitleStyle:React.CSSProperties = {
	width: "100%",
	color: "#000000",
	fontSize: "18px",
	fontWeight: "normal"
}

const Separator1Style:React.CSSProperties = {
	marginTop: "0px",
	marginBottom: "8px"
}

const Separator2Style:React.CSSProperties = {
	marginTop: "8px",
	marginBottom: "8px"
}

const SelectionButtonsContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: 'center',
	alignItems: 'center',
}

const SelectionButtonDefaultStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#009cc2",
	backgroundColor: "#FFFFFF",
	paddingLeft: '8px',
	paddingRight: '8px',
	paddingTop: '3px',
	paddingBottom: '3px',
	borderRadius: "100px",
	marginRight: "10px",
	cursor: "pointer"
}

const SelectionButtonHoverStyle = Object.assign({}, SelectionButtonDefaultStyle, {
	color: "#FFFFFF",
	backgroundColor: "#009cc2"
});

const DialogButtonsContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: 'flex-end',
	alignItems: 'center',
}

const AccountListContainerStyle:React.CSSProperties = {
	width: "100%",
	maxHeight: "300px",
	overflowY: "auto"
}

const ListStyle:React.CSSProperties = {
	width: "100%",
	borderStyle: "none",
	listStyleType: "none",
	paddingLeft: "0px"
}

const AccountCategoryListItem:React.CSSProperties = {
	marginTop: "0px",
	marginBottom: "0px",
}

const AccountCategoryNameStyle:React.CSSProperties = {
	fontWeight: "bold"
}

const AccountListItem:React.CSSProperties = {
	marginTop: "0px",
	marginBottom: "0px",
	paddingLeft: "20px"
}

export class PAccountSelectionDialog extends React.Component<PAccountSelectionDialogProps, PAccountSelectionDialogState> {

	constructor(props:PAccountSelectionDialogProps) {
        super(props);
		this.hide = this.hide.bind(this);
		this.handleSelectAllClicked = this.handleSelectAllClicked.bind(this);
		this.handleSelectNoneClicked = this.handleSelectNoneClicked.bind(this);
		this.handleCancelClicked = this.handleCancelClicked.bind(this);
		this.handleOkClicked = this.handleOkClicked.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"bottom",
			selectedReport: null,
			reportState: null,
			selectedAccountIdsMap: {}
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}
	
	public show(selectedReport:string, reportState:IReportState, target:HTMLElement, placement:string = "bottom"):void {

		// Clone the selected account ids array from the report state
		var selectedAccountIds = reportState.selectedAccountIds.slice();
		// Build a map of selected account ids so that we can quickly ascertain if an account is selected
		var selectedAccountIdsMap = {};
		_.forEach(selectedAccountIds, (selectedAccountId)=>{
			selectedAccountIdsMap[selectedAccountId] = true;
		});
		// Now iterate through all the accounts, and if they are not selected, set false against their
		// ids in the map. Include all accounts if this is for the "Net Worth" report. Otherwise only
		// include the budget accounts.
		var accounts = this.props.entitiesCollection.accounts.getNonTombstonedOpenAccounts();
		_.forEach(accounts, (account)=>{

			if(selectedReport == ReportNames.NetWorth || account.onBudget == 1) {
				if(selectedAccountIdsMap[account.entityId] != true)
					selectedAccountIdsMap[account.entityId] = false;
			}
		});

		var state = Object.assign({}, this.state) as PAccountSelectionDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		state.selectedReport = selectedReport;
		state.reportState = reportState;
		state.selectedAccountIdsMap = selectedAccountIdsMap;
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PAccountSelectionDialogState;
		state.show = false;
		state.selectedReport = null;
		state.reportState = null;
		state.selectedAccountIdsMap = null;
		this.setState(state);
	}

	private handleSelectAllClicked(event:React.MouseEvent<any>):void {

		var selectedAccountIdsMap = this.state.selectedAccountIdsMap;
		// Set all accounts to true in the selected accounts map
		var accountIds = _.keys(selectedAccountIdsMap);
		_.forEach(accountIds, (accountId)=>{
			selectedAccountIdsMap[accountId] = true;
		});

		var state = Object.assign({}, this.state);
		state.selectedAccountIdsMap = selectedAccountIdsMap;
		this.setState(state);
	}

	private handleSelectNoneClicked(event:React.MouseEvent<any>):void {

		var selectedAccountIdsMap = this.state.selectedAccountIdsMap;
		// Set all accounts to false in the selected accounts map
		var accountIds = _.keys(selectedAccountIdsMap);
		_.forEach(accountIds, (accountId)=>{
			selectedAccountIdsMap[accountId] = false;
		});

		var state = Object.assign({}, this.state);
		state.selectedAccountIdsMap = selectedAccountIdsMap;
		this.setState(state);
	}

	private handleCancelClicked(event:React.MouseEvent<any>):void {
		this.hide();
	}

	private handleOkClicked(event:React.MouseEvent<any>):void {

		var selectedAccountIds = [];
		// Build an array of accountIds that are selected
		var selectedAccountIdsMap = this.state.selectedAccountIdsMap;
		var accountIds = _.keys(selectedAccountIdsMap);

		var selectedAccountsCount = 0;
		var unselectedAccountsCount = 0;
		_.forEach(accountIds, (accountId)=>{
			if(selectedAccountIdsMap[accountId] == true) {
				selectedAccountIds.push(accountId);
				selectedAccountsCount++;
			}
			else
				unselectedAccountsCount++;
		});

		// Set the updated values back in the report state and send it back to the parent component
		var reportState = this.state.reportState;
		reportState.allAccountsSelected = (unselectedAccountsCount == 0);
		reportState.noCategoriesSelected = (selectedAccountsCount == 0);
		reportState.selectedAccountIds = selectedAccountIds;
		this.props.setReportState(reportState);
		this.hide();
	}

	private handleAccountCategoryClicked(onBudget:number, selected:boolean):void {

		var selectedAccountIdsMap = this.state.selectedAccountIdsMap;
		// Get all the accounts for this account category and select/unselect them
		var accounts = this.props.entitiesCollection.accounts.getNonTombstonedOpenAccounts();
		_.forEach(accounts, (account)=>{
			
			if(account.onBudget == onBudget)
				selectedAccountIdsMap[account.entityId] = selected;
		});

		var state = Object.assign({}, this.state);
		state.selectedAccountIdsMap = selectedAccountIdsMap;
		this.setState(state);
	} 

	private handleAccountClicked(accountId:string, selected:boolean):void {
		
		var selectedAccountIdsMap = this.state.selectedAccountIdsMap;
		selectedAccountIdsMap[accountId] = selected;
			
		var state = Object.assign({}, this.state);
		state.selectedAccountIdsMap = selectedAccountIdsMap;
		this.setState(state);
	} 

	private getListItemForAccountCategory(onBudget:number, accounts:Array<IAccount>):JSX.Element {

		var accountCategorySelected = false;
		// The acount category is going to be selected if any of it's account is selected
		var selectedAccountIdsMap = this.state.selectedAccountIdsMap;
		_.forEach(accounts, (account)=>{

			if(account.onBudget == onBudget) {
				// Is this account selected or not
				var accountSelected = selectedAccountIdsMap[account.entityId];
				if(accountSelected == true) {
					accountCategorySelected = true;
					return false;
				}
			}
		});

		return (
			<Checkbox 
				key={onBudget == 1 ? "onbudget_accounts" : "tracking_accounts"}
				style={AccountCategoryListItem} 
				checked={accountCategorySelected} 
				onChange={this.handleAccountCategoryClicked.bind(this, onBudget, !accountCategorySelected)}>
				
				<div style={AccountCategoryNameStyle}>{onBudget == 1 ? "Budget Accounts" : "Tracking Accounts"}</div>
			</Checkbox>
		);
	}

	private getListItemForAccount(account:IAccount):JSX.Element {

		var selectedAccountIdsMap = this.state.selectedAccountIdsMap;
		var accountSelected = selectedAccountIdsMap[account.entityId];

		return (
			<Checkbox 
				key={account.entityId}
				style={AccountListItem} 
				checked={accountSelected != false} 
				onChange={this.handleAccountClicked.bind(this, account.entityId, !accountSelected)}>
				
				{account.accountName}
			</Checkbox>
		);
	}
	
	public render() {

		if(this.state.show) {
			
			var accountItems:Array<JSX.Element> = [];
			// Get all the accounts and build list items for them
			var accounts = this.props.entitiesCollection.accounts.getNonTombstonedOpenAccounts();
			// First add the "Budget Account" account category node, and all the budget account nodes
			accountItems.push(
				this.getListItemForAccountCategory(1, accounts)
			);
			_.forEach(accounts, (account)=>{

				if(account.onBudget == 1) {
					let accountItem = this.getListItemForAccount(account);
					accountItems.push(accountItem);
				}
			});

			// Next add the "Tracking Account" account category node, and all the tracking account nodes
			// This is to be done only for the "Net Worth" report
			if(this.state.selectedReport == ReportNames.NetWorth) {

				accountItems.push(
					this.getListItemForAccountCategory(0, accounts)
				);
				_.forEach(accounts, (account)=>{

					if(account.onBudget == 0) {
						let accountItem = this.getListItemForAccount(account);
						accountItems.push(accountItem);
					}
				});
			}

			return (
				<Overlay key="overlay" rootClose={true} show={this.state.show} placement={this.state.placement} 
					onHide={this.hide} target={ ()=> ReactDOM.findDOMNode(this.state.target) }>
					<Popover id="selectReportAccountsPopover" style={PopoverStyle}>
						<div style={TitleStyle}>Accounts</div>
						<hr style={Separator1Style} />

						<div style={SelectionButtonsContainer}>
							<PHoverableDiv 
								defaultStyle={SelectionButtonDefaultStyle} 
								hoverStyle={SelectionButtonHoverStyle} 
								onClick={this.handleSelectAllClicked}>
								Select All
							</PHoverableDiv> 
							<PHoverableDiv 
								defaultStyle={SelectionButtonDefaultStyle} 
								hoverStyle={SelectionButtonHoverStyle} 
								onClick={this.handleSelectNoneClicked}>
								Select None
							</PHoverableDiv> 
						</div>
						<hr style={Separator2Style} />

						<div style={AccountListContainerStyle}>
							<ul style={ListStyle}>
								{accountItems}
							</ul>
						</div>

						<hr style={Separator2Style} />
						<div className="buttons-container">
							<div className="spacer" />
							<button className="dialog-secondary-button" onClick={this.handleCancelClicked}> 
								Cancel&nbsp;<Glyphicon glyph="remove-circle"/>
							</button>
							<div style={{width:"8px"}} />
							<button className="dialog-primary-button" onClick={this.handleOkClicked}> 
								Done&nbsp;<Glyphicon glyph="ok-circle"/>
							</button>
						</div>
					</Popover>
				</Overlay>
			);
		}
		else {
			return <div />;
		}
	}
}
