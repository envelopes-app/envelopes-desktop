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
	showSubCategoryEditDialog:(subCategoryId:string, element:HTMLElement)=>void;
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
	paddingBottom: "3px"
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

	constructor(props:any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onMoveCategoryUpClick = this.onMoveCategoryUpClick.bind(this);
		this.onMoveCategoryDownClick = this.onMoveCategoryDownClick.bind(this);
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

	private onMoveCategoryUpClick(event:React.MouseEvent<any>):void {

		// Get the subcategory that is above the subcategory we are displaying
		var subCategory = this.props.subCategory;
		var subCategoryAbove = this.props.entitiesCollection.subCategories.getSubCategoryAbove(subCategory.masterCategoryId, subCategory.entityId);
		if(subCategoryAbove) {

			// We are going to swap the sortableIndices of these subCategories
			var subCategoryClone = Object.assign({}, subCategory);
			var subCategoryAboveClone = Object.assign({}, subCategoryAbove);
			// Swap the sortableIndices in the clone objects
			subCategoryClone.sortableIndex = subCategoryAbove.sortableIndex;
			subCategoryAboveClone.sortableIndex = subCategory.sortableIndex;
			// Send these subCategories for persistence
			this.props.updateEntities({
				subCategories: [subCategoryClone, subCategoryAboveClone]
			});
		}
		else {
			// This subCategory is already at the top under it's master category, so it can't be moved
			// further up under this master category.
			// We are going to check if we have another master category above this subcategory's parent
			// master category. If we do, we will move this subcategory to the bottom of that master category.
			// NOTE: Don't move the debt subcategories out from under the debt payment master category
			if(subCategory.type == SubCategoryType.Default) {
				var masterCategoryAbove = this.props.entitiesCollection.masterCategories.getMasterCategoryAbove(subCategory.masterCategoryId);
				if(masterCategoryAbove) {

					var subCategoryClone = Object.assign({}, subCategory);
					subCategoryClone.masterCategoryId = masterCategoryAbove.entityId;
					subCategoryClone.sortableIndex = this.props.entitiesCollection.subCategories.getSortableIndexForNewSubCategoryInsertionAtBottom(masterCategoryAbove.entityId);
					// Send this subCategory for persistence
					this.props.updateEntities({
						subCategories: [subCategoryClone]
					});
				}
			}
		}
	}

	private onMoveCategoryDownClick(event:React.MouseEvent<any>):void {

		// Get the subcategory that is below the subcategory we are displaying
		var subCategory = this.props.subCategory;
		var subCategoryBelow = this.props.entitiesCollection.subCategories.getSubCategoryBelow(subCategory.masterCategoryId, subCategory.entityId);
		if(subCategoryBelow) {

			// We are going to swap the sortableIndices of these subCategories
			var subCategoryClone = Object.assign({}, subCategory);
			var subCategoryBelowClone = Object.assign({}, subCategoryBelow);
			// Swap the sortableIndices in the clone objects
			subCategoryClone.sortableIndex = subCategoryBelow.sortableIndex;
			subCategoryBelowClone.sortableIndex = subCategory.sortableIndex;
			// Send these subCategories for persistence
			this.props.updateEntities({
				subCategories: [subCategoryClone, subCategoryBelowClone]
			});
		}
		else {
			// This subCategory is already at the bottom under it's master category, so it can't be moved
			// further down under this master category.
			// We are going to check if we have another master category below this subcategory's parent
			// master category. If we do, we will move this subcategory to the top of that master category.
			// NOTE: Don't move the debt subcategories out from under the debt payment master category
			if(subCategory.type == SubCategoryType.Default) {
				var masterCategoryBelow = this.props.entitiesCollection.masterCategories.getMasterCategoryBelow(subCategory.masterCategoryId);
				if(masterCategoryBelow) {

					var subCategoryClone = Object.assign({}, subCategory);
					subCategoryClone.masterCategoryId = masterCategoryBelow.entityId;
					subCategoryClone.sortableIndex = this.props.entitiesCollection.subCategories.getSortableIndexForNewSubCategoryInsertionAtTop(masterCategoryBelow.entityId);
					// Send this subCategory for persistence
					this.props.updateEntities({
						subCategories: [subCategoryClone]
					});
				}			
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
			this.budgetedValue.discardValue();
			this.props.selectSubCategory(this.props.subCategory, true, false);
			event.stopPropagation();
		}
		else if(event.keyCode == 13) {
			// Enter Key
			this.budgetedValue.commitValue();
			this.props.selectSubCategory(this.props.subCategory, true, false);
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
		var subCategory = this.props.subCategory;
		this.props.showSubCategoryEditDialog(subCategory.entityId, this.categoryNameLabel);
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
					<PButtonWithGlyph showGlyph={this.state.hoverState} 
						ref={(b)=> this.moveCategoryUpButton = b}
						glyphName="glyphicon-arrow-up" clickHandler={this.onMoveCategoryUpClick} />
					<PButtonWithGlyph showGlyph={this.state.hoverState} 
						ref={(b)=> this.moveCategoryDownButton = b}
						glyphName="glyphicon-arrow-down" clickHandler={this.onMoveCategoryDownClick} />
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
