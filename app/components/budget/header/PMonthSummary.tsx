/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DataFormatter, DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PMonthSummaryProps {
	dataFormatter:DataFormatter;
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
	paddingLeft: '10px',
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

	private getBudgetedInFuture():number {

			var currentMonth = this.props.currentMonth;
            var monthlyBudgetsArray = this.props.entitiesCollection.monthlyBudgets;

			var monthlBudgetForCurrentMonth = monthlyBudgetsArray.getMonthlyBudgetByMonth(currentMonth.toISOString());
            var availableToBudgetInCurrentMonth = monthlBudgetForCurrentMonth.availableToBudget;
            
			// Calculate the amount that we have budgeted in future months
            var budgetedInFutureMonths = _.reduce(monthlyBudgetsArray.getAllItems(), (totalBudgeted:number, monthlyBudget:budgetEntities.IMonthlyBudget)=>{

				var month = DateWithoutTime.createFromISOString(monthlyBudget.month);
                if(month.isAfter(currentMonth))
					return totalBudgeted + monthlyBudget.budgeted;
				else
	                return totalBudgeted;
            }, 0);

            // If we are already over budgeted in this month then we cannot contribute anything to next month.
            if(availableToBudgetInCurrentMonth <= 0 || budgetedInFutureMonths <= 0)
                return 0;
            else
                return Math.min(availableToBudgetInCurrentMonth, budgetedInFutureMonths);
	}

	public render() {

		var entitiesCollection = this.props.entitiesCollection;
		if(entitiesCollection && entitiesCollection.monthlyBudgets && entitiesCollection.monthlyBudgets.length > 0) {

			var dataFormatter = this.props.dataFormatter;
			var currentMonth = this.props.currentMonth;
			var prevMonth = currentMonth.clone().subtractMonths(1);
			var currentMonthName = currentMonth.format("MMM");
			var prevMonthName = prevMonth.format("MMM");

			var monthlyBudgetForCurrentMonth = entitiesCollection.monthlyBudgets.getMonthlyBudgetByMonth(currentMonth.toISOString());
			var monthlyBudgetForPrevMonth = entitiesCollection.monthlyBudgets.getMonthlyBudgetByMonth(prevMonth.toISOString());
			var availableToBudget = monthlyBudgetForCurrentMonth.availableToBudget;

			// The background color needs to be set to red if the ATB value is negative.
			var atbContainerStyle:any = ATBContainerStyle;
			if(availableToBudget < 0) {
				atbContainerStyle = Object.assign({}, ATBContainerStyle);
				atbContainerStyle.backgroundColor = "#D33C2D";
			}

			var fundsForCurrentMonth = monthlyBudgetForCurrentMonth.immediateIncome;
			var overspentInPrevMonth = monthlyBudgetForPrevMonth ? monthlyBudgetForPrevMonth.overSpent : 0;
			var budgetedInCurrentMonth = monthlyBudgetForCurrentMonth.budgeted;
			var budgetedInFuture = this.getBudgetedInFuture();

			return (
				<div style={MonthSummaryContainerStyle}>
					<div style={MonthSummaryInnerStyle}>
						<div style={atbContainerStyle} ref={(d)=> this.atbContainer = d}>
							<button style={ATBNumberStyle} onClick={this.handleAvailableToBudgetClick}>{dataFormatter.formatCurrency(availableToBudget)}</button>
							<label style={ATBLabelStyle}>To be Budgeted</label>
						</div>
						<div style={SummaryNumbersContainerStyle}>
							<label style={SummaryNumberStyle}>{dataFormatter.formatCurrency(fundsForCurrentMonth)}</label>
							<label style={SummaryNumberStyle}>{dataFormatter.formatCurrency(overspentInPrevMonth)}</label>
							<label style={SummaryNumberStyle}>{dataFormatter.formatCurrency(-budgetedInCurrentMonth)}</label>
							<label style={SummaryNumberStyle}>{dataFormatter.formatCurrency(-budgetedInFuture)}</label>
						</div>
						<div style={SummaryLabelsContainerStyle}>
							<label style={SummaryLabelStyle}>Funds for {currentMonthName}</label>
							<label style={SummaryLabelStyle}>Overspent in {prevMonthName}</label>
							<label style={SummaryLabelStyle}>Budgeted in {currentMonthName}</label>
							<label style={SummaryLabelStyle}>Budgeted in Future</label>
						</div>
					</div>
				</div>
			);
		}
		else 
			return <div/>;
	}
}