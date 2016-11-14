/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DataFormatter } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection } from '../../../interfaces/state';
import { SubCategoryType } from '../../../constants';

export interface PActivityValueProps {
	dataFormatter:DataFormatter;
	subCategory:budgetEntities.ISubCategory;
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
	entitiesCollection:IEntitiesCollection;
	showDefaultSubCategoryActivityDialog:(subCategoryId:string, element:HTMLElement, placement?:string)=>void;
	showDebtSubCategoryActivityDialog:(subCategoryId:string, element:HTMLElement, placement?:string)=>void;
}

export interface PActivityValueState {
	hoverState:boolean;
	hasActivity:boolean;
}

const ActivityContainerStyle:React.CSSProperties = {
	flex: "0 0 auto",
	width: "100px",
	textAlign: "right",
	paddingRight: "8px"
}

const ActivityValueStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal",
	marginBottom: "0px"
} 

const ActivityValueHoverStyle:React.CSSProperties = Object.assign({}, ActivityValueStyle, {
	textDecoration: "underline",
	cursor: "pointer"
}); 

export class PActivityValue extends React.Component<PActivityValueProps, PActivityValueState> {

	private activityLabel:HTMLLabelElement;

	constructor(props:PActivityValueProps) {
        super(props);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.onActivityClick = this.onActivityClick.bind(this);
		this.state = {
			hoverState: false, 
			hasActivity: this.hasActivity(props)
		};
	}

	private hasActivity(props:PActivityValueProps):boolean {

		return true;
	}

	private handleMouseEnter() {
		var state = Object.assign({}, this.state) as PActivityValueState;
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {
		var state = Object.assign({}, this.state) as PActivityValueState;
		state.hoverState = false;
		this.setState(state);
	}

	private onActivityClick(event:React.MouseEvent<any>):void {

		var subCategory = this.props.subCategory;
		if(subCategory.type == SubCategoryType.Debt)
			this.props.showDebtSubCategoryActivityDialog(subCategory.entityId, this.activityLabel);
		else
			this.props.showDefaultSubCategoryActivityDialog(subCategory.entityId, this.activityLabel);
	}

	public render() {

		var dataFormatter = this.props.dataFormatter;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var activity = monthlySubCategoryBudget ? monthlySubCategoryBudget.cashOutflows + monthlySubCategoryBudget.creditOutflows : 0;

		var activityValueStyle = ActivityValueStyle;
		if(this.state.hoverState && this.state.hasActivity)
			activityValueStyle = ActivityValueHoverStyle;

		return (
			<div style={ActivityContainerStyle} onClick={this.onActivityClick}
			 	onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				
				<label ref={(a)=> this.activityLabel = a} style={activityValueStyle}>{dataFormatter.formatCurrency(activity)}</label>
			</div>
		);
  	}
}