/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Col, ControlLabel, Form, FormGroup, FormControl, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import * as objects from '../../../interfaces/objects';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { DialogUtilities, DateWithoutTime } from '../../../utilities/';
import { PCategorySelector } from '../../register/trxDialog/PCategorySelector';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PCoverOverspendingDialogProps {
	entitiesCollection:IEntitiesCollection
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PCoverOverspendingDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	toSubCategoryId:string;
	currentMonth:DateWithoutTime;
	amountToCover:number;
	fromSubCategoryId:string;
	manuallyEnteredCategoryName:string;
}

const PopoverStyle = {
	maxWidth: 'none',
	width:'300px'
}

const HRStyle = {
	marginTop: "10px",
	marginBottom: "10px"
}

const OkButtonStyle = {
	marginLeft: "10px"
}

export class PCoverOverspendingDialog extends React.Component<PCoverOverspendingDialogProps, PCoverOverspendingDialogState> {

	private okButton:Button;
	private cancelButton:Button;
	private categorySelector:PCategorySelector;

	private categoriesList:Array<objects.ICategoryObject>;

	constructor(props: any) {
        super(props);
		this.setSelectedCategoryId = this.setSelectedCategoryId.bind(this);
		this.setManuallyEnteredCategoryName = this.setManuallyEnteredCategoryName.bind(this);
		this.handleTabPressedOnCategorySelector = this.handleTabPressedOnCategorySelector.bind(this);
		this.onOkClick = this.onOkClick.bind(this);
		this.onCancelClick = this.onCancelClick.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"left", 
			toSubCategoryId: null,
			currentMonth: null,
			amountToCover: 0,
			fromSubCategoryId: null,
			manuallyEnteredCategoryName: null 
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}

	private onOkClick():void { 

		var currentMonth = this.state.currentMonth;
		var amountToCover = this.state.amountToCover;
		var toSubCategoryId = this.state.toSubCategoryId;
		var fromSubCategoryId = this.state.fromSubCategoryId;
		var entitiesCollection = this.props.entitiesCollection;

		if(amountToCover != 0 && fromSubCategoryId != null && fromSubCategoryId != toSubCategoryId) {

			// Get the subcategory entities for both the "to" and "from" subcategories
			var toSubCategory = entitiesCollection.subCategories.getEntityById(toSubCategoryId);
			var fromSubCategory = entitiesCollection.subCategories.getEntityById(fromSubCategoryId);
			// Get the monthlySubCategoryBudget entities for both the "to" and "from" subcategories
			var toMonthlySubCategoryBudget = this.props.entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(toSubCategoryId, currentMonth.toISOString());
			var fromMonthlySubCategoryBudget = entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(fromSubCategoryId, currentMonth.toISOString());

			var changedEntities:ISimpleEntitiesCollection = {
				monthlySubCategoryBudgets:[]
			};

			// If we are moving money from a subcategory other then "To Be Budgeted", then we need to 
			// subtract the amount from it's budgeted value.
			if(!fromSubCategory.internalName) {
				fromMonthlySubCategoryBudget = Object.assign({}, fromMonthlySubCategoryBudget);
				fromMonthlySubCategoryBudget.budgeted -= amountToCover;
				changedEntities.monthlySubCategoryBudgets.push(fromMonthlySubCategoryBudget);
			}

			// If we are moving money to a subcategory other then "To be Budgeted", then we need to
			// add the amount to it's budgeted value.
			if(!toSubCategory.internalName) {
				toMonthlySubCategoryBudget = Object.assign({}, toMonthlySubCategoryBudget);
				toMonthlySubCategoryBudget.budgeted += amountToCover;
				changedEntities.monthlySubCategoryBudgets.push(toMonthlySubCategoryBudget);
			}

			// Persist the changes
			this.props.updateEntities(changedEntities);
		}

		// Hide the dialog
		this.hide();
	}

	private onCancelClick():void { 
		// Hide the dialog
		this.hide();
	}
	
	public show(subCategoryId:string, month:DateWithoutTime, amountToCover:number, target:HTMLElement, placement:string = "left"):void {

		// Get the subCategory for the passed subCategoryId
		var subCategory = this.props.entitiesCollection.subCategories.getEntityById(subCategoryId);
		var monthlySubCategoryBudget = this.props.entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(subCategoryId, month.toISOString());
		if(subCategory && monthlySubCategoryBudget) {

			// Create the categories list for populating the category selector
			this.categoriesList = DialogUtilities.buildCategoriesList(this.props.entitiesCollection);

			var state = Object.assign({}, this.state) as PCoverOverspendingDialogState;
			state.show = true;
			state.target = target;
			state.placement = placement;
			state.toSubCategoryId = subCategoryId;
			state.currentMonth = month;
			// This would be a negative value, so switching signs on it
			state.amountToCover = -amountToCover; 
			state.fromSubCategoryId = null;
			state.manuallyEnteredCategoryName = null; 
			this.setState(state);
		}
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PCoverOverspendingDialogState;
		state.show = false;
		this.setState(state);
	}

	private setSelectedCategoryId(subCategoryId:string, clearManuallyEnteredCategoryName:boolean = false):void {
		var state = Object.assign({}, this.state) as PCoverOverspendingDialogState;
		state.fromSubCategoryId = subCategoryId;
		if(clearManuallyEnteredCategoryName)
			state.manuallyEnteredCategoryName = null;
		this.setState(state);
	}

	private setManuallyEnteredCategoryName(categoryName:string):void {
		var state = Object.assign({}, this.state) as PCoverOverspendingDialogState;
		state.manuallyEnteredCategoryName = categoryName;
		// When the user starts manually typing in a categoryName, clear the categoryId value
		state.fromSubCategoryId = null;
		this.setState(state);
	}

	private handleTabPressedOnCategorySelector(shiftKeyPressed:boolean):void {

		// If shift key is not pressed then move the focus to the ok button. 
		if(!shiftKeyPressed) {
			// Set focus on the "ok" button
			(ReactDOM.findDOMNode(this.okButton) as any).focus();
		}
		else {
			// Set focus on the "cancel" button
			(ReactDOM.findDOMNode(this.cancelButton) as any).focus();
		}
	}

	public render() {

		var categoriesList = this.categoriesList;

		return (
			<Overlay show={this.state.show} placement={this.state.placement} 
				rootClose={false} onHide={this.onCancelClick} target={()=> ReactDOM.findDOMNode(this.state.target)}>
				<Popover id="coverOverspendingDialog" style={PopoverStyle}>
					<Form>
						<PCategorySelector ref={(c) => this.categorySelector = c}  activeField="category"
							selectorLabel="Cover this overspending with:" selectorLabelPosition="top"
							selectedCategoryId={this.state.fromSubCategoryId} manuallyEnteredCategoryName={this.state.manuallyEnteredCategoryName} 
							categoriesList={categoriesList} setSelectedCategoryId={this.setSelectedCategoryId} 
							setManuallyEnteredCategoryName={this.setManuallyEnteredCategoryName} handleTabPressed={this.handleTabPressedOnCategorySelector} />
					</Form>
					<div className="buttons-container">
						<Button className="dialog-secondary-button" onClick={this.onCancelClick}>
							Cancel&nbsp;<Glyphicon glyph="remove-circle"/>
						</Button>
						<Button className="dialog-primary-button" style={OkButtonStyle} onClick={this.onOkClick}>
							OK&nbsp;<Glyphicon glyph="ok-circle"/>
						</Button>
					</div>
				</Popover>
			</Overlay>
		);
	}
}
