/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DataFormatter } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { InternalCategories } from '../../../constants';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PSubCategoryBudgetedValueProps {
	dataFormatter:DataFormatter;
	isSelected:boolean;
	isHovering:boolean;
	isEditing:boolean;
	subCategory:budgetEntities.ISubCategory;
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
	selectSubCategory:(subCategory:budgetEntities.ISubCategory, unselectAllOthers:boolean, setAsEditing:boolean)=>void;
	selectSubCategoryForEditing:(subCategory:budgetEntities.ISubCategory)=>void;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PSubCategoryBudgetedValueState {
	budgetedValue:string;
}

const BudgetedContainerStyle:React.CSSProperties = {
	flex: "0 0 auto",
	width: "100px",
	textAlign: "right",
	paddingRight: "8px"
}

const BudgetedContainerHoverStyle:React.CSSProperties = Object.assign({}, BudgetedContainerStyle, {
	borderStyle: "solid",
	borderWidth: "2px",
	borderRadius: "4px",
	borderColor: "#009CC2",
	backgroundColor: "#FFFFFF"
});

const BudgetedValueStyle:React.CSSProperties = {
	height: "22px",
	width: "100%",
	fontSize: "14px",
	fontWeight: "normal",
	marginBottom: "0px",
	textAlign: "right",
	borderStyle: "none",
	borderWidth: "0px",
	paddingLeft: "0px",
	paddingRight: "0px",
	paddingTop: "0px",
	paddingBottom: "0px",
	color: "#333333",
	backgroundColor: "#FFFFFF",
	outlineStyle: "none"
} 

const BudgetedValueSelectedStyle:React.CSSProperties = Object.assign({}, BudgetedValueStyle, {
	color: "#FFFFFF",
	backgroundColor: "#005A6E"
});

const BudgetedValueHoverStyle:React.CSSProperties = Object.assign({}, BudgetedValueStyle, {
	color: "#333333",
	backgroundColor: "#FFFFFF"
});

export class PSubCategoryBudgetedValue extends React.Component<PSubCategoryBudgetedValueProps, PSubCategoryBudgetedValueState> {

	private budgetedValueInput:HTMLInputElement;

	constructor(props:PSubCategoryBudgetedValueProps) {
        super(props);
		this.onBlur = this.onBlur.bind(this);
		this.onClick = this.onClick.bind(this);
		this.selectValue = this.selectValue.bind(this);
		this.onBudgetValueChange = this.onBudgetValueChange.bind(this);
	}

	private onClick(event:React.MouseEvent<any>):void {

		var subCategory = this.props.subCategory;
		this.props.selectSubCategoryForEditing(subCategory);
	}

	private onBudgetValueChange(event:React.FormEvent<any>):void {

		if(this.props.isEditing) {
			var budgetedValue = (event.target as HTMLInputElement).value;
			var state = Object.assign({}, this.state);
			state.budgetedValue = budgetedValue;
			this.setState(state);
		}
	}

	private onBlur(event:React.FocusEvent<HTMLInputElement>):void {
		this.commitValue();
		this.props.selectSubCategory(this.props.subCategory, true, false);
	}

	public discardValue():void {

		// Get the budgeted value from monthlySubCategoryBudget entity and replace it in the state
		let monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		let budgetedValue = monthlySubCategoryBudget ? monthlySubCategoryBudget.budgeted : 0;
		// Convert this from milli dollars to dollars
		var state = Object.assign({}, this.state);
		state.budgetedValue = (budgetedValue / 1000).toString();;
		this.setState(state);
	}

	public commitValue():void {

		if(this.props.isEditing) {
			var budgetedValueString = this.state.budgetedValue;
			var budgetedValue = this.props.dataFormatter.unformatCurrency(budgetedValueString);
			// Update the monthlySubCategoryBudget entity with this new value
			var updatedMonthlySubCategoryBudget = Object.assign({}, this.props.monthlySubCategoryBudget);
			updatedMonthlySubCategoryBudget.budgeted = budgetedValue;
			this.props.updateEntities({
				monthlySubCategoryBudgets: [updatedMonthlySubCategoryBudget]
			});
		}
	}

	public selectValue():void {

		if(this.budgetedValueInput) {
			var inputNode:any = ReactDOM.findDOMNode(this.budgetedValueInput);
			inputNode.select();
		}
	}

	public componentWillReceiveProps(nextProps:PSubCategoryBudgetedValueProps):void {

		if(!this.props.isEditing && nextProps.isEditing) {

			// Get the budgeted value and save it in the state
			let monthlySubCategoryBudget = nextProps.monthlySubCategoryBudget;
			let budgetedValue = monthlySubCategoryBudget ? monthlySubCategoryBudget.budgeted : 0;
			// Convert this from milli dollars to dollars
			var state = Object.assign({}, this.state);
			state.budgetedValue = (budgetedValue / 1000).toString();;
			this.setState(state);
		}
	} 

	public componentDidUpdate(prevProps:PSubCategoryBudgetedValueProps, prevState:PSubCategoryBudgetedValueState):void {

		if(this.props.isEditing == true) {
			this.selectValue();
		}
	}

	public render() {

		var dataFormatter = this.props.dataFormatter;
		var subCategory = this.props.subCategory;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var isUncategorizedCategory = (subCategory.internalName == InternalCategories.UncategorizedSubCategory); 
		
		var budgetedContainerStyle = BudgetedContainerStyle;
		if(this.props.isHovering || this.props.isEditing)
			budgetedContainerStyle = BudgetedContainerHoverStyle;

		var budgetedValueStyle = Object.assign({}, BudgetedValueStyle);
		if(this.props.isHovering || this.props.isEditing)
			budgetedValueStyle = Object.assign({}, BudgetedValueHoverStyle);
		else if(this.props.isSelected)
			budgetedValueStyle = Object.assign({}, BudgetedValueSelectedStyle);
		
		if(isUncategorizedCategory) {
			return (
				<div style={budgetedContainerStyle}>
					<input type="text" style={budgetedValueStyle} value="-" readOnly={true} />
				</div>
			);
		}
		else {
			var dataFormatter = this.props.dataFormatter;
			if(this.props.isEditing) {

				let budgetedValue = this.state.budgetedValue;
				return (
					<div style={budgetedContainerStyle}>
						<input ref={(a)=> this.budgetedValueInput = a} type="text" style={budgetedValueStyle} value={budgetedValue} 
							onBlur={this.onBlur} onChange={this.onBudgetValueChange}  />
					</div>
				);
			}
			else {
				let budgetedValue = monthlySubCategoryBudget ? monthlySubCategoryBudget.budgeted : 0;
				// if we are not hovering or editing the value, and the value is zero, then grey it out
				if(!this.props.isHovering && !this.props.isEditing && budgetedValue == 0) {
					budgetedValueStyle["color"] = "#CFD5D7";
				}
				
				return (
					<div style={budgetedContainerStyle}>
						<input ref={(a)=> this.budgetedValueInput = a} type="text" style={budgetedValueStyle} value={dataFormatter.formatCurrency(budgetedValue)} 
							onClick={this.onClick} readOnly={true}/>
					</div>
				);
			}
		}
  	}
}