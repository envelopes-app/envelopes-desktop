/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PRegisterMessageBar } from './messageBar/PRegisterMessageBar';
import { PRegisterHeader } from './header/PRegisterHeader';
import { PRegisterToolbar } from './toolbar/PRegisterToolbar';
import { PRegisterDataGrid } from './dataGrid/PRegisterDataGrid';
import { PFlagSelectionDialog } from './dialogs/PFlagSelectionDialog';
import { PFilterTransactionsDialog } from './dialogs/PFilterTransactionsDialog';
import { PReconcileAccountDialog } from './dialogs/PReconcileAccountDialog';
import { PTransactionDialog } from './trxDialog/PTransactionDialog';

import { RegisterTransactionObjectsArray } from '../../collections'; 
import { ClearedFlag, RegisterFilterTimeFrame } from '../../constants';
import { DateWithoutTime, RegisterTransactionObject, SerializationUtilities, SimpleObjectMap, Logger } from '../../utilities';
import * as budgetEntities from '../../interfaces/budgetEntities';
import { IApplicationState, IEntitiesCollection, ISimpleEntitiesCollection, IRegisterState } from '../../interfaces/state';

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

	private flagSelectionDialog:PFlagSelectionDialog;
	private filterTransactionsDialog:PFilterTransactionsDialog;
	private transactionDialog:PTransactionDialog;
	private reconcileAccountDialog:PReconcileAccountDialog;

	constructor(props: any) {
        super(props);
		this.selectTransaction = this.selectTransaction.bind(this);
		this.unselectTransaction = this.unselectTransaction.bind(this);
		this.selectAllTransactions = this.selectAllTransactions.bind(this);
		this.unselectAllTransactions = this.unselectAllTransactions.bind(this);
		this.editTransaction = this.editTransaction.bind(this);
		this.onAddTransactionSelected = this.onAddTransactionSelected.bind(this);
		this.showFlagSelectionDialog = this.showFlagSelectionDialog.bind(this);
		this.showFilterTransactionsDialog = this.showFilterTransactionsDialog.bind(this);
		this.showReconcileAccountDialog = this.showReconcileAccountDialog.bind(this);
		this.updateFilterTransactionSettings = this.updateFilterTransactionSettings.bind(this);
		this.reconcileAccount = this.reconcileAccount.bind(this);
		this.state = {registersState:{}};
    }

	private getActiveAccount(applicationState:IApplicationState):string {

		var activeAccount:string;
		// Determine which account we are showing from the sidebar state
		var sidebarState = applicationState.sidebarState;
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
				accountId: accountId,
				sortByFields: ["date"],
				sortOrders: ["desc"],
				filterShowReconciledTransactions: false,
				filterShowScheduledTransactions: true,
				filterSelectedTimeFrame: RegisterFilterTimeFrame.LatestThreeMonths,
				filterStartDate: DateWithoutTime.createForCurrentMonth().subtractMonths(2),
				filterEndDate: DateWithoutTime.createForCurrentMonth(),
				searchPhrase: "",
				selectedTransactions: [],
				selectedTransactionsMap: {},
				registerTransactionObjectsArray: new RegisterTransactionObjectsArray()
			};

			// Populate the registerTransactionObjectsArray with initial  values
			this.updateRegisterTransactionObjectsArray(registerState.registerTransactionObjectsArray, registerState, this.props.applicationState.entitiesCollection);
		}

		return registerState;
	}

	private updateRegisterState(registerState:IRegisterState):void {

		var state = _.assign({}, this.state) as PRegisterState;
		state.registersState[registerState.accountId] = registerState;
		this.setState(state);
	}

	// *******************************************************************************************************
	// Methods that update the local register state
	// *******************************************************************************************************
	private selectTransaction(registerTransactionObject:RegisterTransactionObject, unselectAllOthers:boolean):void {

		var entityId:string;
		if(registerTransactionObject.entityType == "transaction" || registerTransactionObject.entityType == "subTransaction")
			entityId = registerTransactionObject.refTransaction.entityId;
		else
			entityId = registerTransactionObject.refScheduledTransaction.entityId;
		
		// Get the register state for the active account
		var activeAccount = this.getActiveAccount(this.props.applicationState);
		var registerState = this.getRegisterStateForAccount(activeAccount);
		if(unselectAllOthers) {
			registerState.selectedTransactions = [];
			registerState.selectedTransactionsMap = {};
		}

		// Mark the passed transaction id as selected
		registerState.selectedTransactions.push(entityId);
		registerState.selectedTransactionsMap[entityId] = true;
		this.updateRegisterState(registerState);
	}

	private unselectTransaction(registerTransactionObject:RegisterTransactionObject):void {

		var entityId:string;
		if(registerTransactionObject.entityType == "transaction" || registerTransactionObject.entityType == "subTransaction")
			entityId = registerTransactionObject.refTransaction.entityId;
		else
			entityId = registerTransactionObject.refScheduledTransaction.entityId;

		// Get the register state for the active account
		var activeAccount = this.getActiveAccount(this.props.applicationState);
		var registerState = this.getRegisterStateForAccount(activeAccount);

		// Mark the passed transaction id as unselected
		var index = _.findIndex(registerState.selectedTransactions, {entityId: entityId});
		registerState.selectedTransactions.splice(index, 1);
		registerState.selectedTransactionsMap[entityId] = false;
		this.updateRegisterState(registerState);
	}

	private selectAllTransactions():void {

		// Get the register state for the active account
		var activeAccount = this.getActiveAccount(this.props.applicationState);
		var registerState = this.getRegisterStateForAccount(activeAccount);

		_.forEach(registerState.registerTransactionObjectsArray, (registerTransactionObject)=>{

			var entityId:string;
			// Select the entityId based on the type of the object
			if(registerTransactionObject.entityType == "transaction" || registerTransactionObject.entityType == "subTransaction")
				entityId = registerTransactionObject.refTransaction.entityId;
			else
				entityId = registerTransactionObject.refScheduledTransaction.entityId;

			// Mark it as selected, if it is not already selected.
			if(registerState.selectedTransactionsMap[entityId] != true) {
				registerState.selectedTransactions.push(entityId);
				registerState.selectedTransactionsMap[entityId] = true;
			}
		});
	}

	private unselectAllTransactions():void {

		// Get the register state for the active account
		var activeAccount = this.getActiveAccount(this.props.applicationState);
		var registerState = this.getRegisterStateForAccount(activeAccount);

		// Simply reset the variables that we were using to keep track of selection
		registerState.selectedTransactions = [];
		registerState.selectedTransactionsMap = {};
	}

	private editTransaction(registerTransactionObject:RegisterTransactionObject, focusOnField:string):void {

		if(registerTransactionObject.entityType == "transaction" || registerTransactionObject.entityType == "subTransaction")
			this.transactionDialog.showForExistingTransaction(registerTransactionObject.refTransaction, focusOnField);
		else
			this.transactionDialog.showForExistingScheduledTransaction(registerTransactionObject.refScheduledTransaction, focusOnField);
	}

	private showFlagSelectionDialog(registerTransactionObject:RegisterTransactionObject, element:HTMLElement):void {

		if(registerTransactionObject.entityType == "transaction")
			this.flagSelectionDialog.showForTransaction(registerTransactionObject.refTransaction, element);
		else if(registerTransactionObject.entityType == "scheduledTransaction")
			this.flagSelectionDialog.showForScheduledTransaction(registerTransactionObject.refScheduledTransaction, element);
	}

	private showFilterTransactionsDialog(element:HTMLElement):void {

		if(this.filterTransactionsDialog.isShowing() == false) {
			// Get the register state for the active account
			var activeAccount = this.getActiveAccount(this.props.applicationState);
			var registerState = this.getRegisterStateForAccount(activeAccount);
			this.filterTransactionsDialog.show(registerState, element);
		}
	}

	private showReconcileAccountDialog(element:HTMLElement):void {

		if(this.reconcileAccountDialog.isShowing() == false) {
			// Get the active account
			var activeAccountId = this.getActiveAccount(this.props.applicationState);
			var account = this.props.applicationState.entitiesCollection.accounts.getEntityById(activeAccountId);
			this.reconcileAccountDialog.show(account, element);
		}
	}

	private updateRegisterTransactionObjectsArray(registerTransactionObjectsArray:RegisterTransactionObjectsArray, registerState:IRegisterState, entitiesCollection:IEntitiesCollection):void {

		var accountId = registerState.accountId;
		var isAllAccounts = (registerState.accountId == "All_Accounts");
		var accountsArray = entitiesCollection.accounts;
		var transactionsArray = entitiesCollection.transactions;
		var subTransactionsArray = entitiesCollection.subTransactions;
		var scheduledTransactionsArray = entitiesCollection.scheduledTransactions;
		var scheduledSubTransactionsArray = entitiesCollection.scheduledSubTransactions;
		var startDate = registerState.filterStartDate;
		var endDate = registerState.filterEndDate;
		var splitSubCategoryId = entitiesCollection.subCategories.getSplitSubCategory().entityId;

		if(registerState.filterShowScheduledTransactions) {
			// Start iterating through scheduled transactions, and convert them into 
			// RegisterTransactionObjects for displaying in the register.
			_.forEach(scheduledTransactionsArray.getAllItems(), (scheduledTransaction)=>{

				if(isAllAccounts || scheduledTransaction.accountId == accountId) {

					let registerTransactionObject = RegisterTransactionObject.createFromScheduledTransaction(scheduledTransaction, entitiesCollection);
					if(registerTransactionObject) {

						registerTransactionObjectsArray.addOrReplaceEntity(registerTransactionObject);
						// If this is a split transaction, get the subtransactions for this transaction
						// and create RegisterTransactionObjects for them as well.
						if(scheduledTransaction.subCategoryId == splitSubCategoryId) {

							var scheduledSubTransactions = scheduledSubTransactionsArray.getSubTransactionsByTransactionId(scheduledTransaction.entityId);
							_.forEach(scheduledSubTransactions, (scheduledSubTransaction)=>{
								let registerTransactionObject = RegisterTransactionObject.createFromScheduledSubTransaction(scheduledSubTransaction, scheduledTransaction, entitiesCollection);
								registerTransactionObjectsArray.addOrReplaceEntity(registerTransactionObject);
							});
						}
					}
				}
			});
		}

		// Start iterating through transactions month by month, and convert them into RegisterTransactionObjects for displaying in the register.
		var month = startDate.clone();
		while(month.isBefore(endDate) || month.equalsByMonth(endDate)) {

			var transactions = transactionsArray.getTransactionsByMonth(month);
			_.forEach(transactions, (transaction)=>{

				// Does this transaction pass the criteria for inclusion into the registerTransactionObjectsArray
				var shouldBeIncluded = (
					transaction.isTombstone == 0 && 
					(isAllAccounts || transaction.accountId == accountId) &&
					(transaction.cleared != ClearedFlag.Reconciled || registerState.filterShowReconciledTransactions) 
				);

				// Do we already have a registerTransactionObject in our array against this transaction
				let existingRegisterTransactionObject = registerTransactionObjectsArray.getEntityById(transaction.entityId);
				
				// If the transaction should not be included, and it is not already included in the 
				// registerTransactionObjectsArray, then we don't need to do anything about it.
				// We do however need to handle the rest of the three cases:-
				// Case 1: It is already included, but should not be. Remove it.
				// Case 2: It is not already included, but should be. Add it.
				// Case 3. It is already included, and should remain. Make sure it is not stale. If it is, update it.  

				if(existingRegisterTransactionObject && shouldBeIncluded == false) {

					// Case 1: It is already included, but should not be. Remove it.
					// Remove the registerTransactionObject corresponding to this transaction.
					// This also removes registerTransactionObject for any subTransactions or 
					// scheduledSubTransactions if this was a split
					registerTransactionObjectsArray.removeEntityById(transaction.entityId);
				}
				else if(!existingRegisterTransactionObject && shouldBeIncluded == true) {

					// Case 2: It is not already included, but should be. Add it.
					let registerTransactionObject = RegisterTransactionObject.createFromTransaction(transaction, entitiesCollection);
					registerTransactionObjectsArray.addOrReplaceEntity(registerTransactionObject);

					// If this is a split transaction, get the subtransactions for this transaction
					// and create RegisterTransactionObjects for them as well.
					if(transaction.subCategoryId == splitSubCategoryId) {

						var subTransactions = subTransactionsArray.getSubTransactionsByTransactionId(transaction.entityId);
						_.forEach(subTransactions, (subTransaction)=>{

							let registerTransactionObject = RegisterTransactionObject.createFromSubTransaction(subTransaction, transaction, entitiesCollection);
							registerTransactionObjectsArray.addOrReplaceEntity(registerTransactionObject);
						});
					} 
				}
				else if(existingRegisterTransactionObject && shouldBeIncluded == true) {

					// Case 3. It is already included, and should remain. Make sure it is not stale. If it is, update it.  
					var isStale = existingRegisterTransactionObject.checkIfObjectIsStale( entitiesCollection );
					// If it is stale, then create a new one and replace the old registerTransactionObject with the new one
					if(isStale) {

						let registerTransactionObject = RegisterTransactionObject.createFromTransaction(transaction, entitiesCollection);
						registerTransactionObjectsArray.addOrReplaceEntity(registerTransactionObject);

						// If this is a split transaction, get the subtransactions for this transaction
						// and create RegisterTransactionObjects for them as well.
						if(transaction.subCategoryId == splitSubCategoryId) {

							var subTransactions = subTransactionsArray.getSubTransactionsByTransactionId(transaction.entityId);
							_.forEach(subTransactions, (subTransaction)=>{

								let registerTransactionObject = RegisterTransactionObject.createFromSubTransaction(subTransaction, transaction, entitiesCollection);
								registerTransactionObjectsArray.addOrReplaceEntity(registerTransactionObject);
							});
						} 
					}
				}
			});

			// Move to the next month
			month.addMonths(1);
		}

		registerTransactionObjectsArray.sortArray(registerState.sortByFields, registerState.sortOrders);
	}

	private updateFilterTransactionSettings(timeFrame:string, startDate:DateWithoutTime, endDate:DateWithoutTime, showReconciled:boolean, showScheduled:boolean):void {

		// Get the register state for the active account and update it with the passed values
		var activeAccount = this.getActiveAccount(this.props.applicationState);
		var registerState = this.getRegisterStateForAccount(activeAccount);
		registerState.filterSelectedTimeFrame = timeFrame;
		registerState.filterStartDate = startDate;
		registerState.filterEndDate = endDate;
		registerState.filterShowReconciledTransactions = showReconciled;
		registerState.filterShowScheduledTransactions = showScheduled;
		this.updateRegisterState(registerState);
	}

	private reconcileAccount(account:budgetEntities.IAccount, actualCurrentBalance:number):void {

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
	public componentWillReceiveProps(nextProps:PRegisterProps):void {

		// Get the register state for the active account
		var activeAccount = this.getActiveAccount(nextProps.applicationState);
		var registerState = this.getRegisterStateForAccount(activeAccount);
		var registerTransactionObjectsArray = registerState.registerTransactionObjectsArray;
		// Update the registerTransactionObjectsArray
		this.updateRegisterTransactionObjectsArray(registerTransactionObjectsArray, registerState, nextProps.applicationState.entitiesCollection);
		this.updateRegisterState(registerState);
	} 

	public render() {

		var accountName:string;
		var clearedBalance:number = 0;
		var unclearedBalance:number = 0;
		var workingBalance:number = 0;
		var selectedTotal:number = 0;
		var showSelectedTotal:boolean = false;
		var isAllAccounts:boolean = true;
		var currentAccountId:string = null;
		var registerState:IRegisterState = null;
		var entitiesCollection = this.props.applicationState.entitiesCollection;

		// Determine which account we are showing from the sidebar state
		var accounts:Array<budgetEntities.IAccount>;
		var sidebarState = this.props.applicationState.sidebarState;
		if(sidebarState.selectedTab == "All Accounts") {

			accountName = "All Accounts";
			accounts = entitiesCollection.accounts.getAllItems();
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

		if(registerState.selectedTransactions.length > 1) {
			// Set flag for showing the selected total
			showSelectedTotal = true;
			// Calculate the total of the selected transactions
			_.forEach(registerState.selectedTransactions, (transactionId)=>{
				var transaction = entitiesCollection.transactions.getEntityById(transactionId);
				selectedTotal += transaction.amount;
			});
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

				<PRegisterMessageBar 
					accountId={currentAccountId} 
					isAllAccounts={isAllAccounts} 
					entitiesCollection={this.props.applicationState.entitiesCollection} 
				/>
				
				<PRegisterHeader 
					accountName={accountName} 
					clearedBalance={clearedBalance} 
					unclearedBalance={unclearedBalance} 
					workingBalance={workingBalance} 
					showReconcileButton={isAllAccounts == false} 
					showSelectedTotal={showSelectedTotal}
					selectedTotal={selectedTotal}
					showReconcileAccountDialog={this.showReconcileAccountDialog}
				/>

				<PRegisterToolbar 
					registerState={registerState}
					onAddTransactionSelected={this.onAddTransactionSelected}
					showEditMenu={null}
					showFilterDialog={this.showFilterTransactionsDialog}
				/>

				<PRegisterDataGrid 
					accountId={currentAccountId} 
					isAllAccounts={isAllAccounts} 
					entitiesCollection={this.props.applicationState.entitiesCollection}
					updateEntities={this.props.updateEntities} registerState={registerState}
					selectTransaction={this.selectTransaction}
					unselectTransaction={this.unselectTransaction}
					editTransaction={this.editTransaction}
					selectAllTransactions={this.selectAllTransactions}
					unselectAllTransactions={this.unselectAllTransactions} 
					showFlagSelectionDialog={this.showFlagSelectionDialog}
				 />

				<PFlagSelectionDialog 
					ref={(d)=> this.flagSelectionDialog = d }
					updateEntities={this.props.updateEntities} 
				/>

				<PFlagSelectionDialog 
					ref={(d)=> this.flagSelectionDialog = d }
					updateEntities={this.props.updateEntities} 
				/>

				<PFilterTransactionsDialog 
					minMonth={this.props.applicationState.entitiesCollection.monthlyBudgets.getMinMonth()}
					maxMonth={this.props.applicationState.entitiesCollection.monthlyBudgets.getMaxMonth()} 
					updateFilterTransactionSettings={this.updateFilterTransactionSettings}
					ref={(d)=> this.filterTransactionsDialog = d }
				/>

				<PReconcileAccountDialog 
					reconcileAccount={this.reconcileAccount}
					ref={(d)=> this.reconcileAccountDialog = d }
				/>

				<PTransactionDialog dialogTitle="Add Transaction"
					ref={(d)=> this.transactionDialog = d }
					entitiesCollection={entitiesCollection}
					updateEntities={this.props.updateEntities} 
				/>
			</div>
		);
  	}
}