/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection } from '../../../interfaces/state';

export interface PMonthSummaryProps {
	currentMonth:DateWithoutTime;
	entitiesCollection:IEntitiesCollection;

	showCoverOverspendingDialog:(subCategoryId:string, amountToCover:number, element:HTMLElement, placement?:string)=>void;
	showMoveMoneyDialog:(subCategoryId:string, amountToMove:number, element:HTMLElement, placement?:string)=>void;
}

export interface PMonthSummaryState { }

const MonthSummaryContainerStyle = {
	flex: '0 0 auto',
	backgroundColor: 'transparent',
	paddingLeft: '5px',
	paddingRight: '5px'
}

const MonthSummaryInnerStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',
}

const ATBContainerStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	alignItems: 'center',
	padding: '4px',
	borderRadius: '6px',
	backgroundColor: '#16A336',
	paddingLeft: '10px',
	paddingRight: '10px'
}

const ATBNumberStyle = {
	color: '#ffffff',
	fontSize: '28px',
	fontWeight: 'normal',
	border: 'none',
	backgroundColor: 'transparent',
	outline: 'none'
}

const ATBLabelStyle = {
	color: '#003440',
	fontSize: '14px',
	fontWeight: 'normal',
	fontStyle: 'italic'
}

const SummaryNumbersContainerStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	alignItems: 'flex-end',
	paddingLeft: '5px',
	paddingRight: '5px'
}

const SummaryNumberStyle = {
	color: '#ffffff',
	fontSize: '12px',
	fontWeight: 'bold',
	margin: '0px'
}

const SummaryLabelsContainerStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	alignItems: 'flex-start'
}

const SummaryLabelStyle = {
	color: '#ffffff',
	fontSize: '12px',
	fontWeight: 'normal',
	fontStyle: 'italic',
	margin: '0px'
}

export class PMonthSummary extends React.Component<PMonthSummaryProps, PMonthSummaryState> {

	private atbContainer:HTMLDivElement;

	constructor(props: any) {
        super(props);
		this.handleAvailableToBudgetClick = this.handleAvailableToBudgetClick.bind(this);
	}

	private handleAvailableToBudgetClick():void {

		var currentMonth = this.props.currentMonth;
		var entitiesCollection = this.props.entitiesCollection;
		// Get the immediate income category
		var immediateIncomeSubCategory = entitiesCollection.subCategories.getImmediateIncomeSubCategory();
		// Get the availableToBudget value from the monthlyBudget entity
		var monthlyBudget = entitiesCollection.monthlyBudgets.getMonthlyBudgetByMonth(currentMonth.toISOString());
		var availableToBudget = monthlyBudget.availableToBudget;
		// If the ATB value is negative, we will show the cover overspending dialog. Otherwise show the
		// move money dialog.
		if(availableToBudget < 0)
			this.props.showCoverOverspendingDialog(immediateIncomeSubCategory.entityId, availableToBudget, this.atbContainer, "bottom");
		else 
			this.props.showMoveMoneyDialog(immediateIncomeSubCategory.entityId, availableToBudget, this.atbContainer, "bottom");
	}

	public render() {

		var availableToBudget = 0;
		var currentMonth = this.props.currentMonth;
		var entitiesCollection = this.props.entitiesCollection;
		if(entitiesCollection && entitiesCollection.monthlyBudgets) {

			var monthlyBudget = entitiesCollection.monthlyBudgets.getMonthlyBudgetByMonth(currentMonth.toISOString());
			availableToBudget = monthlyBudget.availableToBudget;
		}

		var atbContainerStyle:any = ATBContainerStyle;
		if(availableToBudget < 0) {
			atbContainerStyle = Object.assign({}, ATBContainerStyle);
			atbContainerStyle.backgroundColor = "#D33C2D";
		}
		return (
			<div style={MonthSummaryContainerStyle}>
				<div style={MonthSummaryInnerStyle}>
					<div style={atbContainerStyle} ref={(d)=> this.atbContainer = d}>
						<button style={ATBNumberStyle} onClick={this.handleAvailableToBudgetClick}>{availableToBudget}</button>
						<label style={ATBLabelStyle}>To be Budgeted</label>
					</div>
					<div style={SummaryNumbersContainerStyle}>
						<label style={SummaryNumberStyle}>+802</label>
						<label style={SummaryNumberStyle}>-7</label>
						<label style={SummaryNumberStyle}>-1000</label>
						<label style={SummaryNumberStyle}>-0</label>
					</div>
					<div style={SummaryLabelsContainerStyle}>
						<label style={SummaryLabelStyle}>Funds for Oct</label>
						<label style={SummaryLabelStyle}>Overspent in Sep</label>
						<label style={SummaryLabelStyle}>Budgeted in Oct</label>
						<label style={SummaryLabelStyle}>Budgeted in Future</label>
					</div>
				</div>
			</div>
		);
	}
}