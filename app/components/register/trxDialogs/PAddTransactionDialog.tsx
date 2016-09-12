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

export interface PAddTransactionDialogProps { 

	// Entities collections from the global state 
	entitiesCollection:IEntitiesCollection;
	// Dispatch methods
	updateEntities:(entities:IEntitiesCollection)=>void;
}

export interface PAddTransactionDialogState {
	showModal: boolean;
	// Properties to save the values for the different fields. We wont create an actual transaction 
	// or scheduled transaction object until the user presses save.
	entityId?: string;
	flag?: string;
	accountId?: string;
	payeeId?: string;
	date?: utilities.DateWithoutTime;
	frequency?: string;
	subCategoryId?: string;
	memo?: string;
	amount?: number;
	cleared?: string;
}

export class PAddTransactionDialog extends React.Component<PAddTransactionDialogProps, PAddTransactionDialogState> {

	private accountSelector:PAccountSelector;
	private dateSelector:PDateSelector;
	private payeeSelector:PPayeeSelector;
	private categorySelector:PCategorySelector;
	private memoInput:PMemoInput;
	private amountInput:PAmountInput;

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
		this.setSelectedPayeeId = this.setSelectedPayeeId.bind(this);
		this.setSelectedCategoryId = this.setSelectedCategoryId.bind(this);
		this.setMemo = this.setMemo.bind(this);
		this.setAmount = this.setAmount.bind(this);
		this.handleTabPressedOnAccountSelector = this.handleTabPressedOnAccountSelector.bind(this);
		this.handleTabPressedOnDateSelector = this.handleTabPressedOnDateSelector.bind(this);
		this.handleTabPressedOnPayeeSelector = this.handleTabPressedOnPayeeSelector.bind(this);
		this.handleTabPressedOnCategorySelector = this.handleTabPressedOnCategorySelector.bind(this);
		this.handleTabPressedOnMemoInput = this.handleTabPressedOnMemoInput.bind(this);
		this.handleTabPressedOnAmountInput = this.handleTabPressedOnAmountInput.bind(this);

        this.state = { showModal: false };
    }

	private saveAndAddAnother():void {

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
				frequency: null,
				subCategoryId: null,
				memo: "",
				amount: 0,
			});
		}
		else {
			// If no account was passed, and neither were we able to select a default one, then 
			// that means there are no usable accounts in the budget.
			utilities.Logger.info("We cannot show the Add Transaction Dialog as there are no open accounts.");
		}
	};

	private save():void {

		// Close the modal dialog
		this.close();
	}

	private close():void {
		// Hide the modal, and set the account in state to null
		this.setState({ showModal: false });
	};

	private onEntered():void {
		var accountSelector = this.accountSelector;
		setTimeout(function(){
			accountSelector.showPopover();
		}, 100);
	}

	private setSelectedAccountId(accountId:string):void {
		var state = _.assign({}, this.state) as PAddTransactionDialogState;
		state.accountId = accountId;
		this.setState(state);
	}

	private setSelectedDate(date:utilities.DateWithoutTime):void {
		var state = _.assign({}, this.state) as PAddTransactionDialogState;
		state.date = date;
		this.setState(state);
	}

	private setSelectedPayeeId(payeeId:string):void {
		var state = _.assign({}, this.state) as PAddTransactionDialogState;
		state.payeeId = payeeId;
		this.setState(state);
	}

	private setSelectedCategoryId(subCategoryId:string):void {
		var state = _.assign({}, this.state) as PAddTransactionDialogState;
		state.subCategoryId = subCategoryId;
		this.setState(state);
	}

	private setMemo(memo:string):void {
		var state = _.assign({}, this.state) as PAddTransactionDialogState;
		state.memo = memo;
		this.setState(state);
	}

	private setAmount(amount:number):void {
		var state = _.assign({}, this.state) as PAddTransactionDialogState;
		state.amount = amount;
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
			// Set focus on memo input
			// this.dateSelector.showPopover();
		}
	}

	private handleTabPressedOnMemoInput(shiftKeyPressed:boolean):void {

		// If shift key is not pressed then move the focus on to the amount input. 
		// Otherwise move the focus back to the category selector. 
		if(!shiftKeyPressed) {
			// Show the category selector popover
			this.categorySelector.showPopover();
		}
		else {
			// Set focus on memo input
			// this.dateSelector.showPopover();
		}
	}

	private handleTabPressedOnAmountInput(shiftKeyPressed:boolean):void {

		// If shift key is not pressed then move the focus on to the save button. 
		// Otherwise move the focus back to the memo input. 
		if(!shiftKeyPressed) {
			// Set focus on the save button
			// this.categorySelector.showPopover();
		}
		else {
			// Set focus on memo input
			// this.dateSelector.showPopover();
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

		var transferPayeesList:Array<objects.IPayeeObject> = [{
			entityId: "0",
			name: "Transfer to/from account:",
			isTransferPayee: false,
			isSectionItem: true
		}];
		var nonTransferPayeesList:Array<objects.IPayeeObject> = [{
			entityId: "1",
			name: "Memorized:",
			isTransferPayee: false,
			isSectionItem: true
		}];
		// Go through the payee entities and build a list of non-tombstoned, non-internal payees
		_.forEach(this.props.entitiesCollection.payees, (payee)=>{

			if(payee.isTombstone == 0 && payee.accountId) {
				transferPayeesList.push({
					entityId: payee.entityId,
					name: payee.name,
					isTransferPayee: true,
					isSectionItem: false
				});
			}
			else if(payee.isTombstone == 0 && !payee.accountId && !payee.internalName) {
				nonTransferPayeesList.push({
					entityId: payee.entityId,
					name: payee.name,
					isTransferPayee: false,
					isSectionItem: false
				});
			}
		}); 

		return transferPayeesList.concat(nonTransferPayeesList);
	}

	private buildCategoriesList():Array<objects.ICategoryObject> {

		var categoriesList:Array<objects.ICategoryObject> = [];
		var masterCategories = this.props.entitiesCollection.masterCategories;
		var subCategories = this.props.entitiesCollection.subCategories;

		var internalMasterCategory = masterCategories.getInternalMasterCategory();
		var immediateIncomeSubCategory = subCategories.getImmediateIncomeSubCategory();
		// At the top of the list, we want entries for "Inflow" and "To be Budgeted"
		categoriesList.push({
			entityId: internalMasterCategory.entityId,
			name: "Inflow",
			isMasterCategory: true,
			isInflow: false
		});
		categoriesList.push({
			entityId: immediateIncomeSubCategory.entityId,
			name: "To be Budgeted",
			isMasterCategory: false,
			isInflow: true
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
						isInflow: false
					});

					// Add items for all the subCategories for this master category
					_.forEach(filteredSubCategories, (subCategory)=>{
						categoriesList.push({
							entityId: subCategory.entityId,
							name: subCategory.name,
							isMasterCategory: false,
						isInflow: false
						});
					});
				}
			}
		});

		return categoriesList;
	}

	public render() {

		return (
			<Modal show={this.state.showModal} onEntered={this.onEntered} onHide={this.close} backdrop="static" keyboard={false} dialogClassName="add-transaction-dialog">
				<Modal.Header bsClass="modal-header">
					<Modal.Title>Add Transaction</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form horizontal>
						<PAccountSelector ref={(c) => this.accountSelector = c} 
							selectedAccountId={this.state.accountId} accountsList={this.accountsList} 
							setSelectedAccountId={this.setSelectedAccountId} handleTabPressed={this.handleTabPressedOnAccountSelector} />
						<PDateSelector ref={(c) => this.dateSelector = c} 
							selectedDate={this.state.date} setSelectedDate={this.setSelectedDate} handleTabPressed={this.handleTabPressedOnDateSelector} />
						<PPayeeSelector ref={(c) => this.payeeSelector = c} 
							selectedPayeeId={this.state.payeeId} payeesList={this.payeesList} 
							setSelectedPayeeId={this.setSelectedPayeeId} handleTabPressed={this.handleTabPressedOnPayeeSelector} />
						<PCategorySelector ref={(c) => this.categorySelector = c} 
							selectedCategoryId={this.state.subCategoryId} categoriesList={this.categoriesList}
							setSelectedCategoryId={this.setSelectedCategoryId} handleTabPressed={this.handleTabPressedOnCategorySelector} />
						<PMemoInput ref={(c) => this.memoInput = c} 
							memo={this.state.memo} setMemo={this.setMemo} handleTabPressed={this.handleTabPressedOnMemoInput} />
						<PAmountInput ref={(c) => this.amountInput = c} 
							amount={this.state.amount} setAmount={this.setAmount} handleTabPressed={this.handleTabPressedOnAmountInput} />
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.close}>
						Cancel&nbsp;<Glyphicon glyph="remove-sign" />
					</Button>
					<Button onClick={this.save}>
						Save and add another&nbsp;<Glyphicon glyph="ok-sign" />
					</Button>
					<Button onClick={this.save}>
						Save&nbsp;<Glyphicon glyph="ok-sign" />
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
