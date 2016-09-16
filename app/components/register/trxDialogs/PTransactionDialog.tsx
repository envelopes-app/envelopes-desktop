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

import * as constants from '../../../constants';
import * as utilities from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import * as objects from '../../../interfaces/objects';
import { IEntitiesCollection, ITransactionValues } from '../../../interfaces/state';

export interface PTransactionDialogProps { 

	dialogTitle:string;
	// Entities collections from the global state 
	entitiesCollection:IEntitiesCollection;
	// Dispatch methods
	updateEntities:(entities:IEntitiesCollection)=>void;
}

export interface PTransactionDialogState {
	showModal: boolean;
	// Properties to save the values for the different fields. We wont create an actual transaction 
	// or scheduled transaction object until the user presses save.
	entityId?: string;
	flag?: string;
	accountId?: string;
	payeeId?: string;
	manuallyEnteredPayeeName?: string;
	date?: utilities.DateWithoutTime;
	frequency?: string;
	subCategoryId?: string;
	manuallyEnteredCategoryName?: string;
	memo?: string;
	inflowAmount?: number;
	outflowAmount?: number;
	cleared?: string;
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
	 
	constructor(props: any) {
        super(props);
		this.show = this.show.bind(this);
		this.save = this.save.bind(this);
		this.close = this.close.bind(this);
		this.onEntered = this.onEntered.bind(this);

		this.setSelectedAccountId = this.setSelectedAccountId.bind(this);
		this.setSelectedDate = this.setSelectedDate.bind(this);
		this.setSelectedFrequency = this.setSelectedFrequency.bind(this);
		this.setSelectedPayeeId = this.setSelectedPayeeId.bind(this);
		this.setManuallyEnteredPayeeName = this.setManuallyEnteredPayeeName.bind(this);
		this.setSelectedCategoryId = this.setSelectedCategoryId.bind(this);
		this.setManuallyEnteredCategoryName = this.setManuallyEnteredCategoryName.bind(this);
		this.setMemo = this.setMemo.bind(this);
		this.setAmount = this.setAmount.bind(this);
		this.handleTabPressedOnAccountSelector = this.handleTabPressedOnAccountSelector.bind(this);
		this.handleTabPressedOnDateSelector = this.handleTabPressedOnDateSelector.bind(this);
		this.handleTabPressedOnPayeeSelector = this.handleTabPressedOnPayeeSelector.bind(this);
		this.handleTabPressedOnCategorySelector = this.handleTabPressedOnCategorySelector.bind(this);
		this.handleTabPressedOnMemoInput = this.handleTabPressedOnMemoInput.bind(this);
		this.handleTabPressedOnAmountInput = this.handleTabPressedOnAmountInput.bind(this);
		this.handleKeyPressedOnSaveAndAddAnotherButton = this.handleKeyPressedOnSaveAndAddAnotherButton.bind(this);
		this.handleKeyPressedOnSaveButton = this.handleKeyPressedOnSaveButton.bind(this);
		this.handleKeyPressedOnCancelButton = this.handleKeyPressedOnCancelButton.bind(this);

        this.state = { showModal: false };
    }

	public show(accountId:string = null):void {

		// if this dialog is being shown from the "All Accounts", we would get a null accountId.
		// In that case, we need to choose a default account that would be set initially in the accounts field.
		if(!accountId) {
			var account = utilities.EntitiesLookupHelper.getDefaultAccountForAddTransactionDialog(this.props.entitiesCollection);
			if(account)
				accountId = account.entityId;
		}

		if(accountId) {
			// Before updating the state, refresh the lists of accounts, payees and categories 
			// for showing in the popovers of the transaction dialog.
			this.accountsList = this.buildAccountsList();
			this.payeesList = this.buildPayeesList();
			this.categoriesList = this.buildCategoriesList();

			// Update the state of this dialog to make it visible. 
			// Also reset all the fields for storing the values for the new transaction 
			this.setState({ 
				showModal: true,
				entityId: utilities.KeyGenerator.generateUUID(),
				accountId: accountId,
				payeeId: null,
				date: utilities.DateWithoutTime.createForToday(),
				frequency: constants.TransactionFrequency.Never,
				subCategoryId: null,
				memo: "",
				inflowAmount: 0,
				outflowAmount: 0
			});
		}
		else {
			// If no account was passed, and neither were we able to select a default one, then 
			// that means there are no usable accounts in the budget.
			utilities.Logger.info("We cannot show the Transaction Dialog as there are no open accounts.");
		}
	};

	private saveAndAddAnother():void {

	}

	private save():void {

		// Close the modal dialog
		this.close();
	}

	private close():void {
		// Hide the modal, and set the account in state to null
		this.setState({ showModal: false });
	};

	private onEntered():void {
		var dateSelector = this.dateSelector;
		setTimeout(function(){
			dateSelector.showPopover();
		}, 100);
	}

	private setSelectedAccountId(accountId:string):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.accountId = accountId;
		this.setState(state);
	}

	private setSelectedDate(date:utilities.DateWithoutTime):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.date = date;
		this.setState(state);
	}

	private setSelectedFrequency(frequency:string):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.frequency = frequency;
		this.setState(state);
	}

	private setSelectedPayeeId(payeeId:string):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.payeeId = payeeId;
		this.setState(state);
	}

	private setManuallyEnteredPayeeName(payeeName:string):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.manuallyEnteredPayeeName = payeeName;
		// When the user starts manually typing in a payeeName, clear the payeeId value
		state.payeeId = null;
		this.setState(state);
	}

	private setSelectedCategoryId(subCategoryId:string, clearManuallyEnteredCategoryName:boolean = false):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.subCategoryId = subCategoryId;
		if(clearManuallyEnteredCategoryName)
			state.manuallyEnteredCategoryName = null;
		this.setState(state);
	}

	private setManuallyEnteredCategoryName(categoryName:string):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.manuallyEnteredCategoryName = categoryName;
		// When the user starts manually typing in a categoryName, clear the categoryId value
		state.subCategoryId = null;
		this.setState(state);
	}

	private setMemo(memo:string):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.memo = memo;
		this.setState(state);
	}

	private setAmount(inflowAmount:number, outflowAmount:number):void {
		var state = _.assign({}, this.state) as PTransactionDialogState;
		state.inflowAmount = inflowAmount;
		state.outflowAmount = outflowAmount;
		this.setState(state);
	}

	private handleTabPressedOnAccountSelector(shiftKeyPressed:boolean):void {

		// If shift key is not pressed then move the focus on to the date selector. 
		if(!shiftKeyPressed) {
			// Show the date selector popover
			this.dateSelector.showPopover();
			// Hide the account selector popover
			this.accountSelector.hidePopover(); 
		}
		else {
			// Set focus on the "cancel" button
			(ReactDOM.findDOMNode(this.cancelButton) as any).focus();
		}
	}

	private handleTabPressedOnDateSelector(shiftKeyPressed:boolean):void {

		// Hide the date selector popover
		this.dateSelector.hidePopover(); 
		// If shift key is not pressed then move the focus on to the payee selector. 
		// Otherwise move the focus back to the account selector. 
		if(!shiftKeyPressed) {
			// Show the payee selector popover
			this.payeeSelector.showPopover();
		}
		else {
			// Show the payee selector popover
			this.accountSelector.showPopover();
		}
	}

	private handleTabPressedOnPayeeSelector(shiftKeyPressed:boolean):void {

		// Hide the payee selector popover
		this.payeeSelector.hidePopover(); 
		// If shift key is not pressed then move the focus on to the category selector. 
		// Otherwise move the focus back to the date selector. 
		if(!shiftKeyPressed) {
			// Show the category selector popover
			this.categorySelector.showPopover();
		}
		else {
			// Show the date selector popover
			this.dateSelector.showPopover();
		}
	}

	private handleTabPressedOnCategorySelector(shiftKeyPressed:boolean):void {

		// Hide the category selector popover
		this.categorySelector.hidePopover(); 
		// If shift key is not pressed then move the focus on to the memo input. 
		// Otherwise move the focus back to the payee selector. 
		if(!shiftKeyPressed) {
			// Move focus on to the memo input
			this.memoInput.setFocus();
		}
		else {
			// Show the payee selector popover
			this.payeeSelector.showPopover();
		}
	}

	private handleTabPressedOnMemoInput(shiftKeyPressed:boolean):void {

		// If shift key is not pressed then move the focus on to the amount input. 
		// Otherwise move the focus back to the category selector. 
		if(!shiftKeyPressed) {
			// Set focus on amount input
			// If the selected category is of inflow type, then move the focus on to
			// the inflow field. Otherwise move to the outflow field.
			var imediateIncomeSubCategory = this.props.entitiesCollection.subCategories.getImmediateIncomeSubCategory();
			if(this.state.subCategoryId && imediateIncomeSubCategory.entityId == this.state.subCategoryId)
				this.amountInput.setFocusOnInflow();
			else
				this.amountInput.setFocusOnOutflow();
		}
		else {
			// Show the category selector popover
			this.categorySelector.showPopover();
		}
	}

	private handleTabPressedOnAmountInput(shiftKeyPressed:boolean):void {

		// If shift key is not pressed then move the focus on to the save button. 
		// Otherwise move the focus back to the amount input. 
		if(!shiftKeyPressed) {
			// Set focus on the "save and add another" button
			(ReactDOM.findDOMNode(this.saveAndAddAnotherButton) as any).focus();
			event.preventDefault();
		}
		else {
			// Move focus on to the memo input
			this.memoInput.setFocus();
		}
	}

	private handleKeyPressedOnSaveAndAddAnotherButton(event:KeyboardEvent):void {

		if(event.keyCode == 9) {
			event.preventDefault();
			if(!event.shiftKey) {
				// Set focus on the "save" button
				(ReactDOM.findDOMNode(this.saveButton) as any).focus();
			}
			else {
				// Set the focus back on to the amount inflow control
				this.amountInput.setFocusOnInflow();
			}
		}
	}

	private handleKeyPressedOnSaveButton(event:KeyboardEvent):void {

		if(event.keyCode == 9) {
			event.preventDefault();
			if(!event.shiftKey) {
				// Set focus on the "cancel" button
				(ReactDOM.findDOMNode(this.cancelButton) as any).focus();
			}
			else {
				// Set the focus back on to the "save and add another" button
				(ReactDOM.findDOMNode(this.saveAndAddAnotherButton) as any).focus();
			}
		}
	}

	private handleKeyPressedOnCancelButton(event:KeyboardEvent):void {

		if(event.keyCode == 9) {
			event.preventDefault();
			if(!event.shiftKey) {
				// Set focus on the account input
				this.accountSelector.showPopover();
			}
			else {
				// Set the focus back on to the "save" button
				(ReactDOM.findDOMNode(this.saveButton) as any).focus();
			}
		}
	}

	private buildAccountsList():Array<objects.IAccountObject> {

		var accountsList:Array<objects.IAccountObject> = [];
		// Go through the account entities and build a list of open, non-tombstoned accounts
		_.forEach(this.props.entitiesCollection.accounts, (account)=>{

			if(account.isTombstone == 0 && account.closed == 0) {
				accountsList.push({
					entityId: account.entityId,
					name: account.accountName
				});
			}
		});

		return accountsList; 
	}

	private buildPayeesList():Array<objects.IPayeeObject> {

		var payeesList:Array<objects.IPayeeObject> = [];
		// Go through the payee entities and build a list of non-tombstoned, non-internal payees
		_.forEach(this.props.entitiesCollection.payees, (payee)=>{

			if(payee.isTombstone == 0 && !payee.internalName) {
				payeesList.push({
					entityId: payee.entityId,
					name: payee.name,
					accountId: payee.accountId,
					isTransferPayee: payee.accountId ? true : false
				});
			}
		}); 

		return payeesList;
	}

	private buildCategoriesList():Array<objects.ICategoryObject> {

		var categoriesList:Array<objects.ICategoryObject> = [];
		var masterCategories = this.props.entitiesCollection.masterCategories;
		var subCategories = this.props.entitiesCollection.subCategories;
		var monthlyBudgets = this.props.entitiesCollection.monthlyBudgets;
		var monthlySubCategoryBudgets = this.props.entitiesCollection.monthlySubCategoryBudgets;

		var internalMasterCategory = masterCategories.getInternalMasterCategory();
		var immediateIncomeSubCategory = subCategories.getImmediateIncomeSubCategory();
		// Get the MonthlyBudget and MonthlySubCategoryBudgets for the current month.
		var currentMonth = utilities.DateWithoutTime.createForCurrentMonth();
		var monthlyBudgetForCurrentMonth:budgetEntities.IMonthlyBudget = monthlyBudgets.getMonthlyBudgetByMonth(currentMonth.toISOString()); 
		var monthlySubCategoryBudgetsForCurrentMonth = monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsByMonth(currentMonth.toISOString()); 
		// Create a map of the montlySubCategoryBudgets by their subCategoryId
		var monthlySubCategoryBudgetsMap:utilities.SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget> = {};
		_.forEach(monthlySubCategoryBudgetsForCurrentMonth, (monthlySubCategoryBudget)=>{
			monthlySubCategoryBudgetsMap[monthlySubCategoryBudget.subCategoryId] = monthlySubCategoryBudget;
		});

		// At the top of the list, we want entries for "Inflow" and "To be Budgeted"
		categoriesList.push({
			entityId: internalMasterCategory.entityId,
			name: "Inflow",
			isMasterCategory: true,
			isInflow: false,
			masterCategoryId: null,
			availableAmount: 0
		});
		categoriesList.push({
			entityId: immediateIncomeSubCategory.entityId,
			name: "To be Budgeted",
			isMasterCategory: false,
			isInflow: true,
			masterCategoryId: internalMasterCategory.entityId,
			availableAmount: monthlyBudgetForCurrentMonth ? monthlyBudgetForCurrentMonth.availableToBudget : 0
		});

		// Go through the master categories and build a list of non-tombstoned, non-internal master categories
		_.forEach(masterCategories, (masterCategory)=>{

			if(masterCategory.isTombstone == 0 && masterCategory.isHidden == 0 && !masterCategory.internalName) {

				// Get all the subcategories for this master category 
				var filteredSubCategories = subCategories.getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategory.entityId);
				// If there are no subcategories for this master category, skip adding it to the list
				if(filteredSubCategories.length > 0) {

					categoriesList.push({
						entityId: masterCategory.entityId,
						name: masterCategory.name,
						isMasterCategory: true,
						isInflow: false,
						masterCategoryId: null,
						availableAmount: 0
					});

					// Add items for all the subCategories for this master category
					_.forEach(filteredSubCategories, (subCategory)=>{

						// Get the monthlySubCategoryBudget entity for this subCategory
						var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[subCategory.entityId];
						categoriesList.push({
							entityId: subCategory.entityId,
							name: subCategory.name,
							isMasterCategory: false,
							isInflow: false,
							masterCategoryId: masterCategory.entityId,
							availableAmount: monthlySubCategoryBudget ? monthlySubCategoryBudget.balance : 0
						});
					});
				}
			}
		});

		return categoriesList;
	}

	private validateTransaction():boolean {


		return true;
	}

	public render() {

		// Whatever the current selected account is, we need to remove it's corresponding payee from the payees list 
		var filteredPayeesList = _.filter(this.payeesList, (payeeObj:objects.IPayeeObject)=>{
			payeeObj.accountId != this.state.accountId
		});

		var filteredCategoriesList = this.categoriesList;
		if(this.state.manuallyEnteredCategoryName && this.state.manuallyEnteredCategoryName != "") {

			// Filter the list of categoris by the manuallyEnteredCategoryName
			var filteredCategoriesList = _.filter(this.categoriesList, (categoryObj:objects.ICategoryObject)=>{
				return (categoryObj.isMasterCategory || categoryObj.name.includes(this.state.manuallyEnteredCategoryName));
			});

			// We also want to remove all those master catgories that do not have any subcategories below them
			// after the applying the above filter. Iterate through the list and take count of subcategories 
			// for each of the master category.
			var categoriesCounter:utilities.SimpleObjectMap<number> = {};
			_.forEach(filteredCategoriesList, (categoryObj)=>{

				if(categoryObj.isMasterCategory == false) {
					var counter = categoriesCounter[categoryObj.masterCategoryId] ? categoriesCounter[categoryObj.masterCategoryId] + 1 : 1;
					categoriesCounter[categoryObj.masterCategoryId] = counter;
				}
			});

			// Now filter out those master categories which do not have any subcategories below them
			filteredCategoriesList = _.filter(filteredCategoriesList, (categoryObj)=>{
				return (
					categoryObj.isMasterCategory == false || 
					(categoryObj.isMasterCategory && categoriesCounter[categoryObj.entityId])
				);
			});
		}

		return (
			<Modal show={this.state.showModal} onEntered={this.onEntered} onHide={this.close} backdrop="static" keyboard={false} dialogClassName="add-transaction-dialog">
				<Modal.Header bsClass="modal-header">
					<Modal.Title>{this.props.dialogTitle}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form horizontal>
						<PAccountSelector ref={(c) => this.accountSelector = c} 
							selectedAccountId={this.state.accountId} accountsList={this.accountsList} 
							setSelectedAccountId={this.setSelectedAccountId} handleTabPressed={this.handleTabPressedOnAccountSelector} />
						<PDateSelector ref={(c) => this.dateSelector = c} 
							selectedDate={this.state.date} selectedFrequency={this.state.frequency} setSelectedDate={this.setSelectedDate} 
							setSelectedFrequency={this.setSelectedFrequency} handleTabPressed={this.handleTabPressedOnDateSelector} />
						<PPayeeSelector ref={(c) => this.payeeSelector = c}
							selectedPayeeId={this.state.payeeId} manuallyEnteredPayeeName={this.state.manuallyEnteredPayeeName} 
							payeesList={filteredPayeesList} setSelectedPayeeId={this.setSelectedPayeeId} 
							setManuallyEnteredPayeeName={this.setManuallyEnteredPayeeName} handleTabPressed={this.handleTabPressedOnPayeeSelector} />
						<PCategorySelector ref={(c) => this.categorySelector = c} 
							selectedCategoryId={this.state.subCategoryId} manuallyEnteredCategoryName={this.state.manuallyEnteredCategoryName} 
							categoriesList={filteredCategoriesList} setSelectedCategoryId={this.setSelectedCategoryId} 
							setManuallyEnteredCategoryName={this.setManuallyEnteredCategoryName} handleTabPressed={this.handleTabPressedOnCategorySelector} />
						<PMemoInput ref={(c) => this.memoInput = c} 
							memo={this.state.memo} setMemo={this.setMemo} handleTabPressed={this.handleTabPressedOnMemoInput} />
						<PAmountInput ref={(c) => this.amountInput = c} 
							inflowAmount={this.state.inflowAmount} outflowAmount={this.state.outflowAmount} 
							setAmount={this.setAmount} handleTabPressed={this.handleTabPressedOnAmountInput} />
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button ref={(c) => this.saveAndAddAnotherButton = c} className="dialog-button"
						onClick={this.save} onKeyDown={this.handleKeyPressedOnSaveAndAddAnotherButton}>
						Save and add another&nbsp;<Glyphicon glyph="ok-sign" />
					</Button>
					<Button ref={(c) => this.saveButton = c} className="dialog-button"
						onClick={this.save} onKeyDown={this.handleKeyPressedOnSaveButton}>
						Save&nbsp;<Glyphicon glyph="ok-sign" />
					</Button>
					<Button ref={(c) => this.cancelButton = c} className="dialog-cancel-button"
						onClick={this.close} onKeyDown={this.handleKeyPressedOnCancelButton}>
						Cancel&nbsp;<Glyphicon glyph="remove-sign" />
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
