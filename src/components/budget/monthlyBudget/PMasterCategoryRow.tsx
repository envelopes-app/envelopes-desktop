/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PButtonWithGlyph } from '../../common/PButtonWithGlyph';
import { InternalCategories } from '../../../constants';
import { DataFormatter, DateWithoutTime, SimpleObjectMap, Logger } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PMasterCategoryRowProps {
	dataFormatter:DataFormatter;
	containerHeight:number;
	containerWidth:number;
	visibleMonths:number;
	currentMonth:DateWithoutTime;
	masterCategory:budgetEntities.IMasterCategory;
	subCategories:Array<budgetEntities.ISubCategory>;
	// MonthlySubCategoryBudget entities mapped by month and subCategoryId
	monthlySubCategoryBudgetsMap:SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget>;
	selectedMasterCategoriesMap:SimpleObjectMap<boolean>;
	collapsedMasterCategoriesMap:SimpleObjectMap<boolean>;

	selectMasterCategory:(masterCategory:budgetEntities.IMasterCategory, unselectAllOthers:boolean)=>void;
	unselectMasterCategory:(masterCategory:budgetEntities.IMasterCategory)=>void;
	expandMasterCategory:(masterCategoryId:string)=>void;
	collapseMasterCategory:(masterCategoryId:string)=>void;
	showCreateCategoryDialog:(masterCategoryId:string, element:HTMLElement, placement?:string)=>void;
	showMasterCategoryEditDialog:(masterCategoryId:string, element:HTMLElement, placement?:string)=>void;
	showHiddenCategoriesDialog:(element:HTMLElement, placement?:string)=>void;
	showMasterCategoryActivityDialog:(masterCategoryId:string, element:HTMLElement, placement?:string)=>void;

	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PMasterCategoryRowState {
	hoverState:boolean;
}

const MasterCategoryRowContainerStyle:React.CSSProperties = {
	height: "31px",
	width: "100%",
	display: "flex",
	flexFlow: 'row nowrap',
	alignItems: "center",
	backgroundColor: "#E5F5F9",
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

const ExpandCollapseColumnStyle:React.CSSProperties = {
	flex: "0 0 auto",
	width: "12px"
}

const CategoryNameColumnStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: 'row nowrap',
	alignItems: "center",
	paddingLeft: "8px"
}

const CategoryNameStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "bold",
	color: "#003440",
	marginBottom: "0px"
}

const ValueColumnStyle:React.CSSProperties = {
	flex: "0 0 auto",
	display: "flex",
	alignItems: "center",
	justifyContent: "flex-end",
	width: "100px",
	color: "#4D717A",
	textAlign: "right",
	paddingRight: "8px",
	height: "100%"
}

const ValueStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "bold",
	color: "#4D717A",
	marginBottom: "0px"
}

const ValueHoverStyle:React.CSSProperties = Object.assign({}, ValueStyle, {
	color: "#333333"
});

const PrevMonthValueStyle = Object.assign({}, ValueStyle, {
	fontStyle: "italic",
	opacity: 0.7
});

const PrevMonthValueHoverStyle = Object.assign({}, PrevMonthValueStyle, {
	color: "#333333"
});

const ActivityValueStyle:React.CSSProperties = Object.assign({}, ValueStyle, {
	cursor: "pointer"
});

const ActivityValueHoverStyle:React.CSSProperties = Object.assign({}, ActivityValueStyle, {
	textDecoration: "underline",
	color: "#333333"
});

const GlyphStyle:React.CSSProperties = {
	fontSize: "12px",
	cursor: 'pointer'
}

export class PMasterCategoryRow extends React.Component<PMasterCategoryRowProps, PMasterCategoryRowState> {

	private categoryNameLabel:HTMLLabelElement;
	private activityLabel:HTMLLabelElement;
	private addCategoryButton:PButtonWithGlyph;
	private moveCategoryUpButton:PButtonWithGlyph;
	private moveCategoryDownButton:PButtonWithGlyph;

	constructor(props:PMasterCategoryRowProps) {
        super(props);
		this.onExpandCollapseGlyphClick = this.onExpandCollapseGlyphClick.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onAddSubCategoryClick = this.onAddSubCategoryClick.bind(this);
		this.onCheckBoxSelectionChange = this.onCheckBoxSelectionChange.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.onCategoryNameClick = this.onCategoryNameClick.bind(this);
		this.onActivityClick = this.onActivityClick.bind(this);
		this.state = {
			hoverState:false
		};
	}

	private onClick(event:React.MouseEvent<any>):void {

		if((event.target as HTMLElement).localName == "div") {
			var masterCategory = this.props.masterCategory;
			var selectedMasterCategoriesMap = this.props.selectedMasterCategoriesMap;
			var isSelected = selectedMasterCategoriesMap[masterCategory.entityId];

			if(isSelected)
				this.props.unselectMasterCategory(masterCategory);
			else
				this.props.selectMasterCategory(masterCategory, true);
		}
	}

	private onAddSubCategoryClick(event:React.MouseEvent<any>):void {

		var eventY = event.clientY;
		var containerHeight = this.props.containerHeight;
		var placement = "bottom";
		// If we have more space above, then below the name, then show the dialog above instead of below
		if(eventY > containerHeight - eventY)
			placement = "top";

		var masterCategory = this.props.masterCategory;
		var element = ReactDOM.findDOMNode(this.addCategoryButton) as HTMLElement;
		this.props.showCreateCategoryDialog(masterCategory.entityId, element, placement);
	}
	
	private onCheckBoxSelectionChange(event:React.FormEvent<any>):void {

		var masterCategory = this.props.masterCategory;
		var selectedMasterCategoriesMap = this.props.selectedMasterCategoriesMap;
		var isSelected = selectedMasterCategoriesMap[masterCategory.entityId];

		if(isSelected)
			this.props.unselectMasterCategory(masterCategory);
		else
			this.props.selectMasterCategory(masterCategory, false);
	}

	private handleMouseEnter() {
		var state = Object.assign({}, this.state) as PMasterCategoryRowState;
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {

		var state = Object.assign({}, this.state) as PMasterCategoryRowState;
		state.hoverState = false;
		this.setState(state);
	}

	private onExpandCollapseGlyphClick():void {

		var masterCategory = this.props.masterCategory;
		var collapsedMasterCategoriesMap = this.props.collapsedMasterCategoriesMap;
		var isCollapsed = collapsedMasterCategoriesMap[masterCategory.entityId];

		if(isCollapsed)
			this.props.expandMasterCategory(masterCategory.entityId);
		else
			this.props.collapseMasterCategory(masterCategory.entityId);
	}

	private onCategoryNameClick(event:React.MouseEvent<any>):void {

		var eventY = event.clientY;
		var containerHeight = this.props.containerHeight;
		var placement = "bottom";
		// If we have more space above, then below the name, then show the dialog above instead of below
		if(eventY > containerHeight - eventY)
			placement = "top";

		var masterCategory = this.props.masterCategory;
		var isHiddenMasterCategory = (masterCategory.internalName == InternalCategories.HiddenMasterCategory); 
		if(isHiddenMasterCategory)
			this.props.showHiddenCategoriesDialog(this.categoryNameLabel);
		else
			this.props.showMasterCategoryEditDialog(masterCategory.entityId, this.categoryNameLabel, placement);
	}

	private onActivityClick(event:React.MouseEvent<any>):void {

		var masterCategory = this.props.masterCategory;
		if(!masterCategory.internalName)
			this.props.showMasterCategoryActivityDialog(masterCategory.entityId, this.activityLabel);
	}

	// Returns the JSX for category name in the row
	private getCategoryNameNodes(masterCategory:budgetEntities.IMasterCategory, isSelected:boolean, glyphiconClass:string):Array<JSX.Element> {

		var isHiddenMasterCategory = (masterCategory.internalName == InternalCategories.HiddenMasterCategory); 
		var isDebtPaymentMasterCategory = (masterCategory.internalName == InternalCategories.DebtPaymentMasterCategory); 

		var nameKey = `${masterCategory.entityId}-category-name`;
		var selectionKey = `${masterCategory.entityId}-selected`;
		var expandedKey = `${masterCategory.entityId}-expanded`;
		if(isHiddenMasterCategory) {
			return ([
				<div key={selectionKey} style={SelectionColumnStyle} />,
				<div key={expandedKey} style={ExpandCollapseColumnStyle} />,
				<div key={nameKey} style={CategoryNameColumnStyle}>
					<label className="budget-row-hidden-mastercategoryname"
						ref={(l)=> this.categoryNameLabel = l}
						onClick={this.onCategoryNameClick}>
						{masterCategory.name}
					</label>
				</div>
			]);
		}
		else if(isDebtPaymentMasterCategory) {
			return ([
				<div key={selectionKey} style={SelectionColumnStyle}>
					<input type="checkbox" checked={isSelected} onChange={this.onCheckBoxSelectionChange} />
				</div>,
				<div key={expandedKey} style={ExpandCollapseColumnStyle}>
					<span className={glyphiconClass} style={GlyphStyle} onClick={this.onExpandCollapseGlyphClick}></span>
				</div>,
				<div key={nameKey} style={CategoryNameColumnStyle}>
					<label className="budget-row-mastercategoryname"
						ref={(l)=> this.categoryNameLabel = l}
						onClick={this.onCategoryNameClick}>
						{masterCategory.name}
					</label>
				</div>
			]);
		}
		else {
			return ([
				<div key={selectionKey} style={SelectionColumnStyle}>
					<input type="checkbox" checked={isSelected} onChange={this.onCheckBoxSelectionChange} />
				</div>,
				<div key={expandedKey} style={ExpandCollapseColumnStyle}>
					<span className={glyphiconClass} style={GlyphStyle} onClick={this.onExpandCollapseGlyphClick}></span>
				</div>,
				<div key={nameKey} style={CategoryNameColumnStyle}>
					<label className="budget-row-mastercategoryname"
						ref={(l)=> this.categoryNameLabel = l}
						onClick={this.onCategoryNameClick}>
						{masterCategory.name}&nbsp;
					</label>
					<PButtonWithGlyph showGlyph={this.state.hoverState} 
						ref={(b)=> this.addCategoryButton = b}
						glyphName="glyphicon-plus-sign" clickHandler={this.onAddSubCategoryClick} />
				</div>
			]);
		}
	}

	private getValueNodesForMonth(month:DateWithoutTime, useThickSeparator:boolean):Array<JSX.Element> {

		var dataFormatter = this.props.dataFormatter;
		var masterCategory = this.props.masterCategory;
		var monthlySubCategoryBudgetsMap = this.props.monthlySubCategoryBudgetsMap;
		var budgeted = 0, activity = 0, balance = 0, transactionsCount = 0;
		var isCurrentMonth = this.props.currentMonth.equalsByMonth(month);

		if(!isCurrentMonth)
			debugger;

		_.forEach(this.props.subCategories, (subCategory)=>{

			var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[`${month.toISOString()}_${subCategory.entityId}`];
			if(monthlySubCategoryBudget) {
				budgeted += monthlySubCategoryBudget.budgeted;
				activity += monthlySubCategoryBudget.cashOutflows + monthlySubCategoryBudget.creditOutflows;
				balance += monthlySubCategoryBudget.balance;
				transactionsCount += monthlySubCategoryBudget.transactionsCount;
			}
		});

		var valueStyle = isCurrentMonth ? ValueStyle : PrevMonthValueStyle;
		if(this.state.hoverState)
			valueStyle = isCurrentMonth ? ValueHoverStyle : PrevMonthValueHoverStyle;

		// Create key strings for the nodes that we are going to add
		var separatorNodeKey = `${month.toISOString()}_${masterCategory.entityId}_separator`;
		var budgetedNodeKey = `${month.toISOString()}_${masterCategory.entityId}_budgeted`;
		var activityNodeKey = `${month.toISOString()}_${masterCategory.entityId}_activity`;
		var balanceNodeKey = `${month.toISOString()}_${masterCategory.entityId}_balance`;
		
		var activityNode:JSX.Element;
		transactionsCount = 1; // This is not reliable yet, so setting it to 1 to always make this clickable
		if(transactionsCount == 0) {
			// If there are no transactions, then apply the same style to the activty value as the
			// budgeted and balance values
			activityNode = (
				<div key={activityNodeKey} style={ValueColumnStyle}>
					<label style={valueStyle} ref={(a)=> this.activityLabel = a}>{dataFormatter.formatCurrency(activity)}</label>
				</div>
			);
		}
		else {
			// Otherwise apply the specific ActivityValueStyle 
			var activityValueStyle = isCurrentMonth ? ActivityValueStyle : PrevMonthValueStyle;
			if(this.state.hoverState)
				activityValueStyle = isCurrentMonth ? ActivityValueHoverStyle : PrevMonthValueHoverStyle;

			activityNode = (
				<div key={activityNodeKey} style={ValueColumnStyle}>
					<label style={activityValueStyle} ref={(a)=> this.activityLabel = a}
						onClick={this.onActivityClick}>{dataFormatter.formatCurrency(activity)}</label>
				</div>
			);
		}

		return ([
			<div key={separatorNodeKey} className={useThickSeparator ? "vertical-separator-thick" : "vertical-separator"} />,
			<div key={budgetedNodeKey} style={ValueColumnStyle}>
				<label style={valueStyle}>{dataFormatter.formatCurrency(budgeted)}</label>
			</div>,
			activityNode,
			<div key={balanceNodeKey} style={ValueColumnStyle}>
				<label style={valueStyle}>{dataFormatter.formatCurrency(balance)}</label>
			</div>
		]);
	}

	public render() {

		var dataFormatter = this.props.dataFormatter;
		var glyphiconClass, containerClass:string;
		var collapseContainerIdentity = "subCategoriesContainer_" + this.props.masterCategory.entityId;

		var masterCategory = this.props.masterCategory;
		var isHiddenMasterCategory = (masterCategory.internalName == InternalCategories.HiddenMasterCategory); 
		var selectedMasterCategoriesMap = this.props.selectedMasterCategoriesMap;
		var isSelected = selectedMasterCategoriesMap[masterCategory.entityId];
		if(isSelected == null || isSelected == undefined)
			isSelected = false;

		var collapsedMasterCategoriesMap = this.props.collapsedMasterCategoriesMap;
		var isCollapsed = collapsedMasterCategoriesMap[masterCategory.entityId];
		if(isCollapsed == null || isCollapsed == undefined)
			isCollapsed = false;

		if(isCollapsed == false) {
			glyphiconClass = "glyphicon glyphicon-triangle-bottom";
			containerClass = "collapse in";
		}
		else {
			glyphiconClass = "glyphicon glyphicon-triangle-right";
			containerClass = "collapse";
		}

		var valueStyle = ValueStyle;
		if(this.state.hoverState)
			valueStyle = ValueHoverStyle;

		var currentMonth = this.props.currentMonth.clone().subtractMonths(this.props.visibleMonths - 1);
		var valueNodes:Array<JSX.Element> = [];
		// Use thin separator for the first month
		var useThickSeparator = false;
		while(currentMonth.isAfter(this.props.currentMonth) == false) {

			valueNodes = valueNodes.concat(this.getValueNodesForMonth(currentMonth, useThickSeparator));
			currentMonth.addMonths(1);
			// Use thick separator for all following months
			useThickSeparator = true;			
		}

		// Get the JSX for selection column, expand/collapse column and the category name column 
		var categoryNameNodes = this.getCategoryNameNodes(masterCategory, isSelected, glyphiconClass);

    	return (
			<div>
				<div style={MasterCategoryRowContainerStyle} onMouseEnter={this.handleMouseEnter} 
					onMouseLeave={this.handleMouseLeave} onClick={this.onClick}>

					{categoryNameNodes}
					{valueNodes}
				</div>
				<div className={containerClass} id={collapseContainerIdentity}>
					{this.props.children}
				</div>
			</div>
		);
  	}
}