/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormControl } from 'react-bootstrap';

import { SimpleObjectMap } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PSubCategoryRowProps {
	subCategory:budgetEntities.ISubCategory;
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
	editingSubCategory:string;
	selectedSubCategories:Array<string>;
	selectedSubCategoriesMap:SimpleObjectMap<boolean>;

	selectSubCategory:(subCategory:budgetEntities.ISubCategory, unselectAllOthers:boolean, setAsEditing:boolean)=>void;
	unselectSubCategory:(subCategory:budgetEntities.ISubCategory)=>void;
	selectSubCategoryForEditing:(subCategoryId:string)=>void;
	selectNextSubCategoryForEditing:()=>void;
	selectPreviousSubCategoryForEditing:()=>void;
	showSubCategoryEditDialog:(subCategoryId:string, element:HTMLElement)=>void;
}

export interface PSubCategoryRowState {
	expanded:boolean;
	hoverState:boolean;
}

const SubCategoryRowContainerStyle = {
	height: "31px",
	width: "100%",
	display: "flex",
	flexFlow: 'row nowrap',
	alignItems: "center",
	color: "#003440",
	backgroundColor: "#FFFFFF",
	borderColor: "#DFE4E9",
	borderStyle: "solid",
	borderTopWidth: "0px",
	borderBottomWidth: "1px",
	borderRightWidth: "0px",
	borderLeftWidth: "0px",
	paddingTop: "3px",
	paddingBottom: "3px"
}

const SelectionColumnStyle = {
	flex: "0 0 auto",
	width: "25px",
	paddingLeft: "8px"
}

const CategoryNameColumnStyle = {
	flex: "1 1 auto",
	paddingLeft: "20px"
}

const ValueColumnStyle = {
	flex: "0 0 auto",
	width: "100px",
	textAlign: "right",
	paddingRight: "8px"
}

const ValueStyle = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#4D717A",
	marginBottom: "0px"
}

const ValueColumnHoverStyle = _.assign({}, ValueColumnStyle, {
	borderStyle: "solid",
	borderWidth: "2px",
	borderRadius: "4px",
	borderColor: "#009CC2",
	backgroundColor: "#FFFFFF"
});

const BudgetedValueStyle = {
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
	color: "#4D717A",
	backgroundColor: "#FFFFFF",
	outlineStyle: "none"
}

const BudgetedValueSelectedStyle = _.assign({}, BudgetedValueStyle, {
	color: "#FFFFFF",
	backgroundColor: "#005A6E"
});

const BudgetedValueHoverStyle = _.assign({}, BudgetedValueStyle, {
	color: "#4D717A",
	backgroundColor: "#FFFFFF"
});

export class PSubCategoryRow extends React.Component<PSubCategoryRowProps, PSubCategoryRowState> {

	private categoryNameLabel:HTMLLabelElement;
	private budgetValueInput:HTMLInputElement;

	constructor(props:any) {
        super(props);
		this.onChange = this.onChange.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onBudgetValueBlur = this.onBudgetValueBlur.bind(this);
		this.onCheckBoxSelectionChange = this.onCheckBoxSelectionChange.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.onCategoryNameClick = this.onCategoryNameClick.bind(this);
		this.state = {hoverState:false, expanded:true};
	}

	private onClick(event:React.MouseEvent):void {

		var targetNodeName = (event.target as HTMLElement).localName;
		if(targetNodeName == "div" || targetNodeName == "input") {
			var subCategory = this.props.subCategory;
			var selectedSubCategoriesMap = this.props.selectedSubCategoriesMap;
			var isSelected = selectedSubCategoriesMap[subCategory.entityId];

			if(!isSelected) {
				this.props.selectSubCategory(subCategory, true, targetNodeName == "input");
				var inputNode:any = ReactDOM.findDOMNode(this.budgetValueInput);
				inputNode.select();
			}
		}
	}

	private onCheckBoxSelectionChange(event:React.SyntheticEvent):void {

		var subCategory = this.props.subCategory;
		var selectedSubCategoriesMap = this.props.selectedSubCategoriesMap;
		var isSelected = selectedSubCategoriesMap[subCategory.entityId];

		if(isSelected)
			this.props.unselectSubCategory(subCategory);
		else
			this.props.selectSubCategory(subCategory, false, false);
	}

	private onChange():void {}

	private onKeyDown(event:KeyboardEvent):void {

		// We want the user to move the selection up and down the budget screen using the arrow
		// keys, and also the tab/shift-tab combination.
		// Also the escape key can be used to cancel the editing state.
		if(event.keyCode == 38) {
			// Up Arrow Key
			this.props.selectPreviousSubCategoryForEditing();
			event.stopPropagation();
		}
		else if(event.keyCode == 40) {
			// Down Arrow Key
			this.props.selectNextSubCategoryForEditing();
			event.stopPropagation();
		}
		else if(event.keyCode == 9) {
			// Tab Key
			if(event.shiftKey)
				this.props.selectPreviousSubCategoryForEditing();
			else
				this.props.selectNextSubCategoryForEditing();

			event.stopPropagation();
		}
		else if(event.keyCode == 27) {
			// Excape Key
			this.props.selectSubCategoryForEditing(null);
			event.stopPropagation();
		}
	}

	private onBudgetValueBlur():void {

		// Get the value from the budget value input		
		var budgetValueInputNode:any = ReactDOM.findDOMNode(this.budgetValueInput);
		var budgetValue = budgetValueInputNode.value();
		debugger;
	}

	private handleMouseEnter() {
		var state = _.assign({}, this.state) as PSubCategoryRowState;
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {
		var state = _.assign({}, this.state) as PSubCategoryRowState;
		state.hoverState = false;
		this.setState(state);
	}

	private onCategoryNameClick(event:React.MouseEvent):void {
		var subCategory = this.props.subCategory;
		this.props.showSubCategoryEditDialog(subCategory.entityId, this.categoryNameLabel);
	}

	public render() {

		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var budgeted = monthlySubCategoryBudget.budgeted;
		var activity = monthlySubCategoryBudget.cashOutflows + monthlySubCategoryBudget.creditOutflows;
		var balance = monthlySubCategoryBudget.balance;

		var subCategory = this.props.subCategory;
		var selectedSubCategoriesMap = this.props.selectedSubCategoriesMap;
		var isSelected = selectedSubCategoriesMap[subCategory.entityId];
		var isEditing = (this.props.editingSubCategory && subCategory.entityId == this.props.editingSubCategory);
		if(!isSelected)
			isSelected = false;

		var valueStyle = _.assign({}, ValueStyle);
		var subCategoryRowContainerStyle = _.assign({}, SubCategoryRowContainerStyle);
		var budgetedValueStyle:any = BudgetedValueStyle;
		var valueColumnStyle:any = ValueColumnStyle;

		if(isSelected) {
			valueStyle["color"] = "#FFFFFF";
			subCategoryRowContainerStyle["color"] = "#FFFFFF";
			subCategoryRowContainerStyle["backgroundColor"] = "#005A6E";
			budgetedValueStyle = BudgetedValueSelectedStyle;
		}

		if(this.state.hoverState || isEditing) {
			valueColumnStyle = ValueColumnHoverStyle;
			budgetedValueStyle = BudgetedValueHoverStyle;
		}
		else {
			if(isSelected)
				budgetedValueStyle = BudgetedValueSelectedStyle;
			else {
				valueColumnStyle = ValueColumnStyle;
				budgetedValueStyle = BudgetedValueStyle;
			}
		}

    	return (
			<div style={subCategoryRowContainerStyle} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} 
					onClick={this.onClick}>
				<div style={SelectionColumnStyle}>
					<input type="checkbox" checked={isSelected} onChange={this.onCheckBoxSelectionChange} />
				</div>
				<div style={CategoryNameColumnStyle}>
					<label className="budget-row-subcategoryname" 
						ref={(l)=> this.categoryNameLabel = l}
						onClick={this.onCategoryNameClick}>{this.props.subCategory.name}</label>
				</div>
				<div style={valueColumnStyle}>
					<input type="text" style={budgetedValueStyle} value={budgeted} 
						ref={(i)=> this.budgetValueInput = i}
						onClick={this.onClick} onBlur={this.onBudgetValueBlur} />
				</div>
				<div style={ValueColumnStyle}>
					<label style={valueStyle}>{activity}</label>
				</div>
				<div style={ValueColumnStyle}>
					<label style={valueStyle}>{balance}</label>
				</div>
			</div>
		);
  	}
}
