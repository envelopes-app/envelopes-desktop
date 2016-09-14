/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PRegisterHeader } from './PRegisterHeader';
import { PRegisterToolbar } from './PRegisterToolbar';
import { PRegisterDataGrid } from './PRegisterDataGrid';
import { PTransactionDialog } from './trxDialogs/PTransactionDialog';

import './SRegister.css';

import * as budgetEntities from '../../interfaces/budgetEntities';
import { IApplicationState, IEntitiesCollection, IRegisterState } from '../../interfaces/state';

export interface PRegisterProps {
	// State Variables
	applicationState: IApplicationState;
	// Dispatcher Functions
	addTransaction:(transaction:budgetEntities.ITransaction, subTranactions:Array<budgetEntities.ISubTransaction>)=>void;	
	updateTransaction:(transaction:budgetEntities.ITransaction, subTranactions:Array<budgetEntities.ISubTransaction>)=>void;
}

const RegisterContainerStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	height: '100%',
	width: '100%'
}

export class PRegister extends React.Component<PRegisterProps, {}> {

	private transactionDialog:PTransactionDialog;

	constructor(props: any) {
        super(props);
		this.onAddTransactionSelected = this.onAddTransactionSelected.bind(this);
    }

	// *******************************************************************************************************
	// Action Handlers for commands in the Regsiter Toolbar
	// *******************************************************************************************************
	private onAddTransactionSelected():void {

		// Determine which account we are showing from the sidebar state
		var accountId:string;
		var sidebarState = this.props.applicationState.sidebarState;

		if(sidebarState.selectedTab == "All Accounts") {
			accountId = null;
		}
		else if(sidebarState.selectedTab == "Account") {

			var accounts = this.props.applicationState.entitiesCollection.accounts;
			var account = accounts.getEntityById(sidebarState.selectedAccountId);
			accountId = account.entityId;
		}

		this.transactionDialog.show(accountId);
	}

	// *******************************************************************************************************
	// *******************************************************************************************************

	private updateEntities(entities:IEntitiesCollection):void {

	}

	public render() {

		var accountName:string;
		var clearedBalance:number = 0;
		var unclearedBalance:number = 0;
		var workingBalance:number = 0;
		var isAllAccounts:boolean = true;

		var entitiesCollection = this.props.applicationState.entitiesCollection;

		// Determine which account we are showing from the sidebar state
		var accounts:Array<budgetEntities.IAccount>;
		var sidebarState = this.props.applicationState.sidebarState;
		if(sidebarState.selectedTab == "All Accounts") {

			accountName = "All Accounts";
			accounts = entitiesCollection.accounts;
			isAllAccounts = true;
		}
		else if(sidebarState.selectedTab == "Account") {

			var account = entitiesCollection.accounts.getEntityById(sidebarState.selectedAccountId);
			accountName = account.accountName;
			accounts = [account];
			isAllAccounts = false;
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
					onAddTransactionSelected={this.onAddTransactionSelected}
				/>
				<PRegisterDataGrid showAccountsColumn={isAllAccounts}/>

				<PTransactionDialog title="Add Transaction"
					ref={(d)=> this.transactionDialog = d }
					entitiesCollection={entitiesCollection}
					updateEntities={this.updateEntities} 
				/>
			</div>
		);
  	}
}