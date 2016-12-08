/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form, Glyphicon, Modal } from 'react-bootstrap';

import { PLinkButton } from '../../common/PLinkButton'; 
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PReorderAccountsDialogProps {
	entitiesCollection:IEntitiesCollection
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PReorderAccountsDialogState {
	show:boolean;
}

const AccountsContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap",
	width: "100%",
	maxHeight: "400px",
	overflowY: "auto"
}

const AccountGroupContainerStyle:React.CSSProperties = {
	height: "31px",
	width: "100%",
	flex: "0 0 auto",
	display: "flex",
	flexFlow: 'row nowrap',
	alignItems: "center",
	backgroundColor: "#E5F5F9",
	borderColor: "#DFE4E9",
	borderStyle: "solid",
	borderTopWidth: "0px",
	borderBottomWidth: "1px",
	borderRightWidth: "0px",
	borderLeftWidth: "0px",
	paddingTop: "3px",
	paddingBottom: "3px",
	paddingLeft: "5px",
	paddingRight: "10px"
}

const AccountRowStyle:React.CSSProperties = {
	height: "31px",
	width: "100%",
	flex: "0 0 auto",
	display: "flex",
	flexFlow: 'row nowrap',
	alignItems: "center",
	color: "#003440",
	backgroundColor: "#FFFFFF",
	borderColor: "#DFE4E9",
	borderStyle: "solid",
	borderTopWidth: "0px",
	borderBottomWidth: "1px",
	borderRightWidth: "0px",
	borderLeftWidth: "0px",
	paddingTop: "3px",
	paddingBottom: "3px",
	paddingLeft: "5px",
	paddingRight: "10px"
}

const AccountGroupNameStyle:React.CSSProperties = {
	flex: "1 1 auto",
	fontSize: "14px",
	fontWeight: "bold",
	color: "#003440",
	marginBottom: "0px",
	marginTop: "3px"
}

const AccountNameStyle:React.CSSProperties = {
	flex: "1 1 auto",
	fontSize: "14px",
	fontWeight: "normal",
	color: "#003440",
	marginBottom: "0px",
	marginTop: "3px"
}

export class PReorderAccountsDialog extends React.Component<PReorderAccountsDialogProps, PReorderAccountsDialogState> {

	constructor(props:PReorderAccountsDialogProps) {
        super(props);
		this.hide = this.hide.bind(this);
		this.state = {
			show:false
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}
	
	public show():void {

		var state = Object.assign({}, this.state) as PReorderAccountsDialogState;
		state.show = true;
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PReorderAccountsDialogState;
		state.show = false;
		this.setState(state);
	}

	private onMoveAccountUpClick(account:budgetEntities.IAccount, event:React.MouseEvent<any>):void {

		event.stopPropagation();
		// Get the account that is above the account we are moving
		var accountAbove = this.props.entitiesCollection.accounts.getAccountAbove(account.entityId);
		if(accountAbove) {

			// We are going to swap the sortableIndices of these accounts
			var accountClone = Object.assign({}, account);
			var accountAboveClone = Object.assign({}, accountAbove);
			// Swap the sortableIndices in the clone objects
			accountClone.sortableIndex = accountAbove.sortableIndex;
			accountAboveClone.sortableIndex = account.sortableIndex;
			// Send these accounts for persistence
			this.props.updateEntities({
				accounts: [accountClone, accountAboveClone]
			});
		}
	}

	private onMoveAccountDownClick(account:budgetEntities.IAccount, event:React.MouseEvent<any>):void {

		event.stopPropagation();
		// Get the account that is below the account we are moving
		var accountBelow = this.props.entitiesCollection.accounts.getAccountBelow(account.entityId);
		if(accountBelow) {

			// We are going to swap the sortableIndices of these accounts
			var accountClone = Object.assign({}, account);
			var accountBelowClone = Object.assign({}, accountBelow);
			// Swap the sortableIndices in the clone objects
			accountClone.sortableIndex = accountBelow.sortableIndex;
			accountBelowClone.sortableIndex = account.sortableIndex;
			// Send these master categories for persistence
			this.props.updateEntities({
				accounts: [accountClone, accountBelowClone]
			});
		}
	}
	
	private getAccountItems():Array<JSX.Element> {

		var budgetAccountItems:Array<JSX.Element> = [];
		var trackingAccountItems:Array<JSX.Element> = [];
		var entitiesCollection = this.props.entitiesCollection;

		budgetAccountItems.push(
			<div key="budget-accounts" style={AccountGroupContainerStyle}>
				<span style={AccountGroupNameStyle}>Budget</span>
			</div>
		);

		trackingAccountItems.push(
			<div key="tracking-accounts" style={AccountGroupContainerStyle}>
				<span style={AccountGroupNameStyle}>Tracking</span>
			</div>
		);

		_.forEach(entitiesCollection.accounts.getNonTombstonedOpenAccounts(), (account)=>{

			let accountItem = (
				<div style={AccountRowStyle} key={account.entityId}>
					<span style={AccountNameStyle}>{account.accountName}</span>
					<Glyphicon glyph="arrow-up" className="reorder-arrow-glyph" style={{paddingRight:"10px"}} onClick={this.onMoveAccountUpClick.bind(this, account)} />
					<Glyphicon glyph="arrow-down" className="reorder-arrow-glyph" onClick={this.onMoveAccountDownClick.bind(this, account)} />
				</div>
			);

			if(account.onBudget == 1)
				budgetAccountItems.push(accountItem);
			else
				trackingAccountItems.push(accountItem);
		});

		return budgetAccountItems.concat(trackingAccountItems);
	}

	public render() {

		if(this.state.show) {

			var accountItems = this.getAccountItems();

			return (
				<div className="reorder-accounts-dialog">
					<Modal show={this.state.show} animation={true} onHide={this.hide} backdrop="static" keyboard={false}>
						<Modal.Header>
							<Modal.Title>Reorder Accounts</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<Form style={AccountsContainer}>
								<div>
									{accountItems}
								</div>
							</Form>
						</Modal.Body>
						<Modal.Footer>
							<button className="dialog-primary-button" onClick={this.hide}>
								Close&nbsp;<Glyphicon glyph="ok-sign" />
							</button>
						</Modal.Footer>
					</Modal>
				</div>
			);
		}
		else {
			return <div />;
		}
	}
}
