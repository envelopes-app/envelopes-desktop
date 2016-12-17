/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PButtonWithGlyph } from '../../common/PButtonWithGlyph';
import { InternalCategories } from '../../../constants';
import { DataFormatter, DateWithoutTime, SimpleObjectMap, Logger } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PMasterCategoryMonthValuesProps {
	dataFormatter:DataFormatter;
	containerHeight:number;
	containerWidth:number;
	currentMonth:DateWithoutTime;
	masterCategory:budgetEntities.IMasterCategory;
	subCategories:Array<budgetEntities.ISubCategory>;
	// MonthlySubCategoryBudget entities mapped by month and subCategoryId
	monthlySubCategoryBudgetsMap:SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget>;
	showMasterCategoryActivityDialog:(masterCategoryId:string, month:DateWithoutTime, element:HTMLElement, placement?:string)=>void;
}

export interface PMasterCategoryMonthValuesState {
	hoverState:boolean;
}

const ValuesContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	height: "100%"
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
	marginBottom: "0px",
	paddingLeft: "1px",
	whiteSpace: "nowrap",
  	overflow: "hidden",
  	textOverflow: "ellipsis"
}

const ActivityValueStyle:React.CSSProperties = Object.assign({}, ValueStyle, {
});

const ActivityValueHoverStyle:React.CSSProperties = Object.assign({}, ActivityValueStyle, {
	cursor: "pointer",
	textDecoration: "underline",
	color: "#333333"
});

export class PMasterCategoryMonthValues extends React.Component<PMasterCategoryMonthValuesProps, PMasterCategoryMonthValuesState> {

	private activityLabel:HTMLLabelElement;

	constructor(props:PMasterCategoryMonthValuesProps) {
        super(props);
		this.onActivityClick = this.onActivityClick.bind(this);
		this.handleMouseEnterOnActivityColumn = this.handleMouseEnterOnActivityColumn.bind(this);
		this.handleMouseLeaveOnActivityColumn = this.handleMouseLeaveOnActivityColumn.bind(this);
		this.state = {
			hoverState:false
		};
	}

	private handleMouseEnterOnActivityColumn() {
		var state = Object.assign({}, this.state) as PMasterCategoryMonthValuesState;
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeaveOnActivityColumn() {

		var state = Object.assign({}, this.state) as PMasterCategoryMonthValuesState;
		state.hoverState = false;
		this.setState(state);
	}

	private onActivityClick(event:React.MouseEvent<any>):void {

		var masterCategory = this.props.masterCategory;
		if(!masterCategory.internalName)

			var eventY = event.clientY;
			var containerHeight = this.props.containerHeight;
			var placement = "bottom";
			// If we have more space above, then below the name, then show the dialog above instead of below
			if(eventY > containerHeight - eventY)
				placement = "top";

			var currentMonth = this.props.currentMonth;
			this.props.showMasterCategoryActivityDialog(masterCategory.entityId, currentMonth, this.activityLabel, placement);
	}

	public render() {

		var dataFormatter = this.props.dataFormatter;
		var currentMonth = this.props.currentMonth;
		var masterCategory = this.props.masterCategory;
		var monthlySubCategoryBudgetsMap = this.props.monthlySubCategoryBudgetsMap;
		var budgeted = 0, activity = 0, balance = 0, transactionsCount = 0;
		var isDebtPaymentMasterCategory = (masterCategory.internalName == InternalCategories.DebtPaymentMasterCategory); 

		_.forEach(this.props.subCategories, (subCategory)=>{

			var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[`${currentMonth.toISOString()}_${subCategory.entityId}`];
			if(monthlySubCategoryBudget) {
				budgeted += monthlySubCategoryBudget.budgeted;
				activity += monthlySubCategoryBudget.cashOutflows + monthlySubCategoryBudget.creditOutflows;
				balance += monthlySubCategoryBudget.balance;
				transactionsCount += monthlySubCategoryBudget.transactionsCount;
			}
		});

		var activityValueStyle = ActivityValueStyle;
		// Underline the activity value when we hover over it. We are however not showing activity dialog 
		// for the debt payment master category.
		if(this.state.hoverState && isDebtPaymentMasterCategory == false)
			activityValueStyle = ActivityValueHoverStyle;

    	return (
			<div style={ValuesContainerStyle}>
				<div className="vertical-separator-thick" />
				<div style={ValueColumnStyle}>
					<label style={ValueStyle} title={dataFormatter.formatCurrency(budgeted)}>{dataFormatter.formatCurrency(budgeted)}</label>
				</div>
				<div style={ValueColumnStyle} onMouseEnter={this.handleMouseEnterOnActivityColumn} onMouseLeave={this.handleMouseLeaveOnActivityColumn}>
					<label style={activityValueStyle} ref={(a)=> this.activityLabel = a}
						onClick={this.onActivityClick} title={dataFormatter.formatCurrency(activity)}>{dataFormatter.formatCurrency(activity)}</label>
				</div>
				<div style={ValueColumnStyle}>
					<label style={ValueStyle} title={dataFormatter.formatCurrency(balance)}>{dataFormatter.formatCurrency(balance)}</label>
				</div>
			</div>
		);
  	}
}