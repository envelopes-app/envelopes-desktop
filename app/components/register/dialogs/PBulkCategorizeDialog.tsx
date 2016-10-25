/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, FormControl, Modal, Glyphicon } from 'react-bootstrap';

import { DialogUtilities } from '../../../utilities';
import * as objects from '../../../interfaces/objects';
import { ITransaction, IScheduledTransaction } from '../../../interfaces/budgetEntities';
import { IRegisterState, IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PBulkCategorizeDialogProps {
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PBulkCategorizeDialogState {
	showModal:boolean;
	registerState:IRegisterState;
	selectedCategoryId:string;
	categoriesList:Array<objects.ICategoryObject>;
}

const ScrollableContainerStyle = {
	overflowY: "scroll",
}

export class PBulkCategorizeDialog extends React.Component<PBulkCategorizeDialogProps, PBulkCategorizeDialogState> {

	constructor(props: any) {
        super(props);
		this.hide = this.hide.bind(this);
		this.handleOkClicked = this.handleOkClicked.bind(this);
		this.state = {
			showModal:false,
			registerState:null,
			selectedCategoryId:null,
			categoriesList:null
		};
	}

	public isShowing():boolean {
		return this.state.showModal;
	}
	
	public show(registerState:IRegisterState):void {

		// Get the subCategory for the passed subCategoryId
		var state = Object.assign({}, this.state) as PBulkCategorizeDialogState;
		state.showModal = true;
		state.registerState = registerState;
		state.categoriesList = DialogUtilities.buildCategoriesList(this.props.entitiesCollection);
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PBulkCategorizeDialogState;
		state.showModal = false;
		state.registerState = null;
		state.categoriesList = null;
		this.setState(state);
	}

	private handleOkClicked():void {

		if(!this.state.selectedCategoryId)
			return;

		// Get all the selected transactions from the registerState and set their subcategories
		// equal to te selected category id
		var changedEntities:ISimpleEntitiesCollection = {
			transactions:[],
			scheduledTransactions: []
		};

		var transactionsArray = this.props.entitiesCollection.transactions;
		var scheduledTransactionsArray = this.props.entitiesCollection.scheduledTransactions;
		var selectedTransactionIds = this.state.registerState.selectedTransactions;

		_.forEach(selectedTransactionIds, (transactionId)=>{

			var transaction = transactionsArray.getEntityById(transactionId);
			if(transaction) {
				var updatedTransaction = Object.assign({}, transaction);
				updatedTransaction.subCategoryId = this.state.selectedCategoryId;
				changedEntities.transactions.push(updatedTransaction);
			}
			else {
				var scheduledTransaction = scheduledTransactionsArray.getEntityById(transactionId);
				if(scheduledTransaction) {
					var updatedScheduledTransaction = Object.assign({}, scheduledTransaction);
					updatedScheduledTransaction.subCategoryId = this.state.selectedCategoryId;
					changedEntities.scheduledTransactions.push(updatedScheduledTransaction);
				}
			}
		});

		this.props.updateEntities(changedEntities);
		this.hide();
	}

	private setSelectedCategoryId(subCategoryId:string) {

		// This method is called when the user selects an item from the popover using mouse click
		if(this.state.selectedCategoryId != subCategoryId) {
			var state = Object.assign({}, this.state);
			state.selectedCategoryId = subCategoryId;
			this.setState(state);
		}
	}

	private getCategoriesDisplayList():JSX.Element {

		var selectedCategoryId:string = this.state.selectedCategoryId;
		var categoriesList:Array<objects.ICategoryObject> = this.state.categoriesList;

		var categoiresItem:JSX.Element;
		var categoiresItems:Array<JSX.Element> = [];
		
		// Get the currently selected category so that we can highlight the corresponding item
		var selectedCategory = selectedCategoryId ? _.find(this.state.categoriesList, {entityId: selectedCategoryId}) : null;

		// Iterate through the passed categories and create list items for them
		_.forEach(categoriesList, (category:objects.ICategoryObject)=>{

			if(category.isMasterCategory) {
				// Create the list item for the master category
				categoiresItem = <li key={category.entityId} className="categories-dropdown-list-section">{category.name}:</li>;
				categoiresItems.push(categoiresItem);
			}
			else {
				var availableAmountClassName = "categories-dropdown-list-positive-available-amount";
				if(category.availableAmount == 0)
					availableAmountClassName = "categories-dropdown-list-zero-available-amount";
				else if(category.availableAmount < 0)
					availableAmountClassName = "categories-dropdown-list-negative-available-amount";

				if(selectedCategory && selectedCategory.entityId == category.entityId) {
					categoiresItem = (
						<div key={category.entityId} className="categories-dropdown-list-item-selected" 
							id={category.entityId}>
							<label className="categories-dropdown-list-categoryname">{category.name}</label>
							<label className={availableAmountClassName}>{category.availableAmount}</label>
						</div>
					);
				}
				else {
					categoiresItem = (
						<div key={category.entityId} className="categories-dropdown-list-item" 
							id={category.entityId} onClick={this.setSelectedCategoryId.bind(this, category.entityId)}>
							<label className="categories-dropdown-list-categoryname">{category.name}</label>
							<label className={availableAmountClassName}>{category.availableAmount}</label>
						</div>
					);
				}

				categoiresItems.push(categoiresItem);
			}
		});

		return (
			<ul className="categories-dropdown-list" style={ScrollableContainerStyle}>
				{categoiresItems}
			</ul>
		);
	}

	public render() {

		if(this.state.showModal) {

			var categoriesList = this.getCategoriesDisplayList();
			var selectedCategoryName = "";
			if(this.state.selectedCategoryId) {
				_.forEach(this.state.categoriesList, (categoryObject)=>{

					if(categoryObject.entityId == this.state.selectedCategoryId) {
						selectedCategoryName = categoryObject.name;
						return false;
					}
				});
			}

			return (
				<Modal show={this.state.showModal} animation={false} onHide={this.hide} keyboard={false} dialogClassName="bulk-categorize-dialog">
					<Modal.Header bsClass="modal-header">
						<Modal.Title>Categorize transactions as</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<FormControl type="text" componentClass="input"  
							readOnly={true} value={selectedCategoryName} />
						<div style={{height:"5px"}} />
						{categoriesList}
					</Modal.Body>
					<Modal.Footer>
						<Button className="dialog-secondary-button" onClick={this.hide}>
							Cancel&nbsp;<Glyphicon glyph="remove-sign" />
						</Button>
						<Button className="dialog-primary-button" onClick={this.handleOkClicked}>
							OK&nbsp;<Glyphicon glyph="ok-sign" />
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
