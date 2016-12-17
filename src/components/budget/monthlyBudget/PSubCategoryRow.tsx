/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormControl } from 'react-bootstrap';

import { PSubCategoryMonthValues } from './PSubCategoryMonthValues';
import { InternalCategories, SubCategoryType } from '../../../constants';
import { DataFormatter, DateWithoutTime, SimpleObjectMap, Logger } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PSubCategoryRowProps {
	dataFormatter:DataFormatter;
	containerHeight:number;
	containerWidth:number;
	visibleMonths:number;
	currentMonth:DateWithoutTime;
	subCategory:budgetEntities.ISubCategory;
	// MonthlySubCategoryBudget entities mapped by month and subCategoryId
	monthlySubCategoryBudgetsMap:SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget>;
	editingSubCategoryId:string;
	editingSubCategoryMonth:DateWithoutTime;
	selectedSubCategoriesMap:SimpleObjectMap<boolean>;

	selectSubCategory:(subCategory:budgetEntities.ISubCategory, month:DateWithoutTime, unselectAllOthers:boolean, setAsEditing:boolean)=>void;
	unselectSubCategory:(subCategory:budgetEntities.ISubCategory)=>void;
	selectSubCategoryForEditing:(subCategory:budgetEntities.ISubCategory, month:DateWithoutTime)=>void;
	selectNextSubCategoryForEditing:()=>void;
	selectPreviousSubCategoryForEditing:()=>void;
	showSubCategoryEditDialog:(subCategoryId:string, element:HTMLElement, placement?:string)=>void;
	showCoverOverspendingDialog:(subCategoryId:string, month:DateWithoutTime, amountToCover:number, element:HTMLElement, placement?:string)=>void;
	showMoveMoneyDialog:(subCategoryId:string, month:DateWithoutTime, amountToMove:number, element:HTMLElement, placement?:string)=>void;
	showDefaultSubCategoryActivityDialog:(subCategoryId:string, month:DateWithoutTime, element:HTMLElement, placement?:string)=>void;
	showDebtSubCategoryActivityDialog:(subCategoryId:string, month:DateWithoutTime, element:HTMLElement, placement?:string)=>void;

	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
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

export class PSubCategoryRow extends React.Component<PSubCategoryRowProps, {}> {

	private categoryNameLabel:HTMLLabelElement;

	constructor(props:PSubCategoryRowProps) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onCheckBoxSelectionChange = this.onCheckBoxSelectionChange.bind(this);
		this.onCategoryNameClick = this.onCategoryNameClick.bind(this);
	}

	private onClick(event:React.MouseEvent<any>):void {

		var targetNodeName = (event.target as HTMLElement).localName;
		if(targetNodeName == "div" || targetNodeName == "input") {
			var subCategory = this.props.subCategory;
			var currentMonth = this.props.currentMonth;
			var selectedSubCategoriesMap = this.props.selectedSubCategoriesMap;
			var isSelected = selectedSubCategoriesMap[subCategory.entityId];

			if(!isSelected) {
				this.props.selectSubCategory(subCategory, currentMonth, true, targetNodeName == "input");
			}
		}
	}

	private onCheckBoxSelectionChange(event:React.SyntheticEvent<any>):void {

		var subCategory = this.props.subCategory;
		var currentMonth = this.props.currentMonth;
		var selectedSubCategoriesMap = this.props.selectedSubCategoriesMap;
		var isSelected = selectedSubCategoriesMap[subCategory.entityId];

		if(isSelected)
			this.props.unselectSubCategory(subCategory);
		else
			this.props.selectSubCategory(subCategory, currentMonth, false, false);
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

		// Determine the styles for the row based on the state 
		var selectedSubCategoriesMap = this.props.selectedSubCategoriesMap;
		var isSelected = selectedSubCategoriesMap[subCategory.entityId];
		if(!isSelected)
			isSelected = false;

		var subCategoryRowContainerStyle = Object.assign({}, SubCategoryRowContainerStyle);
		if(isSelected) {
			subCategoryRowContainerStyle["color"] = "#FFFFFF";
			subCategoryRowContainerStyle["backgroundColor"] = "#005A6E";
		}

		// Get the JSX for category name 
		var categoryNameNode = this.getCategoryNameNode(subCategory, isUncategorizedCategory);

		// Get the JSX for value nodes for all the visible months
		var currentMonth = this.props.currentMonth.clone().subtractMonths(this.props.visibleMonths - 1);
		var monthValueNodes:Array<JSX.Element> = [];
		while(currentMonth.isAfter(this.props.currentMonth) == false) {

			var monthValueNode = (
				<PSubCategoryMonthValues
					key={`${currentMonth.toISOString()}_${subCategory.entityId}`}
					dataFormatter={this.props.dataFormatter}
					containerWidth={this.props.containerWidth}
					containerHeight={this.props.containerHeight}
					currentMonth={currentMonth}
					subCategory={this.props.subCategory}
					editingSubCategoryId={this.props.editingSubCategoryId}
					editingSubCategoryMonth={this.props.editingSubCategoryMonth}
					isSelected={isSelected}
					monthlySubCategoryBudgetsMap={this.props.monthlySubCategoryBudgetsMap}

					selectSubCategory={this.props.selectSubCategory}
					selectSubCategoryForEditing={this.props.selectSubCategoryForEditing}
					selectNextSubCategoryForEditing={this.props.selectNextSubCategoryForEditing}
					selectPreviousSubCategoryForEditing={this.props.selectPreviousSubCategoryForEditing}
					showCoverOverspendingDialog={this.props.showCoverOverspendingDialog}
					showMoveMoneyDialog={this.props.showMoveMoneyDialog}
					showDefaultSubCategoryActivityDialog={this.props.showDefaultSubCategoryActivityDialog}
					showDebtSubCategoryActivityDialog={this.props.showDebtSubCategoryActivityDialog}
					updateEntities={this.props.updateEntities}
				/>
			);

			monthValueNodes.push(monthValueNode);
			currentMonth = currentMonth.clone().addMonths(1);
		}

    	return (
			<div style={subCategoryRowContainerStyle} onClick={this.onClick}>
				<div style={SelectionColumnStyle}>
					<input type="checkbox" checked={isSelected} onChange={this.onCheckBoxSelectionChange} />
				</div>
				{categoryNameNode}
				{monthValueNodes}
			</div>
		);
  	}
}
