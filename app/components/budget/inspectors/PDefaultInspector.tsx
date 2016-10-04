/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';

import { DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PDefaultInspectorProps {
	currentMonth:DateWithoutTime;
	entitiesCollection:IEntitiesCollection;
}

const DefaultInspectorContainerStyle = {
	display: "flex",
	flexFlow: 'column nowrap',
	alignItems: "center",
	justifyContent: "flex-start",
	color: "#588697",
	paddingTop: "10px",
}

const SectionStyle = {
	display: "flex",
	flexFlow: 'column nowrap',
	alignItems: "center",
	paddingTop: "10px",
	width: "100%"
}

const LabelStyle = {
	fontSize: "12px",
	fontWeight: "normal"
}

const ValueStyle = {
	fontSize: "24px",
	fontWeight: "bold"
}

const HRStyle = {
	width: "80%",
	marginTop: "10px",
	marginBottom: "10px",
	borderTop: "1px dashed #588697"
}

const ListStyle = {
	paddingLeft: "20px",
	paddingRight: "20px",
	listStyleType: "none",
	width: "100%"
}

const ListItemStyle = {
	width: "100%"
}

export class PDefaultInspector extends React.Component<PDefaultInspectorProps, {}> {

	constructor(props: any) {
        super(props);
		this.setBudgetedToBudgetedLastMonth = this.setBudgetedToBudgetedLastMonth.bind(this);
		this.setBudgetedToSpentLastMonth = this.setBudgetedToSpentLastMonth.bind(this);
		this.setBudgetedToAverageBudgeted = this.setBudgetedToAverageBudgeted.bind(this);
		this.setBudgetedToAverageSpent = this.setBudgetedToAverageSpent.bind(this);
	}

	private setBudgetedToBudgetedLastMonth():void {

	}

	private setBudgetedToSpentLastMonth():void {

	}

	private setBudgetedToAverageBudgeted():void {

	}

	private setBudgetedToAverageSpent():void {

	}
	
	public render() {

		var entitiesCollection = this.props.entitiesCollection;
		var currentMonth = this.props.currentMonth;
		var prevMonth = currentMonth.clone().subtractMonths(1);
		// Get the monthlyBudget entity from the entitiesCollection
		var monthlyBudget, monthlyBudgetForPrevMonth:budgetEntities.IMonthlyBudget;
		if(entitiesCollection && entitiesCollection.monthlyBudgets) {

			monthlyBudget = entitiesCollection.monthlyBudgets.getMonthlyBudgetByMonth(currentMonth.toISOString());
			monthlyBudgetForPrevMonth = entitiesCollection.monthlyBudgets.getMonthlyBudgetByMonth(prevMonth.toISOString());
		}

		// Get the summary values
		var totalBudgeted:number = monthlyBudget ? monthlyBudget.budgeted : 0;
		var totalActivity:number = monthlyBudget ? monthlyBudget.cashOutflows + monthlyBudget.creditOutflows : 0;
		var totalAvailable:number = monthlyBudget ? monthlyBudget.availableToBudget : 0;
		var totalInflows:number = monthlyBudget ? monthlyBudget.immediateIncome : 0;

		// Get the quick budget values
		var underfundedValue:number = monthlyBudget ? monthlyBudget.overSpent : 0;
		var budgetedLastMonth:number = monthlyBudgetForPrevMonth ? monthlyBudgetForPrevMonth.budgeted : 0;
		var spentLastMonth:number = monthlyBudgetForPrevMonth ? monthlyBudgetForPrevMonth.cashOutflows + monthlyBudgetForPrevMonth.creditOutflows : 0;
		var averageBudgeted:number = 0;
		var averageSpent:number = 0;

    	return (
			<div style={DefaultInspectorContainerStyle}>
				<div style={SectionStyle}>
					<label style={LabelStyle}>TOTAL BUDGETED</label>
					<label style={ValueStyle}>{totalBudgeted}</label>
				</div>
				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>TOTAL ACTIVTY</label>
					<label style={ValueStyle}>{totalActivity}</label>
				</div>
				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>TOTAL AVAILABLE</label>
					<label style={ValueStyle}>{totalAvailable}</label>
				</div>
				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>TOTAL INFLOWS</label>
					<label style={ValueStyle}>{totalInflows}</label>
				</div>

				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>QUICK BUDGET</label>
					<ul style={ListStyle}>
						<li style={ListItemStyle}>
							<Button className="quick-budget-button">
								Underfunded: {underfundedValue}
							</Button>
						</li>
						<li style={ListItemStyle}>
							<Button className="quick-budget-button">
								Budgeted Last Month: {budgetedLastMonth}
							</Button>
						</li>
						<li style={ListItemStyle}>
							<Button className="quick-budget-button">
								Spent Last Month: {spentLastMonth}
							</Button>
						</li>
						<li style={ListItemStyle}>
							<Button className="quick-budget-button">
								Average Budgeted: {averageBudgeted}
							</Button>
						</li>
						<li style={ListItemStyle}>
							<Button className="quick-budget-button">
								Average Spent: {averageSpent}
							</Button>
						</li>
					</ul>
				</div>
			</div>
		);
  	}
}