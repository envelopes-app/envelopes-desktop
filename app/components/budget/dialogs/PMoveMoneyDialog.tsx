/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Col, ControlLabel, Form, FormGroup, FormControl, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import * as objects from '../../../interfaces/objects';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { DialogUtilities, DateWithoutTime } from '../../../utilities/';
import { PCategorySelector } from '../../register/trxDialog/PCategorySelector';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PMoveMoneyDialogProps {
	entitiesCollection:IEntitiesCollection
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PMoveMoneyDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	fromSubCategoryId:string;
	currentMonth:DateWithoutTime;
	amountToMove:number;
	toSubCategoryId:string;
	manuallyEnteredCategoryName:string;
}

const PopoverStyle = {
	maxWidth: 'none',
	width:'300px'
}

const FormControlStyle = {
	borderColor: "#2FA2B5",
	borderWidth: "2px",
	borderRadius: "3px"
}

const HRStyle = {
	marginTop: "10px",
	marginBottom: "10px"
}

const OkButtonStyle = {
	marginLeft: "10px"
}

export class PMoveMoneyDialog extends React.Component<PMoveMoneyDialogProps, PMoveMoneyDialogState> {

	private okButton:Button;
	private cancelButton:Button;
	private ctrlAmountToMove:FormControl;
	private categorySelector:PCategorySelector;

	private categoriesList:Array<objects.ICategoryObject>;

	constructor(props: any) {
        super(props);
		this.setSelectedCategoryId = this.setSelectedCategoryId.bind(this);
		this.setManuallyEnteredCategoryName = this.setManuallyEnteredCategoryName.bind(this);
		this.handleTabPressedOnCategorySelector = this.handleTabPressedOnCategorySelector.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onOkClick = this.onOkClick.bind(this);
		this.onCancelClick = this.onCancelClick.bind(this);
		this.state = {
			show: false, 
			target: null, 
			placement: "left",
			fromSubCategoryId: null,
			currentMonth: null,
			amountToMove: 0,
			toSubCategoryId: null,
			manuallyEnteredCategoryName: null 
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}

	private onChange(event:React.SyntheticEvent):void {
		// Update the value in the state
		var value = (event.target as HTMLInputElement).value;
		var numericValue = parseFloat(value);
		if(!isNaN(numericValue)) {

			var state = Object.assign({}, this.state);
			state.amountToMove = numericValue;
			this.setState(state);
		}
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

	private handleTabPressedOnCategorySelector(shiftKeyPressed:boolean):void {

		// If shift key is not pressed then move the focus to the ok button. 
		if(!shiftKeyPressed) {
			// Set focus on the "ok" button
			(ReactDOM.findDOMNode(this.okButton) as any).focus();
		}
		else {
			// Set focus on the "amount to move" input
			(ReactDOM.findDOMNode(this.ctrlAmountToMove) as any).focus();
		}
	}

	public render() {

		var categoriesList = this.categoriesList;

		return (
			<Overlay show={this.state.show} placement={this.state.placement} 
				rootClose={false} onHide={this.onCancelClick} target={()=> ReactDOM.findDOMNode(this.state.target)}>
				<Popover id="moveMoneyDialog" style={PopoverStyle}>
					<Form horizontal>
						<FormGroup>
							<Col componentClass={ControlLabel} sm={3}>
								Move:
							</Col>
							<Col sm={9}>
								<FormControl type="text" componentClass="input" style={FormControlStyle} 
									value={this.state.amountToMove} 
									onChange={this.onChange} ref={(c)=>{this.ctrlAmountToMove = c;}}	
								/>
							</Col>
						</FormGroup>
						<PCategorySelector ref={(c) => this.categorySelector = c} selectorLabel="To:"
							selectedCategoryId={this.state.toSubCategoryId} manuallyEnteredCategoryName={this.state.manuallyEnteredCategoryName} 
							categoriesList={categoriesList} setSelectedCategoryId={this.setSelectedCategoryId} 
							setManuallyEnteredCategoryName={this.setManuallyEnteredCategoryName} handleTabPressed={this.handleTabPressedOnCategorySelector} />
					</Form>
					<hr style={HRStyle} />
					<div className="buttons-container">
						<Button className="dialog-secondary-button" onClick={this.onCancelClick} ref={(b) => this.cancelButton = b}>
							Cancel&nbsp;<Glyphicon glyph="remove-circle"/>
						</Button>
						<Button className="dialog-primary-button" style={OkButtonStyle} onClick={this.onOkClick} ref={(b) => this.okButton = b}>
							OK&nbsp;<Glyphicon glyph="ok-circle"/>
						</Button>
					</div>
				</Popover>
			</Overlay>
		);
	}
}
