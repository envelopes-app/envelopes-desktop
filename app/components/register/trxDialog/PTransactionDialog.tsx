/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Modal, Form, FormGroup, FormControl, ControlLabel, Glyphicon } from 'react-bootstrap';

import { PFlagSelector } from './PFlagSelector';
import { PAccountSelector } from './PAccountSelector';
import { PDateSelector } from './PDateSelector';
import { PPayeeSelector } from './PPayeeSelector';
import { PCategorySelector } from './PCategorySelector';
import { PMemoInput } from './PMemoInput';
import { PAmountInput } from './PAmountInput';

import * as objects from '../../../interfaces/objects';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { TransactionFlag, TransactionFrequency } from '../../../constants';
import { EntityFactory } from '../../../persistence';
import { IEntitiesCollection, ISimpleEntitiesCollection, ITransactionValues } from '../../../interfaces/state';
import { DataFormatter, DialogUtilities, DateWithoutTime, FocusManager, KeyGenerator, Logger, SimpleObjectMap } from '../../../utilities';

export interface PTransactionDialogProps { 

	dialogTitle:string;
	dataFormatter:DataFormatter;
	// Entities collections from the global state 
	entitiesCollection:IEntitiesCollection;
	// Dispatch methods
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PTransactionDialogState {
	showModal: boolean;
	action: string; // new-transaction/existing-transaction/existing-scheduled-transaction 
	// If we are editing a transaction, it will be in the following two state variables
	transaction?: budgetEntities.ITransaction;
	subTransaction?: Array<budgetEntities.ISubTransaction>;
	// If we are editing a scheduled transaction, it will be in the following two state variables
	scheduledTransaction?: budgetEntities.IScheduledTransaction;
	scheduledSubTransaction?: Array<budgetEntities.IScheduledSubTransaction>;
	// This is for managing the focus in the dialog
	activeFieldOnInitialShow:string;
	activeField:string;
	// Properties to save the values for the different fields. We wont create an actual transaction 
	// or scheduled transaction object until the user presses save.
	entityId?: string;
	accountId?: string;
	payeeId?: string;
	manuallyEnteredPayeeName?: string;
	date?: DateWithoutTime;
	frequency?: string;
	subCategoryId?: string;
	manuallyEnteredCategoryName?: string;
	memo?: string;
	inflowAmount?: number;
	outflowAmount?: number;
}

export class PTransactionDialog extends React.Component<PTransactionDialogProps, PTransactionDialogState> {

	private accountSelector:PAccountSelector;
	private dateSelector:PDateSelector;
	private payeeSelector:PPayeeSelector;
	private categorySelector:PCategorySelector;
	private memoInput:PMemoInput;
	private amountInput:PAmountInput;
	private saveAndAddAnotherButton:Button;
	private saveButton:Button;
	private cancelButton:Button;

	private accountsList:Array<objects.IAccountObject>;
	private payeesList:Array<objects.IPayeeObject>;
	private categoriesList:Array<objects.ICategoryObject>;
	private focusManager:FocusManager = new FocusManager(); 
	 
	constructor(props: any) {
        super(props);
		this.showForNewTransaction = this.showForNewTransaction.bind(this);
		this.showForExistingTransaction = this.showForExistingTransaction.bind(this);
		this.showForExistingScheduledTransaction = this.showForExistingScheduledTransaction.bind(this);
		this.save = this.save.bind(this);
		this.close = this.close.bind(this);
		this.onEntered = this.onEntered.bind(this);

		this.setActiveField = this.setActiveField.bind(this);
		this.setFocusOnAccountSelector = this.setFocusOnAccountSelector.bind(this);
		this.setFocusOnDateSelector = this.setFocusOnDateSelector.bind(this);
		this.setFocusOnPayeeSelector = this.setFocusOnPayeeSelector.bind(this);
		this.setFocusOnCategorySelector = this.setFocusOnCategorySelector.bind(this);
		this.setFocusOnMemoInput = this.setFocusOnMemoInput.bind(this);
		this.setFocusOnOutflowInput = this.setFocusOnOutflowInput.bind(this);
		this.setFocusOnInflowInput = this.setFocusOnInflowInput.bind(this);
		this.setFocusOnSaveAndAddAnotherButton = this.setFocusOnSaveAndAddAnotherButton.bind(this);
		this.setFocusOnSaveButton = this.setFocusOnSaveButton.bind(this);
		this.setFocusOnCancelButton = this.setFocusOnCancelButton.bind(this);
		this.handleTabPressedOnAccountSelector = this.handleTabPressedOnAccountSelector.bind(this);
		this.handleTabPressedOnDateSelector = this.handleTabPressedOnDateSelector.bind(this);
		this.handleTabPressedOnPayeeSelector = this.handleTabPressedOnPayeeSelector.bind(this);
		this.handleTabPressedOnCategorySelector = this.handleTabPressedOnCategorySelector.bind(this);
		this.handleTabPressedOnMemoInput = this.handleTabPressedOnMemoInput.bind(this);
		this.handleTabPressedOnOutflowInput = this.handleTabPressedOnOutflowInput.bind(this);
		this.handleTabPressedOnInflowInput = this.handleTabPressedOnInflowInput.bind(this);
		this.handleKeyPressedOnSaveAndAddAnotherButton = this.handleKeyPressedOnSaveAndAddAnotherButton.bind(this);
		this.handleKeyPressedOnSaveButton = this.handleKeyPressedOnSaveButton.bind(this);
		this.handleKeyPressedOnCancelButton = this.handleKeyPressedOnCancelButton.bind(this);

		this.setSelectedAccountId = this.setSelectedAccountId.bind(this);
		this.setSelectedDate = this.setSelectedDate.bind(this);
		this.setSelectedFrequency = this.setSelectedFrequency.bind(this);
		this.setSelectedPayeeId = this.setSelectedPayeeId.bind(this);
		this.setManuallyEnteredPayeeName = this.setManuallyEnteredPayeeName.bind(this);
		this.setSelectedCategoryId = this.setSelectedCategoryId.bind(this);
		this.setManuallyEnteredCategoryName = this.setManuallyEnteredCategoryName.bind(this);
		this.setMemo = this.setMemo.bind(this);
		this.setAmount = this.setAmount.bind(this);

        this.state = { showModal: false, action: null, activeField: null, activeFieldOnInitialShow: null };

		this.focusManager.addFocusObject("account", this.setFocusOnAccountSelector);
		this.focusManager.addFocusObject("date", this.setFocusOnDateSelector);
		this.focusManager.addFocusObject("payee", this.setFocusOnPayeeSelector);
		this.focusManager.addFocusObject("category", this.setFocusOnCategorySelector);
		this.focusManager.addFocusObject("memo", this.setFocusOnMemoInput);
		this.focusManager.addFocusObject("outflow", this.setFocusOnOutflowInput);
		this.focusManager.addFocusObject("inflow", this.setFocusOnInflowInput);
		this.focusManager.addFocusObject("saveAndAddAnother", this.setFocusOnSaveAndAddAnotherButton);
		this.focusManager.addFocusObject("save", this.setFocusOnSaveButton);
		this.focusManager.addFocusObject("cancel", this.setFocusOnCancelButton);
    }

	private onEntered():void {
		var activeFieldOnInitialShow = this.state.activeFieldOnInitialShow;
		var focusManager = this.focusManager;
		setTimeout(function() {
			focusManager.setFocus(activeFieldOnInitialShow);
		}, 100);
	}

	public showForNewTransaction(accountId:string):void {

		// Before updating the state, refresh the lists of accounts, payees and categories 
		// for showing in the popovers of the transaction dialog.
		this.accountsList = DialogUtilities.buildAccountsList(this.props.entitiesCollection);
		this.payeesList = DialogUtilities.buildPayeesList(this.props.entitiesCollection);
		this.categoriesList = DialogUtilities.buildCategoriesList(this.props.entitiesCollection);

		// Update the state of this dialog to make it visible. 
		// Also reset all the fields for storing the values for the new transaction 
		// Note: We are not setting the activeField here, as it needs to be set in the "onEnter" handler
		// for the dialog box. This is so that we show the required popover when the dialog box has settled
		// into it's final position. 
		this.setState({ 
			showModal: true,
			action: "new-transaction",
			activeField: null,
			activeFieldOnInitialShow: "date",
			entityId: null,
			accountId: accountId,
			payeeId: null,
			manuallyEnteredPayeeName: null,
			date: DateWithoutTime.createForToday(),
			frequency: TransactionFrequency.Never,
			subCategoryId: null,
			manuallyEnteredCategoryName: null,
			memo: "",
			inflowAmount: 0,
			outflowAmount: 0
		});
	};

	public showForExistingTransaction(transaction:budgetEntities.ITransaction, activeField:string):void {

		// Before updating the state, refresh the lists of accounts, payees and categories 
		// for showing in the popovers of the transaction dialog.
		this.accountsList = DialogUtilities.buildAccountsList(this.props.entitiesCollection);
		this.payeesList = DialogUtilities.buildPayeesList(this.props.entitiesCollection);
		this.categoriesList = DialogUtilities.buildCategoriesList(this.props.entitiesCollection);

		// Update the state of this dialog to make it visible. 
		// Also reset all the fields for storing the values for the new transaction 
		// Note: We are not setting the activeField here, as it needs to be set in the "onEnter" handler
		// for the dialog box. This is so that we show the required popover when the dialog box has settled
		// into it's final position. 
		this.setState({ 
			showModal: true,
			action: "existing-transaction",
			transaction: transaction,
			activeField: null,
			activeFieldOnInitialShow: activeField,
			entityId: transaction.entityId,
			accountId: transaction.accountId,
			payeeId: transaction.payeeId,
			manuallyEnteredPayeeName: null,
			date: DateWithoutTime.createFromUTCTime(transaction.date),
			frequency: TransactionFrequency.Never,
			subCategoryId: transaction.subCategoryId,
			manuallyEnteredCategoryName: null,
			memo: transaction.memo ? transaction.memo : "",
			outflowAmount: transaction.amount < 0 ? -transaction.amount : 0,
			inflowAmount: transaction.amount > 0 ? transaction.amount : 0
		});
	}

	public showForExistingScheduledTransaction(scheduledTransaction:budgetEntities.IScheduledTransaction, activeField:string):void {

		// Before updating the state, refresh the lists of accounts, payees and categories 
		// for showing in the popovers of the transaction dialog.
		this.accountsList = DialogUtilities.buildAccountsList(this.props.entitiesCollection);
		this.payeesList = DialogUtilities.buildPayeesList(this.props.entitiesCollection);
		this.categoriesList = DialogUtilities.buildCategoriesList(this.props.entitiesCollection);

		// Update the state of this dialog to make it visible. 
		// Also reset all the fields for storing the values for the new transaction 
		// Note: We are not setting the activeField here, as it needs to be set in the "onEnter" handler
		// for the dialog box. This is so that we show the required popover when the dialog box has settled
		// into it's final position. 
		this.setState({ 
			showModal: true,
			action: "existing-scheduled-transaction",
			scheduledTransaction: scheduledTransaction,
			activeField: null,
			activeFieldOnInitialShow: activeField,
			entityId: scheduledTransaction.entityId,
			accountId: scheduledTransaction.accountId,
			payeeId: scheduledTransaction.payeeId,
			manuallyEnteredPayeeName: null,
			date: DateWithoutTime.createFromUTCTime(scheduledTransaction.date),
			frequency: scheduledTransaction.frequency,
			subCategoryId: scheduledTransaction.subCategoryId,
			manuallyEnteredCategoryName: null,
			memo: scheduledTransaction.memo ? scheduledTransaction.memo : "",
			outflowAmount: scheduledTransaction.amount < 0 ? -scheduledTransaction.amount : 0,
			inflowAmount: scheduledTransaction.amount > 0 ? scheduledTransaction.amount : 0
		});
	}

	private setActiveField(activeField:string):void {

		if(activeField != this.state.activeField) {
			var state = Object.assign({}, this.state) as PTransactionDialogState;
			state.activeField = activeField;
			this.setState(state);
		}
	}

	private setFocusOnAccountSelector():void {
		this.setActiveField("account");
		this.accountSelector.setFocus();
	}

	private setFocusOnDateSelector():void {
		this.setActiveField("date");
		this.dateSelector.setFocus();
	}

	private setFocusOnPayeeSelector():void {
		this.setActiveField("payee");
		this.payeeSelector.setFocus();
	}

	private setFocusOnCategorySelector():void {
		this.setActiveField("category");
		this.categorySelector.setFocus();
	}

	private setFocusOnMemoInput():void {
		this.setActiveField("memo");
		this.memoInput.setFocus();
	}

	private setFocusOnOutflowInput():void {
		this.setActiveField("outflow");
		this.amountInput.setFocusOnOutflow();
	}

	private setFocusOnInflowInput():void {
		this.setActiveField("inflow");
		this.amountInput.setFocusOnInflow();
	}

	private setFocusOnSaveAndAddAnotherButton():void {
		this.setActiveField("saveAndAddAnother");
		(ReactDOM.findDOMNode(this.saveAndAddAnotherButton) as any).focus();
	}

	private setFocusOnSaveButton():void {
		this.setActiveField("save");
		(ReactDOM.findDOMNode(this.saveButton) as any).focus();
	}

	private setFocusOnCancelButton():void {
		this.setActiveField("cancel");
		(ReactDOM.findDOMNode(this.cancelButton) as any).focus();
	}

	private handleTabPressedOnAccountSelector(shiftKeyPressed:boolean):void {

		if(!shiftKeyPressed)
			this.focusManager.moveFocusForward("account");
		else
			this.focusManager.moveFocusBackward("account");
	}

	private handleTabPressedOnDateSelector(shiftKeyPressed:boolean):void {

		if(!shiftKeyPressed)
			this.focusManager.moveFocusForward("date");
		else
			this.focusManager.moveFocusBackward("date");
	}

	private handleTabPressedOnPayeeSelector(shiftKeyPressed:boolean):void {

		if(!shiftKeyPressed)
			this.focusManager.moveFocusForward("payee");
		else
			this.focusManager.moveFocusBackward("payee");
	}

	private handleTabPressedOnCategorySelector(shiftKeyPressed:boolean):void {

		if(!shiftKeyPressed)
			this.focusManager.moveFocusForward("category");
		else
			this.focusManager.moveFocusBackward("category");
	}

	private handleTabPressedOnMemoInput(shiftKeyPressed:boolean):void {

		if(!shiftKeyPressed) {
			// If the selected category is of inflow type, then move the focus by 2 steps to land on inflow
			var imediateIncomeSubCategory = this.props.entitiesCollection.subCategories.getImmediateIncomeSubCategory();
			if(this.state.subCategoryId && imediateIncomeSubCategory.entityId == this.state.subCategoryId)
				this.focusManager.moveFocusForward("memo", 2); // move 2 steps 
			else
				this.focusManager.moveFocusForward("memo");
		}
		else
			this.focusManager.moveFocusBackward("memo");
	}

	private handleTabPressedOnOutflowInput(shiftKeyPressed:boolean):void {

		if(!shiftKeyPressed)
			this.focusManager.moveFocusForward("outflow");
		else
			this.focusManager.moveFocusBackward("outflow");
	}

	private handleTabPressedOnInflowInput(shiftKeyPressed:boolean):void {

		if(!shiftKeyPressed)
			this.focusManager.moveFocusForward("inflow");
		else
			this.focusManager.moveFocusBackward("inflow");
	}

	private handleKeyPressedOnSaveAndAddAnotherButton(event:React.KeyboardEvent<any>):void {

		if(event.keyCode == 9) {
			event.preventDefault();
			if(!event.shiftKey)
				this.focusManager.moveFocusForward("saveAndAddAnother");
			else
				this.focusManager.moveFocusBackward("saveAndAddAnother");
		}
	}

	private handleKeyPressedOnSaveButton(event:React.KeyboardEvent<any>):void {

		if(event.keyCode == 9) {
			event.preventDefault();
			if(!event.shiftKey)
				this.focusManager.moveFocusForward("save");
			else
				this.focusManager.moveFocusBackward("save");
		}
	}

	private handleKeyPressedOnCancelButton(event:React.KeyboardEvent<any>):void {

		if(event.keyCode == 9) {
			event.preventDefault();
			if(!event.shiftKey)
				this.focusManager.moveFocusForward("cancel");
			else
				this.focusManager.moveFocusBackward("cancel");
		}
	}

	private setSelectedAccountId(accountId:string, callback:()=>any = null):void {
		var state = Object.assign({}, this.state) as PTransactionDialogState;
		state.accountId = accountId;
		this.setState(state, callback);
	}

	private setSelectedDate(date:DateWithoutTime, callback:()=>any = null):void {
		var state = Object.assign({}, this.state) as PTransactionDialogState;
		state.date = date;
		this.setState(state, callback);
	}

	private setSelectedFrequency(frequency:string):void {
		var state = Object.assign({}, this.state) as PTransactionDialogState;
		state.frequency = frequency;
		this.setState(state);
	}

	private setSelectedPayeeId(payeeId:string, callback:()=>any = null):void {
		var state = Object.assign({}, this.state) as PTransactionDialogState;
		state.payeeId = payeeId;
		this.setState(state, callback);
	}

	private setManuallyEnteredPayeeName(payeeName:string):void {
		var state = Object.assign({}, this.state) as PTransactionDialogState;
		state.manuallyEnteredPayeeName = payeeName;
		// When the user starts manually typing in a payeeName, clear the payeeId value
		state.payeeId = null;
		this.setState(state);
	}

	private setSelectedCategoryId(subCategoryId:string, clearManuallyEnteredCategoryName:boolean = false, callback:()=>any = null):void {
		var state = Object.assign({}, this.state) as PTransactionDialogState;
		state.subCategoryId = subCategoryId;
		if(clearManuallyEnteredCategoryName)
			state.manuallyEnteredCategoryName = null;
		this.setState(state, callback);
	}

	private setManuallyEnteredCategoryName(categoryName:string):void {
		var state = Object.assign({}, this.state) as PTransactionDialogState;
		state.manuallyEnteredCategoryName = categoryName;
		// When the user starts manually typing in a categoryName, clear the categoryId value
		state.subCategoryId = null;
		this.setState(state);
	}

	private setMemo(memo:string):void {
		var state = Object.assign({}, this.state) as PTransactionDialogState;
		state.memo = memo;
		this.setState(state);
	}

	private setAmount(inflowAmount:number, outflowAmount:number):void {
		var state = Object.assign({}, this.state) as PTransactionDialogState;
		state.inflowAmount = inflowAmount;
		state.outflowAmount = outflowAmount;
		this.setState(state);
	}

	private saveTransaction():void {

		var entitiesCollection:ISimpleEntitiesCollection = {};

		if(this.state.action == "new-transaction") {

			if(this.state.frequency == TransactionFrequency.Never) {
				// Create the transaction entity and add it to the entitiesCollection 
				this.createNewTransaction(entitiesCollection);
			}
			else {
				// Create the scheduled transaction entity and add it to the entitiesCollection 
				this.createNewScheduledTransaction(entitiesCollection);
			}
		}
		else if(this.state.action == "existing-transaction") {

			// Get the transaction entity that we were editing and make a clone of it for updating
			var transaction = Object.assign({}, this.state.transaction);
			// Update the values in this transaction from the state
			transaction.accountId = this.state.accountId;
			transaction.date = this.state.date.getUTCTime();
			transaction.payeeId = this.state.payeeId;
			transaction.subCategoryId = this.state.subCategoryId;
			transaction.memo = this.state.memo;

			if(this.state.inflowAmount > 0)
				transaction.amount = this.state.inflowAmount;
			else if(this.state.outflowAmount > 0)
				transaction.amount = -this.state.outflowAmount;
			else
				transaction.amount = 0;

			// Add this transaction to the entities collection
			entitiesCollection.transactions = [transaction];
		}
		else if(this.state.action == "existing-scheduled-transaction") {

			// Get the transaction entity that we were editing and male a clone of it for updating
			var scheduledTransaction = Object.assign({}, this.state.scheduledTransaction);
			// Update the values in this scheduled transaction from the state
			scheduledTransaction.accountId = this.state.accountId;
			scheduledTransaction.date = this.state.date.getUTCTime();
			scheduledTransaction.frequency = this.state.frequency;
			scheduledTransaction.payeeId = this.state.payeeId;
			scheduledTransaction.subCategoryId = this.state.subCategoryId;
			scheduledTransaction.memo = this.state.memo;

			if(this.state.inflowAmount > 0)
				scheduledTransaction.amount = this.state.inflowAmount;
			else if(this.state.outflowAmount > 0)
				scheduledTransaction.amount = -this.state.outflowAmount;
			else
				scheduledTransaction.amount = 0;

			// Add this scheduledtransaction to the entities collection
			entitiesCollection.scheduledTransactions = [scheduledTransaction];
		}

		// Check if we need to create a new payee
		if(!this.state.payeeId && this.state.manuallyEnteredPayeeName) {

			// There is no selected pre-existing payee, but we do have a payee name manually
			// entered by the user in the payee input box. 
			// Create a new payee and save it in the entitiesCollection
			this.createNewPayee(entitiesCollection);

			var payee = entitiesCollection.payees[0];
			// Update the transaction/scheduled-transaction to point to this new payee 
			if(entitiesCollection.transactions && entitiesCollection.transactions.length > 0) {
				entitiesCollection.transactions[0].payeeId = payee.entityId;
			}
			else if(entitiesCollection.scheduledTransactions && entitiesCollection.scheduledTransactions.length > 0) {
				entitiesCollection.scheduledTransactions[0].payeeId = payee.entityId;
			}
		}

		// Call the passed updateEntities method in the props to save the entities
		this.props.updateEntities(entitiesCollection);
	}

	private saveAndAddAnother():void {

		if(this.validateTransaction()) {
			// Save the transaction
			this.saveTransaction();
			// Reset the state to start adding another transaction.
			// Keep the accountId to whatever was already set
			var state = Object.assign({}, this.state);
			state.activeField = "date";
			state.entityId = null;
			state.payeeId = null;
			state.manuallyEnteredPayeeName = null;
			state.date = DateWithoutTime.createForToday();
			state.frequency = TransactionFrequency.Never;
			state.subCategoryId = null;
			state.manuallyEnteredCategoryName = null;
			state.memo = "";
			state.inflowAmount = 0;
			state.outflowAmount = 0;
			this.setState(state);
		}
	}

	private save():void {

		if(this.validateTransaction()) {
			// Save the transaction
			this.saveTransaction();
			// Close the modal dialog
			this.close();
		}
	}

	private validateTransaction():boolean {

		// TODO: Add any required validation logic here
		return true;
	}

	private close():void {
		// Hide the modal, and set the account in state to null
		this.setState({ showModal: false, action: null, activeField: null, activeFieldOnInitialShow: null });
	};

	private createNewTransaction(entitiesCollection:ISimpleEntitiesCollection):void {

		var transaction = EntityFactory.createNewTransaction();
		// Set the values in this transaction from the state
		transaction.accountId = this.state.accountId;
		transaction.date = this.state.date.getUTCTime();
		transaction.payeeId = this.state.payeeId;
		transaction.subCategoryId = this.state.subCategoryId;
		transaction.memo = this.state.memo;

		if(this.state.inflowAmount > 0)
			transaction.amount = this.state.inflowAmount;
		else if(this.state.outflowAmount > 0)
			transaction.amount = -this.state.outflowAmount;
		else
			transaction.amount = 0;

		// Add this transaction to the entities collection
		entitiesCollection.transactions = [transaction];
	}

	private createNewScheduledTransaction(entitiesCollection:ISimpleEntitiesCollection):void {

		var scheduledTransaction = EntityFactory.createNewScheduledTransaction();
		// Set the values in this transaction from the state
		scheduledTransaction.accountId = this.state.accountId;
		scheduledTransaction.date = this.state.date.getUTCTime();
		scheduledTransaction.frequency = this.state.frequency;
		scheduledTransaction.payeeId = this.state.payeeId;
		scheduledTransaction.subCategoryId = this.state.subCategoryId;
		scheduledTransaction.memo = this.state.memo;

		if(this.state.inflowAmount > 0)
			scheduledTransaction.amount = this.state.inflowAmount;
		else if(this.state.outflowAmount > 0)
			scheduledTransaction.amount = -this.state.outflowAmount;
		else
			scheduledTransaction.amount = 0;

		// Add this transaction to the entities collection
		entitiesCollection.scheduledTransactions = [scheduledTransaction];
	}

	private createNewPayee(entitiesCollection:ISimpleEntitiesCollection):void {

		var payee = EntityFactory.createNewPayee();
		// Set the values in the payee from the state
		payee.name = this.state.manuallyEnteredPayeeName;
		payee.autoFillSubCategoryId = this.state.subCategoryId;
		// Add this payee to the entities collection
		entitiesCollection.payees = [payee];
	}

	public render() {

		if(this.state.showModal) {
			// Whatever the current selected account is, we need to remove it's corresponding payee from the payees list 
			var filteredPayeesList = _.filter(this.payeesList, (payeeObj:objects.IPayeeObject)=>{
				return (payeeObj.accountId != this.state.accountId);
			});

			var categoriesList = this.categoriesList;
			var showFrequencyControl = (this.state.action == "new-transaction" || this.state.action == "existing-scheduled-transaction");
			var showFrequencyNeverOption = (this.state.action == "new-transaction");

			return (
				<Modal show={this.state.showModal} onEntered={this.onEntered} onHide={this.close} backdrop="static" keyboard={false} dialogClassName="add-transaction-dialog">
					<Modal.Header className="modal-header">
						<Modal.Title>{this.props.dialogTitle}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form horizontal>
							<PAccountSelector ref={(c) => this.accountSelector = c} 
								activeField={this.state.activeField} setActiveField={this.setActiveField}
								selectedAccountId={this.state.accountId} accountsList={this.accountsList} 
								setSelectedAccountId={this.setSelectedAccountId} handleTabPressed={this.handleTabPressedOnAccountSelector} />
							<PDateSelector ref={(c) => this.dateSelector = c} 
								activeField={this.state.activeField} setActiveField={this.setActiveField}
								selectedDate={this.state.date} selectedFrequency={this.state.frequency}
								showFrequencyControl={showFrequencyControl}
								showFrequencyNeverOption={showFrequencyNeverOption}
								dataFormatter={this.props.dataFormatter}
								setSelectedDate={this.setSelectedDate} setSelectedFrequency={this.setSelectedFrequency} 
								handleTabPressed={this.handleTabPressedOnDateSelector} />
							<PPayeeSelector ref={(c) => this.payeeSelector = c}
								activeField={this.state.activeField} setActiveField={this.setActiveField}
								selectedPayeeId={this.state.payeeId} manuallyEnteredPayeeName={this.state.manuallyEnteredPayeeName} 
								payeesList={filteredPayeesList} setSelectedPayeeId={this.setSelectedPayeeId} 
								setManuallyEnteredPayeeName={this.setManuallyEnteredPayeeName} handleTabPressed={this.handleTabPressedOnPayeeSelector} />
							<PCategorySelector ref={(c) => this.categorySelector = c} 
								dataFormatter={this.props.dataFormatter} selectorLabel="Category"
								activeField={this.state.activeField} setActiveField={this.setActiveField}
								selectedCategoryId={this.state.subCategoryId} manuallyEnteredCategoryName={this.state.manuallyEnteredCategoryName} 
								categoriesList={categoriesList} setSelectedCategoryId={this.setSelectedCategoryId} 
								setManuallyEnteredCategoryName={this.setManuallyEnteredCategoryName} handleTabPressed={this.handleTabPressedOnCategorySelector} />
							<PMemoInput ref={(c) => this.memoInput = c} 
								activeField={this.state.activeField} setActiveField={this.setActiveField}
								memo={this.state.memo} setMemo={this.setMemo} handleTabPressed={this.handleTabPressedOnMemoInput} />
							<PAmountInput ref={(c) => this.amountInput = c} 
								dataFormatter={this.props.dataFormatter}
								activeField={this.state.activeField} setActiveField={this.setActiveField}
								inflowAmount={this.state.inflowAmount} outflowAmount={this.state.outflowAmount} 
								setAmount={this.setAmount} handleTabPressedOnOutflow={this.handleTabPressedOnOutflowInput} 
								handleTabPressedOnInflow={this.handleTabPressedOnInflowInput} />
						</Form>
					</Modal.Body>
					<Modal.Footer>
						<Button ref={(c) => this.saveAndAddAnotherButton = c} className="dialog-primary-button"
							onClick={this.save} onKeyDown={this.handleKeyPressedOnSaveAndAddAnotherButton}>
							Save and add another&nbsp;<Glyphicon glyph="ok-sign" />
						</Button>
						<Button ref={(c) => this.saveButton = c} className="dialog-primary-button"
							onClick={this.save} onKeyDown={this.handleKeyPressedOnSaveButton}>
							Save&nbsp;<Glyphicon glyph="ok-sign" />
						</Button>
						<Button ref={(c) => this.cancelButton = c} className="dialog-secondary-button"
							onClick={this.close} onKeyDown={this.handleKeyPressedOnCancelButton}>
							Cancel&nbsp;<Glyphicon glyph="remove-sign" />
						</Button>
					</Modal.Footer>
				</Modal>
			);
		}
		else {
			return <div />;
		}
	}
}
