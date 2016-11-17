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
import { PApproveRejectDialog } from './dialogs/PApproveRejectDialog';
import { PEditMenuDialog } from './dialogs/PEditMenuDialog';
import { PBulkCategorizeDialog } from './dialogs/PBulkCategorizeDialog';
import { PMoveToAccountDialog } from './dialogs/PMoveToAccountDialog';
import { PRegisterSettingsDialog } from './dialogs/PRegisterSettingsDialog'; 
import { PTransactionDialog } from './trxDialog/PTransactionDialog';

import { EntityFactory } from '../../persistence';
import { RegisterTransactionObjectsArray } from '../../collections'; 
import { ClearedFlag, RegisterFilterTimeFrame } from '../../constants';
import { DataFormats, DataFormatter, DateWithoutTime, RegisterTransactionObject, SerializationUtilities, SimpleObjectMap, Logger } from '../../utilities';
import * as budgetEntities from '../../interfaces/budgetEntities';
import { IDataFormat } from '../../interfaces/formatters';
import { IApplicationState, IEntitiesCollection, ISimpleEntitiesCollection, IRegisterState } from '../../interfaces/state';

export interface PRegisterProps {
	// State Variables
	applicationState: IApplicationState;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PRegisterState {
	dataFormat:string;
	dataFormatter:DataFormatter;
	registersState: SimpleObjectMap<IRegisterState>;
}

const RegisterContainerStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'column nowrap',
	height: '100%',
	width: '100%'
}

export class PRegister extends React.Component<PRegisterProps, PRegisterState> {

	// TODO: Import bank transactions
	// TODO: Delete transaction through delete button on register
	// TODO: Clear/Unclear transaction through "C" button
	// TODO: Payee filteration when typing in transaction dialog
	// TODO: Enter transaction now in edit menu
	private registerGrid:PRegisterDataGrid;
	private flagSelectionDialog:PFlagSelectionDialog;
	private filterTransactionsDialog:PFilterTransactionsDialog;
	private transactionDialog:PTransactionDialog;
	private reconcileAccountDialog:PReconcileAccountDialog;
	private approveRejectDialog:PApproveRejectDialog;
	private editMenuDialog:PEditMenuDialog;
	private bulkCategorizeDialog:PBulkCategorizeDialog;
	private moveToAccountDialog:PMoveToAccountDialog;
	private registerSettingsDialog:PRegisterSettingsDialog;

	constructor(props:PRegisterProps) {
        super(props);
		this.getActiveAccount = this.getActiveAccount.bind(this);
		this.getRegisterStateForAccount = this.getRegisterStateForAccount.bind(this);
		this.updateRegisterState = this.updateRegisterState.bind(this);
		this.selectTransaction = this.selectTransaction.bind(this);
		this.unselectTransaction = this.unselectTransaction.bind(this);
		this.selectAllTransactions = this.selectAllTransactions.bind(this);
		this.unselectAllTransactions = this.unselectAllTransactions.bind(this);
		this.setRegisterSort = this.setRegisterSort.bind(this);
		this.updateClearedForTransaction = this.updateClearedForTransaction.bind(this);
		this.editTransaction = this.editTransaction.bind(this);
		this.showTransactionDialog = this.showTransactionDialog.bind(this);
		this.showFlagSelectionDialog = this.showFlagSelectionDialog.bind(this);
		this.showFilterTransactionsDialog = this.showFilterTransactionsDialog.bind(this);
		this.showReconcileAccountDialog = this.showReconcileAccountDialog.bind(this);
		this.showApproveRejectDialog = this.showApproveRejectDialog.bind(this);
		this.showEditMenuDialog = this.showEditMenuDialog.bind(this);
		this.showBulkCategorizeDialog = this.showBulkCategorizeDialog.bind(this);
		this.showMoveToAccountDialog = this.showMoveToAccountDialog.bind(this);
		this.showRegsiterSettingsDialog = this.showRegsiterSettingsDialog.bind(this);
		this.updateFilterTransactionSettings = this.updateFilterTransactionSettings.bind(this);
		this.reconcileAccount = this.reconcileAccount.bind(this);

		// If there is not active budget, default the formatter to en_US so that 
		// we have something to work with at startup
		var dataFormat = DataFormats.locale_mappings["en_US"];
		var activeBudgetId = props.applicationState.activeBudgetId;
		if(activeBudgetId && props.applicationState.entitiesCollection.budgets) {

			var activeBudget = props.applicationState.entitiesCollection.budgets.getEntityById(activeBudgetId);
			if(activeBudget && activeBudget.dataFormat) {
				dataFormat = JSON.parse(activeBudget.dataFormat) as IDataFormat;
			}
		}

		this.state = {
			dataFormat: JSON.stringify(dataFormat),
			dataFormatter: new DataFormatter(dataFormat),
			registersState:{}
		};
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
				showCheckColumn: false,
				showClearedColumn: true,
				showFlagColumn: true,
				showMemoColumn: true,
				searchPhrase: "",
				selectedTransactions: [],
				selectedTransactionsMap: {},
				registerTransactionObjectsArray: null
			};

			registerState.registerTransactionObjectsArray = this.buildRegisterTransactionObjectsArray(registerState, this.props.applicationState.entitiesCollection);
		}

		return registerState;
	}

	private updateRegisterState(registerState:IRegisterState):void {

		var state = Object.assign({}, this.state) as PRegisterState;
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

		_.forEach(registerState.registerTransactionObjectsArray.getAllItems(), (registerTransactionObject)=>{

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

		this.updateRegisterState(registerState);
	}

	private unselectAllTransactions():void {

		// Get the register state for the active account
		var activeAccount = this.getActiveAccount(this.props.applicationState);
		var registerState = this.getRegisterStateForAccount(activeAccount);

		// Simply reset the variables that we were using to keep track of selection
		registerState.selectedTransactions = [];
		registerState.selectedTransactionsMap = {};

		this.updateRegisterState(registerState);
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

	private setRegisterSort(sortByFields:Array<string>, sortOrders:Array<string>):void {

		// Get the register state for the active account
		var activeAccount = this.getActiveAccount(this.props.applicationState);
		var registerState = this.getRegisterStateForAccount(activeAccount);
		// Apply this new sorting on the data 
		registerState.registerTransactionObjectsArray.sortArray(sortByFields, sortOrders); 
		// Update the sort values in the register state
		registerState.sortByFields = sortByFields;
		registerState.sortOrders = sortOrders;
		this.updateRegisterState(registerState);
	}

	private updateClearedForTransaction(transaction:budgetEntities.ITransaction):void {

		if(transaction.cleared != ClearedFlag.Reconciled) {

			// Clear, or unclear the transaction, and send it for persistence
			var updatedTransaction = Object.assign({}, transaction) as budgetEntities.ITransaction;
			if(updatedTransaction.cleared == ClearedFlag.Uncleared)
				updatedTransaction.cleared = ClearedFlag.Cleared;
			else if(updatedTransaction.cleared == ClearedFlag.Cleared)
				updatedTransaction.cleared = ClearedFlag.Uncleared;

			var changedEntities:ISimpleEntitiesCollection = {
				transactions: [updatedTransaction]
			};

			this.props.updateEntities(changedEntities);
		}
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

	private showApproveRejectDialog(transaction:budgetEntities.ITransaction, element:HTMLElement):void {

		if(this.approveRejectDialog.isShowing() == false) {
			this.approveRejectDialog.show(transaction, element);
		}
	}

	private showEditMenuDialog(element:HTMLElement):void {

		if(this.editMenuDialog.isShowing() == false) {
			// Get the register state for the active account
			var activeAccount = this.getActiveAccount(this.props.applicationState);
			var registerState = this.getRegisterStateForAccount(activeAccount);
			// Pass the list of the selected transactions to the edit menu dialog
			this.editMenuDialog.show(registerState.selectedTransactions, element);
		}
	}

	private showBulkCategorizeDialog():void {

		if(this.bulkCategorizeDialog.isShowing() == false) {
			// Get the register state for the active account
			var activeAccount = this.getActiveAccount(this.props.applicationState);
			var registerState = this.getRegisterStateForAccount(activeAccount);
			// Pass the register state to the bulk categorize dialog
			this.bulkCategorizeDialog.show(registerState);
		}
	}

	private showMoveToAccountDialog():void {

		if(this.moveToAccountDialog.isShowing() == false) {
			// Get the register state for the active account
			var activeAccount = this.getActiveAccount(this.props.applicationState);
			var registerState = this.getRegisterStateForAccount(activeAccount);
			// Pass the register state to the bulk categorize dialog
			this.moveToAccountDialog.show(registerState);
		}
	}

	private showRegsiterSettingsDialog(element:HTMLElement, placement:string = "bottom"):void {

		if(this.registerSettingsDialog.isShowing() == false) {
			// Get the register state for the active account
			var activeAccount = this.getActiveAccount(this.props.applicationState);
			var registerState = this.getRegisterStateForAccount(activeAccount);
			// Pass the register state to the settings dialog
			this.registerSettingsDialog.show(registerState, element, placement);
		}
	}

	private buildRegisterTransactionObjectsArray(registerState:IRegisterState, entitiesCollection:IEntitiesCollection):RegisterTransactionObjectsArray {

		var registerTransactionObjectsArray = new RegisterTransactionObjectsArray();
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

				// Does this scheduled transaction pass the criteria for inclusion into the registerTransactionObjectsArray
				var shouldBeIncluded = (
					scheduledTransaction.isTombstone == 0 && 
					(isAllAccounts || scheduledTransaction.accountId == accountId)
				);

				if(shouldBeIncluded) {

					let registerTransactionObject = RegisterTransactionObject.createFromScheduledTransaction(scheduledTransaction, entitiesCollection);
					if(registerTransactionObject) {
						registerTransactionObjectsArray.addOrReplaceEntity(registerTransactionObject);
						// If this is a split transaction, get the subtransactions for this scheduled transaction
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

				if(shouldBeIncluded == true) {

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
			});

			// Move to the next month
			month.addMonths(1);
		}

		registerTransactionObjectsArray.sortArray(registerState.sortByFields, registerState.sortOrders);
		return registerTransactionObjectsArray;
	}

	private updateSelectedTransactionsArrayAndMap(registerState:IRegisterState):void {

		var selectedTransactionIds = registerState.selectedTransactions;
		var selectedTransactionIdsMap = registerState.selectedTransactionsMap;
		var registerTransactionObjectsArray = registerState.registerTransactionObjectsArray;

		// Create a new array and map object that we are going to replace into the registerState 
		var newSelectedTransactionIds = new Array<string>();
		var newSelectedTransactionIdsMap = {};

		// Iterate through all the transactionIds in the existing selectedTransactionIds array, and if we have a registerTransactionObject 
		// in our array corresponding to that transactionId, then add this transactionId to the new array and map
		_.forEach(selectedTransactionIds, (transactionId)=>{

			if(registerTransactionObjectsArray.getEntityById(transactionId)) {

				newSelectedTransactionIds.push(transactionId);
				newSelectedTransactionIdsMap[transactionId] = true;	
			}
		});

		registerState.selectedTransactions = newSelectedTransactionIds;
		registerState.selectedTransactionsMap = newSelectedTransactionIdsMap; 
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
		registerState.registerTransactionObjectsArray = this.buildRegisterTransactionObjectsArray(registerState, this.props.applicationState.entitiesCollection);
		// Update the selectedTransaction variables in the registerState
		this.updateSelectedTransactionsArrayAndMap(registerState);
		this.updateRegisterState(registerState);
	}

	private reconcileAccount(account:budgetEntities.IAccount, actualCurrentBalance:number):void {

		var changedEntities:ISimpleEntitiesCollection = {
			accounts: [],
			transactions:[]
		};

		// Iterate through all the transactions in the account, and mark all cleared transactions as reconciled.
		var entitiesCollection = this.props.applicationState.entitiesCollection;
		var transactions = entitiesCollection.transactions.getTransactionsByAccountId(account.entityId);
		_.forEach(transactions, (transaction)=>{

			if(transaction.cleared == ClearedFlag.Cleared && transaction.isTombstone == 0) {
				var updatedTransaction = Object.assign({}, transaction);
				updatedTransaction.cleared = ClearedFlag.Reconciled;
				changedEntities.transactions.push(updatedTransaction);
			}
		});

		// If the actualCurrentBalance of the account (as entered by the user) is different then what we 
		// have in the account entity, then we need to create a reconciliation adjustment transaction.
		if(account.clearedBalance != actualCurrentBalance) {

			var adjustmentTransaction = EntityFactory.createNewTransaction();
			adjustmentTransaction.accountId = account.entityId;
			adjustmentTransaction.payeeId = entitiesCollection.payees.getReconciliationBalanceAdjustmentPayee().entityId;
			adjustmentTransaction.subCategoryId = entitiesCollection.subCategories.getImmediateIncomeSubCategory().entityId;
			adjustmentTransaction.date = DateWithoutTime.createForToday().getUTCTime();
			adjustmentTransaction.amount = actualCurrentBalance - account.clearedBalance;
			adjustmentTransaction.cleared = ClearedFlag.Reconciled;
			changedEntities.transactions.push(adjustmentTransaction);
		}

		// Also update the last recociliation date and balance values in the account entity
		var updatedAccount = Object.assign({}, account);
		updatedAccount.lastReconciledDate = DateWithoutTime.createForToday().getUTCTime();
		updatedAccount.lastReconciledBalance = account.clearedBalance; 
		this.props.updateEntities(changedEntities);
	}

	private showTransactionDialog():void {

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
		registerState.registerTransactionObjectsArray = this.buildRegisterTransactionObjectsArray(registerState, nextProps.applicationState.entitiesCollection);
		// Update the selectedTransaction variables in the registerState
		this.updateSelectedTransactionsArrayAndMap(registerState);

		var state = Object.assign({}, this.state) as PRegisterState;
		state.registersState[registerState.accountId] = registerState;

		// If the dataFormat in the active budget has changed, then recreate the dataFormatter.
		var activeBudgetId = nextProps.applicationState.activeBudgetId;
		if(activeBudgetId && nextProps.applicationState.entitiesCollection.budgets) {

			var activeBudget = nextProps.applicationState.entitiesCollection.budgets.getEntityById(activeBudgetId);
			if(activeBudget && activeBudget.dataFormat != this.state.dataFormat) {
				var dataFormat = JSON.parse(activeBudget.dataFormat) as IDataFormat;
				var dataFormatter = new DataFormatter(dataFormat);
				state.dataFormat = activeBudget.dataFormat;
				state.dataFormatter = dataFormatter;
			}
		}

		// If the expanded state of the sidebar has changed, then resize the register grid
		if(this.props.applicationState.sidebarState.expanded != nextProps.applicationState.sidebarState.expanded) {
			this.registerGrid.updateComponentDimensions();
		}

		this.setState(state);
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
				if(transaction)
					selectedTotal += transaction.amount;
				else {
					var scheduledTransaction = entitiesCollection.scheduledTransactions.getEntityById(transactionId);
					if(scheduledTransaction)
						selectedTotal += scheduledTransaction.amount;
				}
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
					dataFormatter={this.state.dataFormatter}
					showReconcileAccountDialog={this.showReconcileAccountDialog}
				/>

				<PRegisterToolbar 
					registerState={registerState}
					onAddTransactionSelected={this.showTransactionDialog}
					showEditMenu={null}
					showFilterDialog={this.showFilterTransactionsDialog}
					showEditMenuDialog={this.showEditMenuDialog}
					showRegisterSettingsDialog={this.showRegsiterSettingsDialog}
				/>

				<PRegisterDataGrid 
					ref={(g)=> this.registerGrid = g }
					accountId={currentAccountId} 
					isAllAccounts={isAllAccounts}
					dataFormatter={this.state.dataFormatter} 
					entitiesCollection={this.props.applicationState.entitiesCollection}
					updateEntities={this.props.updateEntities} registerState={registerState}
					selectTransaction={this.selectTransaction}
					unselectTransaction={this.unselectTransaction}
					updateClearedForTransaction={this.updateClearedForTransaction}
					setRegisterSort={this.setRegisterSort}
					editTransaction={this.editTransaction}
					selectAllTransactions={this.selectAllTransactions}
					unselectAllTransactions={this.unselectAllTransactions} 
					showFlagSelectionDialog={this.showFlagSelectionDialog}
					showApproveRejectDialog={this.showApproveRejectDialog}
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
					ref={(d)=> this.reconcileAccountDialog = d }
					reconcileAccount={this.reconcileAccount}
					dataFormatter={this.state.dataFormatter} 
				/>

				<PApproveRejectDialog 
					ref={(d)=> this.approveRejectDialog = d }
					updateEntities={this.props.updateEntities}
				/>

				<PEditMenuDialog 
					ref={(d)=> this.editMenuDialog = d }
					entitiesCollection={entitiesCollection}
					showBulkCategorizeDialog={this.showBulkCategorizeDialog}
					showMoveToAccountDialog={this.showMoveToAccountDialog}
					updateEntities={this.props.updateEntities}
				/>

				<PBulkCategorizeDialog 
					ref={(d)=> this.bulkCategorizeDialog = d }
					entitiesCollection={entitiesCollection}
					updateEntities={this.props.updateEntities}
				/>

				<PMoveToAccountDialog 
					ref={(d)=> this.moveToAccountDialog = d }
					entitiesCollection={entitiesCollection}
					updateEntities={this.props.updateEntities}
				/>

				<PRegisterSettingsDialog 
					ref={(d)=> this.registerSettingsDialog = d }
					updateRegisterState={this.updateRegisterState}
				/> 

				<PTransactionDialog dialogTitle="Add Transaction"
					ref={(d)=> this.transactionDialog = d }
					dataFormatter={this.state.dataFormatter} 
					entitiesCollection={entitiesCollection}
					updateEntities={this.props.updateEntities} 
				/>
			</div>
		);
  	}
}