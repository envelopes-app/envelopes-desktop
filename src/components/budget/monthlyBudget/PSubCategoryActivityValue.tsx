/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DataFormatter, DateWithoutTime } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { SubCategoryType } from '../../../constants';

export interface PSubCategoryActivityValueProps {
	dataFormatter:DataFormatter;
	isSelected:boolean;
	subCategory:budgetEntities.ISubCategory;
	currentMonth:DateWithoutTime;
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
	showDefaultSubCategoryActivityDialog:(subCategoryId:string, month:DateWithoutTime, element:HTMLElement, placement?:string)=>void;
	showDebtSubCategoryActivityDialog:(subCategoryId:string, month:DateWithoutTime, element:HTMLElement, placement?:string)=>void;
}

export interface PSubCategoryActivityValueState {
	hoverState:boolean;
}

const ActivityContainerStyle:React.CSSProperties = {
	flex: "0 0 auto",
	width: "100px",
	textAlign: "right",
	paddingRight: "8px"
}

const ActivityValueStyle:React.CSSProperties = {
	color: "#333333",
	fontSize: "14px",
	fontWeight: "normal",
	marginBottom: "0px"
} 

const ActivityValueDisabledStyle:React.CSSProperties = Object.assign({}, ActivityValueStyle, {
	color: "#CFD5D7"
}); 

const ActivityValueSelectedStyle:React.CSSProperties = Object.assign({}, ActivityValueStyle, {
	color: "#FFFFFF"
}); 

const ActivityValueHoverStyle:React.CSSProperties = Object.assign({}, ActivityValueStyle, {
	color: "#009CC2",
	textDecoration: "underline",
	cursor: "pointer"
}); 

export class PSubCategoryActivityValue extends React.Component<PSubCategoryActivityValueProps, PSubCategoryActivityValueState> {

	private activityLabel:HTMLLabelElement;

	constructor(props:PSubCategoryActivityValueProps) {
        super(props);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.onActivityClick = this.onActivityClick.bind(this);
		this.state = {
			hoverState: false
		};
	}

	private handleMouseEnter() {
		var state = Object.assign({}, this.state) as PSubCategoryActivityValueState;
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {
		var state = Object.assign({}, this.state) as PSubCategoryActivityValueState;
		state.hoverState = false;
		this.setState(state);
	}

	private onActivityClick(event:React.MouseEvent<any>):void {

		var subCategory = this.props.subCategory;
		var currentMonth = this.props.currentMonth;
		if(subCategory.type == SubCategoryType.Debt)
			this.props.showDebtSubCategoryActivityDialog(subCategory.entityId, currentMonth, this.activityLabel);
		else
			this.props.showDefaultSubCategoryActivityDialog(subCategory.entityId, currentMonth, this.activityLabel);
	}

	public render() {

		var dataFormatter = this.props.dataFormatter;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var activity = monthlySubCategoryBudget ? monthlySubCategoryBudget.cashOutflows + monthlySubCategoryBudget.creditOutflows : 0;

		var activityValueStyle = ActivityValueStyle;
		if(!monthlySubCategoryBudget || monthlySubCategoryBudget.transactionsCount == 0)
			activityValueStyle = ActivityValueDisabledStyle;
		else if(this.state.hoverState)
			activityValueStyle = ActivityValueHoverStyle;
		else if(this.props.isSelected)
			activityValueStyle = ActivityValueSelectedStyle;

		return (
			<div style={ActivityContainerStyle} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<label ref={(a)=> this.activityLabel = a} style={activityValueStyle} onClick={this.onActivityClick}>
					{dataFormatter.formatCurrency(activity)}
				</label>
			</div>
		);
  	}
}