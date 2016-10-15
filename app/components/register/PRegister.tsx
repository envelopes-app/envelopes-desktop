/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PRegisterHeader } from './header/PRegisterHeader';
import { PRegisterToolbar } from './toolbar/PRegisterToolbar';
import { PRegisterDataGrid } from './dataGrid/PRegisterDataGrid';
import { PTransactionDialog } from './trxDialog/PTransactionDialog';

import { SimpleObjectMap, Logger } from '../../utilities';
import * as budgetEntities from '../../interfaces/budgetEntities';
import { IApplicationState, ISimpleEntitiesCollection, IRegisterState } from '../../interfaces/state';

export interface PRegisterProps {
	// State Variables
	applicationState: IApplicationState;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PRegisterState {
	registersState: SimpleObjectMap<IRegisterState>;
}

const RegisterContainerStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	height: '100%',
	width: '100%'
}

export class PRegister extends React.Component<PRegisterProps, PRegisterState> {

	private transactionDialog:PTransactionDialog;

	constructor(props: any) {
        super(props);
		this.selectTransaction = this.selectTransaction.bind(this);
		this.unselectTransaction = this.unselectTransaction.bind(this);
		this.selectAllTransactions = this.selectAllTransactions.bind(this);
		this.unselectAllTransactions = this.unselectAllTransactions.bind(this);
		this.onAddTransactionSelected = this.onAddTransactionSelected.bind(this);
		this.state = {registersState:{}};
    }

	private getActiveAccount():string {

		var activeAccount:string;
		// Determine which account we are showing from the sidebar state
		var sidebarState = this.props.applicationState.sidebarState;
		if(sidebarState.selectedTab == "All Accounts")
			activeAccount = "All_Accounts";
		else if(sidebarState.selectedTab == "Account")
			activeAccount = sidebarState.selectedAccountId;

		return activeAccount;
	}

	private getRegisterStateForAccount(accountId:string):IRegisterState {

		// Check if we already have the register state object created for this account.
		// If it is not already created, then create it now.
		var registerState = this.state.registersState[accountId];
		if(!registerState) {

			registerState = {
				selectedTransactions: [],
				selectedTransactionsMap: {}
			};
		}

		return registerState;
	}

	private updateRegisterStateForAccount(accountId:string, registerState:IRegisterState):void {

		var state = _.assign({}, this.state) as PRegisterState;
		state.registersState[accountId] = registerState;
		this.setState(state);
	}

	// *******************************************************************************************************
	// Methods that update the local register state
	// *******************************************************************************************************
	private selectTransaction(transactionId:string, unselectAllOthers:boolean):void {
		
		// Get the register state for the active account
		var activeAccount = this.getActiveAccount();
		var registerState = this.getRegisterStateForAccount(activeAccount);
		if(unselectAllOthers) {
			registerState.selectedTransactions = [];
			registerState.selectedTransactionsMap = {};
		}

		// Mark the passed transaction id as selected
		registerState.selectedTransactions.push(transactionId);
		registerState.selectedTransactionsMap[transactionId] = true;
		this.updateRegisterStateForAccount(activeAccount, registerState);
	}

	private unselectTransaction(transactionId:string):void {

		// Get the register state for the active account
		var activeAccount = this.getActiveAccount();
		var registerState = this.getRegisterStateForAccount(activeAccount);

		// Mark the passed transaction id as unselected
		var index = _.findIndex(registerState.selectedTransactions, {entityId: transactionId});
		registerState.selectedTransactions.splice(index, 1);
		registerState.selectedTransactionsMap[transactionId] = false;
		this.updateRegisterStateForAccount(activeAccount, registerState);
	}

	private editTrasaction(transactionId:string, focusOnField:string):void {

	}

	private selectAllTransactions():void {

	}

	private unselectAllTransactions():void {

	}

	// *******************************************************************************************************
	// Action Handlers for commands in the Regsiter Toolbar
	// *******************************************************************************************************
	private onAddTransactionSelected():void {

		// Determine which account we are showing from the sidebar state
		var accountId:string = null;
		var entitiesCollection = this.props.applicationState.entitiesCollection;
		var sidebarState = this.props.applicationState.sidebarState;

		if(sidebarState.selectedTab == "All Accounts") {
			var account = entitiesCollection.accounts.getDefaultAccount();
			if(!account) {
				// If no account was passed, and neither were we able to select a default one, then 
				// that means there are no usable accounts in the budget.
				Logger.info("We cannot show the Transaction Dialog as there are no open accounts.");
			}
			else {
				accountId = account.entityId;
			}
		}
		else if(sidebarState.selectedTab == "Account") {

			var accounts = this.props.applicationState.entitiesCollection.accounts;
			var account = accounts.getEntityById(sidebarState.selectedAccountId);
			accountId = account.entityId;
		}

		if(accountId)
			this.transactionDialog.showForNewTransaction(accountId);
	}

	// *******************************************************************************************************
	// *******************************************************************************************************
	public render() {

		var accountName:string;
		var clearedBalance:number = 0;
		var unclearedBalance:number = 0;
		var workingBalance:number = 0;
		var isAllAccounts:boolean = true;
		var currentAccountId:string = null;
		var registerState:IRegisterState = null;
		var entitiesCollection = this.props.applicationState.entitiesCollection;

		// Determine which account we are showing from the sidebar state
		var accounts:Array<budgetEntities.IAccount>;
		var sidebarState = this.props.applicationState.sidebarState;
		if(sidebarState.selectedTab == "All Accounts") {

			accountName = "All Accounts";
			accounts = entitiesCollection.accounts;
			isAllAccounts = true;
			currentAccountId = null;
			registerState = this.getRegisterStateForAccount("All_Accounts");
		}
		else if(sidebarState.selectedTab == "Account") {

			var account = entitiesCollection.accounts.getEntityById(sidebarState.selectedAccountId);
			accountName = account.accountName;
			accounts = [account];
			isAllAccounts = false;
			currentAccountId = account.entityId;
			registerState = this.getRegisterStateForAccount(currentAccountId);
		}

		// Calculate the cleared and uncleared balance values for the displayed account/s
		_.forEach(accounts, (account)=>{
			clearedBalance += (account.clearedBalance ? account.clearedBalance : 0);
			unclearedBalance += (account.unclearedBalance ? account.unclearedBalance : 0);
		});

		// Calculate the working balance
		workingBalance = clearedBalance + unclearedBalance;

    	return (
			<div style={RegisterContainerStyle}>
				<PRegisterHeader accountName={accountName} clearedBalance={clearedBalance} 
					unclearedBalance={unclearedBalance} workingBalance={workingBalance} showReconcileButton={isAllAccounts == false} />

				<PRegisterToolbar 
					registerState={registerState}
					onAddTransactionSelected={this.onAddTransactionSelected} />

				<PRegisterDataGrid isAllAccounts={isAllAccounts} accountId={currentAccountId} 
					entitiesCollection={this.props.applicationState.entitiesCollection}
					updateEntities={this.props.updateEntities} registerState={registerState}
					selectTransaction={this.selectTransaction}
					unselectTransaction={this.unselectTransaction}
					editTrasaction={this.editTrasaction}
					selectAllTransactions={this.selectAllTransactions}
					unselectAllTransactions={this.unselectAllTransactions} />

				<PTransactionDialog dialogTitle="Add Transaction"
					ref={(d)=> this.transactionDialog = d }
					entitiesCollection={entitiesCollection}
					updateEntities={this.props.updateEntities} />
			</div>
		);
  	}
}