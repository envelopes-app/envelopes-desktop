/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Col, ControlLabel, Form, FormGroup, FormControl, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import * as objects from '../../../interfaces/objects';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { DataFormatter, DialogUtilities, DateWithoutTime, FocusManager } from '../../../utilities/';
import { PCategorySelector } from '../../register/trxDialog/PCategorySelector';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PMoveMoneyDialogProps {
	dataFormatter:DataFormatter;
	entitiesCollection:IEntitiesCollection
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PMoveMoneyDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	activeField: string;
	fromSubCategoryId:string;
	currentMonth:DateWithoutTime;
	amountToMove:number;
	toSubCategoryId:string;
	manuallyEnteredCategoryName:string;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'300px'
}

const FormControlStyle:React.CSSProperties = {
	borderColor: "#2FA2B5",
	borderWidth: "2px",
	borderRadius: "3px"
}

const HRStyle:React.CSSProperties = {
	marginTop: "10px",
	marginBottom: "10px"
}

export class PMoveMoneyDialog extends React.Component<PMoveMoneyDialogProps, PMoveMoneyDialogState> {

	private okButton:HTMLButtonElement;
	private cancelButton:HTMLButtonElement;
	private ctrlAmountToMove:FormControl;
	private categorySelector:PCategorySelector;

	private categoriesList:Array<objects.ICategoryObject>;
	private focusManager:FocusManager = new FocusManager(); 

	constructor(props:PMoveMoneyDialogProps) {
        super(props);
		this.setActiveField = this.setActiveField.bind(this);
		this.setFocusOnAmountField = this.setFocusOnAmountField.bind(this);
		this.setFocusOnCategorySelector = this.setFocusOnCategorySelector.bind(this);
		this.setFocusOnOkButton = this.setFocusOnOkButton.bind(this);
		this.setFocusOnCancelButton = this.setFocusOnCancelButton.bind(this);
		this.onDialogEntered = this.onDialogEntered.bind(this);
		this.setSelectedCategoryId = this.setSelectedCategoryId.bind(this);
		this.setManuallyEnteredCategoryName = this.setManuallyEnteredCategoryName.bind(this);
		this.handleKeyDownOnAmountInput = this.handleKeyDownOnAmountInput.bind(this);
		this.handleTabPressedOnCategorySelector = this.handleTabPressedOnCategorySelector.bind(this);
		this.handleKeyDownOnOkButton = this.handleKeyDownOnOkButton.bind(this);
		this.handleKeyDownOnCancelButton = this.handleKeyDownOnCancelButton.bind(this);
		this.onAmountChange = this.onAmountChange.bind(this);
		this.onAmountToMoveFocus = this.onAmountToMoveFocus.bind(this);
		this.onOkClick = this.onOkClick.bind(this);
		this.onCancelClick = this.onCancelClick.bind(this);
		this.state = {
			show: false, 
			target: null, 
			placement: "left",
			activeField: null,
			fromSubCategoryId: null,
			currentMonth: null,
			amountToMove: 0,
			toSubCategoryId: null,
			manuallyEnteredCategoryName: null 
		};

		this.focusManager.addFocusObject("amount", this.setFocusOnAmountField);
		this.focusManager.addFocusObject("category", this.setFocusOnCategorySelector);
		this.focusManager.addFocusObject("ok", this.setFocusOnOkButton);
		this.focusManager.addFocusObject("cancel", this.setFocusOnCancelButton);
	}

	public isShowing():boolean {
		return this.state.show;
	}

	private setActiveField(activeField:string):void {

		if(activeField != this.state.activeField) {
			var state = Object.assign({}, this.state) as PMoveMoneyDialogState;
			state.activeField = activeField;
			this.setState(state);
		}
	}

	private setFocusOnAmountField():void {
		this.setActiveField("amount");
		var element = ReactDOM.findDOMNode(this.ctrlAmountToMove) as any;
		element.focus();
		element.select();
	}

	private setFocusOnCategorySelector():void {
		this.setActiveField("category");
		this.categorySelector.setFocus();
	}

	private setFocusOnOkButton():void {
		this.setActiveField("ok");
		(ReactDOM.findDOMNode(this.okButton) as any).focus();
	}

	private setFocusOnCancelButton():void {
		this.setActiveField("cancel");
		(ReactDOM.findDOMNode(this.cancelButton) as any).focus();
	}

	private onDialogEntered():void {
		// Set the focus on to the amount field
		this.setFocusOnAmountField();
	}

	private onAmountToMoveFocus(event:React.FocusEvent<any>):void {
		this.setFocusOnAmountField();
	}

	private onAmountChange(event:React.FormEvent<any>):void {
		// Update the value in the state
		var value = (event.target as HTMLInputElement).value;
		var numericValue = this.props.dataFormatter.unformatCurrency(value);
		var state = Object.assign({}, this.state);
		state.amountToMove = numericValue;
		this.setState(state);
	}

	private onOkClick():void { 

		var currentMonth = this.state.currentMonth;
		var amountToMove = this.state.amountToMove;
		var fromSubCategoryId = this.state.fromSubCategoryId;
		var toSubCategoryId = this.state.toSubCategoryId;
		var entitiesCollection = this.props.entitiesCollection;

		if(amountToMove != 0 && toSubCategoryId != null && fromSubCategoryId != toSubCategoryId) {

			// Get the subcategory entities for both the "to" and "from" subcategories
			var fromSubCategory = entitiesCollection.subCategories.getEntityById(fromSubCategoryId);
			var toSubCategory = entitiesCollection.subCategories.getEntityById(toSubCategoryId);
			// Get the monthlySubCategoryBudget entities for both the "to" and "from" subcategories
			var fromMonthlySubCategoryBudget = entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(fromSubCategoryId, currentMonth.toISOString());
			var toMonthlySubCategoryBudget = this.props.entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(toSubCategoryId, currentMonth.toISOString());

			var changedEntities:ISimpleEntitiesCollection = {
				monthlySubCategoryBudgets:[]
			};

			// If we are moving money from a subcategory other then "To Be Budgeted", then we need to 
			// subtract the amount from it's budgeted value.
			if(!fromSubCategory.internalName) {
				fromMonthlySubCategoryBudget = Object.assign({}, fromMonthlySubCategoryBudget);
				fromMonthlySubCategoryBudget.budgeted -= amountToMove;
				changedEntities.monthlySubCategoryBudgets.push(fromMonthlySubCategoryBudget);
			}

			// If we are moving money to a subcategory other then "To be Budgeted", then we need to
			// add the amount to it's budgeted value.
			if(!toSubCategory.internalName) {
				toMonthlySubCategoryBudget = Object.assign({}, toMonthlySubCategoryBudget);
				toMonthlySubCategoryBudget.budgeted += amountToMove;
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
	
	public show(subCategoryId:string, month:DateWithoutTime, amountToMove:number, target:HTMLElement, placement:string = "left"):void {

		// Get the subCategory for the passed subCategoryId
		var subCategory = this.props.entitiesCollection.subCategories.getEntityById(subCategoryId);
		var monthlySubCategoryBudget = this.props.entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(subCategoryId, month.toISOString());
		if(subCategory && monthlySubCategoryBudget) {

			// Create the categories list for populating the category selector
			this.categoriesList = DialogUtilities.buildCategoriesList(this.props.entitiesCollection);

			var state = Object.assign({}, this.state) as PMoveMoneyDialogState;
			state.show = true;
			state.target = target;
			state.placement = placement;
			state.fromSubCategoryId = subCategoryId;
			state.currentMonth = month;
			state.amountToMove = amountToMove;
			state.toSubCategoryId = null;
			state.manuallyEnteredCategoryName = null; 
			this.setState(state);
		}
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PMoveMoneyDialogState;
		state.show = false;
		this.setState(state);
	}

	private setSelectedCategoryId(subCategoryId:string, clearManuallyEnteredCategoryName:boolean = false):void {
		var state = Object.assign({}, this.state) as PMoveMoneyDialogState;
		state.toSubCategoryId = subCategoryId;
		if(clearManuallyEnteredCategoryName)
			state.manuallyEnteredCategoryName = null;
		this.setState(state);
	}

	private setManuallyEnteredCategoryName(categoryName:string):void {
		var state = Object.assign({}, this.state) as PMoveMoneyDialogState;
		state.manuallyEnteredCategoryName = categoryName;
		// When the user starts manually typing in a categoryName, clear the categoryId value
		state.toSubCategoryId = null;
		this.setState(state);
	}

	private handleKeyDownOnAmountInput(event:React.KeyboardEvent<any>):void {

		if(event.keyCode == 9) {
			event.preventDefault();
			if(!event.shiftKey)
				this.focusManager.moveFocusForward("amount");
			else
				this.focusManager.moveFocusBackward("amount");
		}
	}

	private handleTabPressedOnCategorySelector(shiftKeyPressed:boolean):void {

		if(!shiftKeyPressed)
			this.focusManager.moveFocusForward("category");
		else
			this.focusManager.moveFocusBackward("category");
	}

	private handleKeyDownOnOkButton(event:React.KeyboardEvent<any>):void {

		if(event.keyCode == 9) {
			event.preventDefault();
			if(!event.shiftKey)
				this.focusManager.moveFocusForward("ok");
			else
				this.focusManager.moveFocusBackward("ok");
		}
	}

	private handleKeyDownOnCancelButton(event:React.KeyboardEvent<any>):void {

		if(event.keyCode == 9) {
			event.preventDefault();
			if(!event.shiftKey)
				this.focusManager.moveFocusForward("cancel");
			else
				this.focusManager.moveFocusBackward("cancel");
		}
	}
	
	public render() {

		if(this.state.show) {
			var categoriesList = this.categoriesList;
			var dataFormatter = this.props.dataFormatter;

			return (
				<Overlay show={this.state.show} placement={this.state.placement} 
					rootClose={true} onHide={this.onCancelClick} onEntered={this.onDialogEntered} 
					target={()=> ReactDOM.findDOMNode(this.state.target)}>
					<Popover id="moveMoneyDialog" style={PopoverStyle}>
						<Form horizontal>
							<FormGroup onKeyDown={this.handleKeyDownOnAmountInput}>
								<Col componentClass={ControlLabel} sm={3}>
									Move:
								</Col>
								<Col sm={9}>
									<FormControl type="text" componentClass="input" style={FormControlStyle} 
										ref={(c)=>{this.ctrlAmountToMove = c;}} value={dataFormatter.formatCurrency(this.state.amountToMove)} 
										onChange={this.onAmountChange} onFocus={this.onAmountToMoveFocus}
									/>
								</Col>
							</FormGroup>
							<PCategorySelector ref={(c) => this.categorySelector = c} 
								dataFormatter={this.props.dataFormatter}
								activeField={this.state.activeField} selectorLabel="To:"
								selectedCategoryId={this.state.toSubCategoryId} manuallyEnteredCategoryName={this.state.manuallyEnteredCategoryName} 
								categoryNotRequired={false}
								categoriesList={categoriesList} setSelectedCategoryId={this.setSelectedCategoryId} 
								setManuallyEnteredCategoryName={this.setManuallyEnteredCategoryName} 
								handleTabPressed={this.handleTabPressedOnCategorySelector}
								setActiveField={this.setActiveField} />
						</Form>
						<hr style={HRStyle} />
						<div className="buttons-container">
							<div className="spacer" />
							<button className="dialog-secondary-button" ref={(b) => this.cancelButton = b}
								onClick={this.onCancelClick} onKeyDown={this.handleKeyDownOnCancelButton}>
								Cancel&nbsp;<Glyphicon glyph="remove-circle"/>
							</button>
							<div style={{width:"8px"}} />
							<button className="dialog-primary-button" ref={(b) => this.okButton = b} 
								onClick={this.onOkClick} onKeyDown={this.handleKeyDownOnOkButton}> 
								OK&nbsp;<Glyphicon glyph="ok-circle"/>
							</button>
						</div>
					</Popover>
				</Overlay>
			);
		}
		else {
			return <div />;
		}
	}
}
