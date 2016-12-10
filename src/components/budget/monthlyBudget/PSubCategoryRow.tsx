/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormControl } from 'react-bootstrap';

import { PButtonWithGlyph } from '../../common/PButtonWithGlyph';
import { PSubCategoryBudgetedValue } from './PSubCategoryBudgetedValue';
import { PSubCategoryActivityValue } from './PSubCategoryActivityValue';
import { PSubCategoryBalanceValue } from './PSubCategoryBalanceValue';
import { InternalCategories, SubCategoryType } from '../../../constants';
import { DataFormatter, SimpleObjectMap, Logger } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PSubCategoryRowProps {
	dataFormatter:DataFormatter;
	containerHeight:number;
	containerWidth:number;
	subCategory:budgetEntities.ISubCategory;
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
	editingSubCategory:string;
	selectedSubCategories:Array<string>;
	selectedSubCategoriesMap:SimpleObjectMap<boolean>;

	selectSubCategory:(subCategory:budgetEntities.ISubCategory, unselectAllOthers:boolean, setAsEditing:boolean)=>void;
	unselectSubCategory:(subCategory:budgetEntities.ISubCategory)=>void;
	selectSubCategoryForEditing:(subCategory:budgetEntities.ISubCategory)=>void;
	selectNextSubCategoryForEditing:()=>void;
	selectPreviousSubCategoryForEditing:()=>void;
	showSubCategoryEditDialog:(subCategoryId:string, element:HTMLElement, placement?:string)=>void;
	showCoverOverspendingDialog:(subCategoryId:string, amountToCover:number, element:HTMLElement, placement?:string)=>void;
	showMoveMoneyDialog:(subCategoryId:string, amountToMove:number, element:HTMLElement, placement?:string)=>void;
	showDefaultSubCategoryActivityDialog:(subCategoryId:string, element:HTMLElement, placement?:string)=>void;
	showDebtSubCategoryActivityDialog:(subCategoryId:string, element:HTMLElement, placement?:string)=>void;

	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PSubCategoryRowState {
	expanded:boolean;
	hoverState:boolean;
}

const SubCategoryRowContainerStyle:React.CSSProperties = {
	height: "31px",
	width: "100%",
	display: "flex",
	flexFlow: 'row nowrap',
	flex: "0 0 auto",
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
	paddingBottom: "3px",
	paddingRight: "10px"
}

const SelectionColumnStyle:React.CSSProperties = {
	flex: "0 0 auto",
	width: "25px",
	paddingLeft: "8px"
}

const CategoryNameColumnStyle:React.CSSProperties = {
	flex: "1 1 auto",
	paddingLeft: "20px"
}

export class PSubCategoryRow extends React.Component<PSubCategoryRowProps, PSubCategoryRowState> {

	private categoryNameLabel:HTMLLabelElement;
	private budgetedValue:PSubCategoryBudgetedValue;
	private balanceValue:PSubCategoryBalanceValue;
	private moveCategoryUpButton:PButtonWithGlyph;
	private moveCategoryDownButton:PButtonWithGlyph;

	constructor(props:PSubCategoryRowProps) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onCheckBoxSelectionChange = this.onCheckBoxSelectionChange.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.onCategoryNameClick = this.onCategoryNameClick.bind(this);
		this.onBalanceValueClick = this.onBalanceValueClick.bind(this);
		this.state = {hoverState:false, expanded:true};
	}

	private onClick(event:React.MouseEvent<any>):void {

		var targetNodeName = (event.target as HTMLElement).localName;
		if(targetNodeName == "div" || targetNodeName == "input") {
			var subCategory = this.props.subCategory;
			var selectedSubCategoriesMap = this.props.selectedSubCategoriesMap;
			var isSelected = selectedSubCategoriesMap[subCategory.entityId];

			if(!isSelected) {
				this.props.selectSubCategory(subCategory, true, targetNodeName == "input");
			}
		}
	}

	private onCheckBoxSelectionChange(event:React.SyntheticEvent<any>):void {

		var subCategory = this.props.subCategory;
		var selectedSubCategoriesMap = this.props.selectedSubCategoriesMap;
		var isSelected = selectedSubCategoriesMap[subCategory.entityId];

		if(isSelected)
			this.props.unselectSubCategory(subCategory);
		else
			this.props.selectSubCategory(subCategory, false, false);
	}

	private onKeyDown(event:React.KeyboardEvent<any>):void {

		// We want the user to move the selection up and down the budget screen using the arrow
		// keys, and also the tab/shift-tab combination.
		// Also the escape key can be used to cancel the editing state.
		if(event.keyCode == 38) {
			// Up Arrow Key
			this.budgetedValue.commitValue();
			this.props.selectPreviousSubCategoryForEditing();
			event.stopPropagation();
		}
		else if(event.keyCode == 40) {
			// Down Arrow Key
			this.budgetedValue.commitValue();
			this.props.selectNextSubCategoryForEditing();
			event.stopPropagation();
		}
		else if(event.keyCode == 9) {
			// Tab Key
			event.stopPropagation();
			this.budgetedValue.commitValue();
			if(event.shiftKey)
				this.props.selectPreviousSubCategoryForEditing();
			else
				this.props.selectNextSubCategoryForEditing();

		}
		else if(event.keyCode == 27) {
			// Excape Key
			this.budgetedValue.discardValue();
			this.props.selectSubCategory(this.props.subCategory, true, false);
			event.stopPropagation();
		}
		else if(event.keyCode == 13) {
			// Enter Key
			this.budgetedValue.commitValue();
			this.props.selectNextSubCategoryForEditing();
			event.stopPropagation();
		}
	}

	private handleMouseEnter() {
		var state = Object.assign({}, this.state) as PSubCategoryRowState;
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {
		var state = Object.assign({}, this.state) as PSubCategoryRowState;
		state.hoverState = false;
		this.setState(state);
	}

	private onCategoryNameClick(event:React.MouseEvent<any>):void {

		var eventY = event.clientY;
		var containerHeight = this.props.containerHeight;
		var placement = "bottom";
		// If we have more space above, then below the name, then show the dialog above instead of below
		if(eventY > containerHeight - eventY)
			placement = "top";

		var subCategory = this.props.subCategory;
		this.props.showSubCategoryEditDialog(subCategory.entityId, this.categoryNameLabel, placement);
	}

	private onBalanceValueClick(event:React.MouseEvent<any>):void {

		var subCategory = this.props.subCategory;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;

		var balance = monthlySubCategoryBudget.balance ? monthlySubCategoryBudget.balance : 0;
		var upcomingTransactions = monthlySubCategoryBudget.upcomingTransactions ? monthlySubCategoryBudget.upcomingTransactions : 0;
		
		// If we have a positive value, we are going to show the move money dialog.
		if(balance > 0)
			this.props.showMoveMoneyDialog(subCategory.entityId, balance, this.balanceValue as any);
		else if(balance < 0)
			this.props.showCoverOverspendingDialog(subCategory.entityId, balance, this.balanceValue as any);
	}

	// Returns the JSX for category name in the row
	private getCategoryNameNode(subCategory:budgetEntities.ISubCategory, isUncategorizedCategory:boolean):JSX.Element {

		if(isUncategorizedCategory) {
			return (
				<div style={CategoryNameColumnStyle}>
					<label className="budget-row-uncategorized-subcategoryname" 
						ref={(l)=> this.categoryNameLabel = l}>Uncategorized Transactions</label>
				</div>
			);
		}
		else {
			return (
				<div style={CategoryNameColumnStyle}>
					<label className="budget-row-subcategoryname" 
						ref={(l)=> this.categoryNameLabel = l}
						onClick={this.onCategoryNameClick}>{subCategory.name}</label>
				</div>
			);
		}
	}

	public render() {

		var dataFormatter = this.props.dataFormatter;
		var subCategory = this.props.subCategory;
		var isUncategorizedCategory = (subCategory.internalName == InternalCategories.UncategorizedSubCategory); 
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		if(!monthlySubCategoryBudget)
			Logger.error(`PSubCategoryRow::MonthlySubCategoryBudget entity for ${subCategory.name} was not found.`);

		// Determine the styles for the row based on the state 
		var selectedSubCategoriesMap = this.props.selectedSubCategoriesMap;
		var isSelected = selectedSubCategoriesMap[subCategory.entityId];
		var isHovering = this.state.hoverState;
		var isEditing = (this.props.editingSubCategory != null && subCategory.entityId == this.props.editingSubCategory);
		if(!isSelected)
			isSelected = false;

		var subCategoryRowContainerStyle = Object.assign({}, SubCategoryRowContainerStyle);
		if(isSelected) {
			subCategoryRowContainerStyle["color"] = "#FFFFFF";
			subCategoryRowContainerStyle["backgroundColor"] = "#005A6E";
		}

		// Get the JSX for category name 
		var categoryNameNode = this.getCategoryNameNode(subCategory, isUncategorizedCategory);

    	return (
			<div style={subCategoryRowContainerStyle} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} 
					onClick={this.onClick} onKeyDown={this.onKeyDown}>
				<div style={SelectionColumnStyle}>
					<input type="checkbox" checked={isSelected} onChange={this.onCheckBoxSelectionChange} />
				</div>
				{categoryNameNode}
				<PSubCategoryBudgetedValue 
					ref={(b)=> this.budgetedValue = b}
					dataFormatter={dataFormatter}
					isSelected={isSelected}
					isHovering={isHovering}
					isEditing={isEditing}
					subCategory={subCategory}
					monthlySubCategoryBudget={monthlySubCategoryBudget}
					selectSubCategory={this.props.selectSubCategory}
					selectSubCategoryForEditing={this.props.selectSubCategoryForEditing}
					updateEntities={this.props.updateEntities}
				/>

				<PSubCategoryActivityValue 
					dataFormatter={dataFormatter}
					isSelected={isSelected}
					subCategory={subCategory}
					monthlySubCategoryBudget={monthlySubCategoryBudget}
					showDefaultSubCategoryActivityDialog={this.props.showDefaultSubCategoryActivityDialog}
					showDebtSubCategoryActivityDialog={this.props.showDebtSubCategoryActivityDialog}
				/>

				<PSubCategoryBalanceValue 
					ref={(b)=> this.balanceValue = b}
					dataFormatter={dataFormatter}
					monthlySubCategoryBudget={monthlySubCategoryBudget}
					onClick={this.onBalanceValueClick}
				/>
			</div>
		);
  	}
}
