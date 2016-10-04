/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Glyphicon } from 'react-bootstrap';

import { PBalanceValue } from '../monthlyBudget/PBalanceValue';
import { DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

// TODO: Warning/Error Messages under Top Summary
// TODO: Category Name Edit dialog
// TODO: Goals
// TODO: Notes
// TODO: Dialog for viewing Upcoming Transactions

export interface PDefaultCategoryInspectorProps {
	subCategoryId:string;
	currentMonth:DateWithoutTime;
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

const DefaultCategoryInspectorContainerStyle = {
	display: "flex",
	flexFlow: 'column nowrap',
	alignItems: "center",
	justifyContent: "flex-start",
	color: "#588697",
}

const HRStyle = {
	width: "100%",
	marginTop: "0px",
	marginBottom: "10px",
	borderTop: "1px dashed #588697"
}

const RowStyle = {
	width: "100%",
	display: "flex",
	flexFlow: 'row nowrap',
	alignItems: "center",
	paddingLeft: "10px",
	paddingRight: "10px"
}

const RowItemStyle = {
	flex: "0 0 auto"
}

const SpacerStyle = {
	flex: "1 1 auto"
}

const CategoryNameStyle = {
	flex: "0 0 auto",
	color: "#003440",
	fontSize: "22px",
	fontWeight: "normal"
}

const CategoryMenuStyle = {
	flex: "0 0 auto",
	color: "#009CC2",
}

const CategoryPropertyNameStyle = Object.assign({}, RowItemStyle, {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#003440"
});

const CategoryPropertyValueStyle = Object.assign({}, RowItemStyle, {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#003440"
});

const CategoryAvailableStyle = Object.assign({}, CategoryPropertyNameStyle, {
	fontSize: "14px",
	fontWeight: "bold",
	color: "#003440"
});

const CategoryAvailableValueStyle = Object.assign({}, CategoryPropertyValueStyle, {
	fontSize: "14px",
	fontWeight: "bold",
	color: "#003440"
});

const PillHeaderRowStyle = Object.assign({}, RowStyle, {
	paddingTop: "10px"
});

const PillHeaderStyle = Object.assign({}, RowItemStyle, {
	width: "100%",
	backgroundColor: "#FFFFFF",
	color: "#003440",
	fontWeight: "bold",
	fontSize: "14px",
	borderRadius: "1000px",
	paddingTop: "5px",
	paddingBottom: "5px",
	paddingLeft: "10px",
	paddingRight: "10px",
});

const ListStyle = {
	paddingTop: "10px",
	paddingLeft: "20px",
	paddingRight: "20px",
	listStyleType: "none",
	width: "100%"
}

const ListItemStyle = {
	width: "100%"
}

export class PDefaultCategoryInspector extends React.Component<PDefaultCategoryInspectorProps, {}> {

	constructor(props: any) {
        super(props);
		this.setBudgetedToBudgetedLastMonth = this.setBudgetedToBudgetedLastMonth.bind(this);
		this.setBudgetedToSpentLastMonth = this.setBudgetedToSpentLastMonth.bind(this);
		this.setBudgetedToAverageBudgeted = this.setBudgetedToAverageBudgeted.bind(this);
		this.setBudgetedToAverageSpent = this.setBudgetedToAverageSpent.bind(this);
	}

	private setBudgetedToBudgetedLastMonth():void {

		var subCategoryId = this.props.subCategoryId;
		var currentMonth = this.props.currentMonth;
		var entitiesCollection = this.props.entitiesCollection;

		// Get the monthlySubCategoryBudget entity for the current month
		var monthlySubCategoryBudget = entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(subCategoryId, currentMonth.toISOString());
		// If the current budgeted value is different from what was budgeted last month, update it
		var budgetedPreviousMonth = monthlySubCategoryBudget.budgetedPreviousMonth ? monthlySubCategoryBudget.budgetedPreviousMonth : 0;
		if(budgetedPreviousMonth != monthlySubCategoryBudget.budgeted)
			this.setBudgetedValue(monthlySubCategoryBudget, budgetedPreviousMonth);
	}

	private setBudgetedToSpentLastMonth():void {

		var subCategoryId = this.props.subCategoryId;
		var currentMonth = this.props.currentMonth;
		var entitiesCollection = this.props.entitiesCollection;

		// Get the monthlySubCategoryBudget entity for the current month
		var monthlySubCategoryBudget = entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(subCategoryId, currentMonth.toISOString());
		// If the current budgeted value is different from what was spent last month, update it
		var spentPreviousMonth = monthlySubCategoryBudget.spentPreviousMonth ? monthlySubCategoryBudget.spentPreviousMonth : 0;
		if(spentPreviousMonth != monthlySubCategoryBudget.budgeted)
			this.setBudgetedValue(monthlySubCategoryBudget, spentPreviousMonth);
	}

	private setBudgetedToAverageBudgeted():void {

		var subCategoryId = this.props.subCategoryId;
		var currentMonth = this.props.currentMonth;
		var entitiesCollection = this.props.entitiesCollection;

		// Get the monthlySubCategoryBudget entity for the current month
		var monthlySubCategoryBudget = entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(subCategoryId, currentMonth.toISOString());
		// If the current budgeted value is different from budgeted average, update it
		var budgetedAverage = monthlySubCategoryBudget.budgetedAverage ? monthlySubCategoryBudget.budgetedAverage : 0;
		if(budgetedAverage != monthlySubCategoryBudget.budgeted)
			this.setBudgetedValue(monthlySubCategoryBudget, budgetedAverage);
	}

	private setBudgetedToAverageSpent():void {

		var subCategoryId = this.props.subCategoryId;
		var currentMonth = this.props.currentMonth;
		var entitiesCollection = this.props.entitiesCollection;

		// Get the monthlySubCategoryBudget entity for the current month
		var monthlySubCategoryBudget = entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(subCategoryId, currentMonth.toISOString());
		// If the current budgeted value is different from spent average, update it
		var spentAverage = monthlySubCategoryBudget.spentAverage ? monthlySubCategoryBudget.spentAverage : 0;
		if(spentAverage != monthlySubCategoryBudget.budgeted)
			this.setBudgetedValue(monthlySubCategoryBudget, spentAverage);
	}

	private setBudgetedToUpcomingTransactions():void {

		var subCategoryId = this.props.subCategoryId;
		var currentMonth = this.props.currentMonth;
		var entitiesCollection = this.props.entitiesCollection;

		// Get the monthlySubCategoryBudget entity for the current month
		var monthlySubCategoryBudget = entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(subCategoryId, currentMonth.toISOString());
		// If the current budgeted value is different from upcomingTransactions, update it
		var upcomingTransactions = monthlySubCategoryBudget.upcomingTransactions ? monthlySubCategoryBudget.upcomingTransactions : 0;
		if(upcomingTransactions != monthlySubCategoryBudget.budgeted)
			this.setBudgetedValue(monthlySubCategoryBudget, upcomingTransactions);
	}

	private setBudgetedValue(monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget, value:number):void {

		var updatedMonthlySubCategoryBudget = Object.assign({}, monthlySubCategoryBudget);
		updatedMonthlySubCategoryBudget.budgeted = value;
		this.props.updateEntities({
			monthlySubCategoryBudgets: [updatedMonthlySubCategoryBudget]
		});
	}
	
	private getQuickBudgetItems(monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget):Array<JSX.Element> {

		// Get the quick budget values
		var budgetedLastMonthValue:number = monthlySubCategoryBudget.budgetedPreviousMonth ? monthlySubCategoryBudget.budgetedPreviousMonth : 0;
		var spentLastMonthValue:number = monthlySubCategoryBudget.spentPreviousMonth ? monthlySubCategoryBudget.spentPreviousMonth : 0;
		var averageBudgetedValue:number = monthlySubCategoryBudget.budgetedAverage;
		var averageSpentValue:number = monthlySubCategoryBudget.spentAverage;
		var upcomingTransactions:number = monthlySubCategoryBudget.upcomingTransactions ? monthlySubCategoryBudget.upcomingTransactions : 0;

		var quickBudgetItems:Array<JSX.Element> = [
			<li key="qbBudgetLastMonth" style={ListItemStyle}>
				<Button className="quick-budget-button" onClick={this.setBudgetedToBudgetedLastMonth}>
					Budgeted Last Month: {budgetedLastMonthValue}
				</Button>
			</li>,
			<li key="qbSpentLastMonth" style={ListItemStyle}>
				<Button className="quick-budget-button" onClick={this.setBudgetedToSpentLastMonth}>
					Spent Last Month: {spentLastMonthValue}
				</Button>
			</li>,
			<li key="qbAverageBudgeted" style={ListItemStyle}>
				<Button className="quick-budget-button" onClick={this.setBudgetedToAverageBudgeted}>
					Average Budgeted: {averageBudgetedValue}
				</Button>
			</li>,
			<li key="qbAverageSpent" style={ListItemStyle}>
				<Button className="quick-budget-button" onClick={this.setBudgetedToAverageSpent}>
					Average Spent: {averageSpentValue}
				</Button>
			</li>
		];

		if(upcomingTransactions != 0) {
			quickBudgetItems.unshift(
				<li key="qbUpcoming" style={ListItemStyle}>
					<Button className="quick-budget-button" onClick={this.setBudgetedToUpcomingTransactions}>
						Budget for Upcoming: {upcomingTransactions}
					</Button>
				</li>
			);
		}

		return quickBudgetItems;
	}

	public render() {

		var entitiesCollection = this.props.entitiesCollection;
		var subCategoryId = this.props.subCategoryId;
		var currentMonth = this.props.currentMonth;
		// Get the subCategory and monthlySubCategoryBudget entity from the entitiesCollection
		var subCategory = entitiesCollection.subCategories.getEntityById(subCategoryId);
		var monthlySubCategoryBudget = entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(subCategoryId, currentMonth.toISOString());

		var prevMonth = currentMonth.clone().subtractMonths(1);
		var prevMonthName = prevMonth.getMonthFullName();

		// Get the summary values
		var cashLeftOver = monthlySubCategoryBudget.balancePreviousMonth ? monthlySubCategoryBudget.balancePreviousMonth : 0;
		var budgetedThisMonth = monthlySubCategoryBudget.budgeted;
		var cashSpending = monthlySubCategoryBudget.cashOutflows;
		var creditSpending = monthlySubCategoryBudget.creditOutflows;
		var upcomingTransactions = monthlySubCategoryBudget.upcomingTransactions ? monthlySubCategoryBudget.upcomingTransactions : 0;
		var available = monthlySubCategoryBudget.balance;

		// Set the color value on the styles for the category available
		var categoryAvailableStyle = CategoryAvailableStyle;
		var categoryAvailableValueStyle = CategoryAvailableValueStyle;
		if(available < 0) { // Red
			categoryAvailableStyle = Object.assign({}, CategoryAvailableStyle, {color:"#B43326"});
			categoryAvailableValueStyle = Object.assign({}, CategoryAvailableValueStyle, {color:"#B43326"});
		}
		else if(available - upcomingTransactions < 0) { // Orange
			categoryAvailableStyle = Object.assign({}, CategoryAvailableStyle, {color:"#C37B00"});
			categoryAvailableValueStyle = Object.assign({}, CategoryAvailableValueStyle, {color:"#C37B00"});
		}
		else if(available == 0 && upcomingTransactions == 0) { // Grey
			categoryAvailableValueStyle = Object.assign({}, CategoryAvailableValueStyle, {color:"#CFD5D8"});
		}
		else  { // if(balance - upcomingTransactions > 0) - Green
			categoryAvailableStyle = Object.assign({}, CategoryAvailableStyle, {color:"#138B2E"});
			categoryAvailableValueStyle = Object.assign({}, CategoryAvailableValueStyle, {color:"#138B2E"});
		}

		// Get the Quick Budet items
		var quickBudgetItems = this.getQuickBudgetItems(monthlySubCategoryBudget);

		return (
			<div style={DefaultCategoryInspectorContainerStyle}>
				<div style={RowStyle}>
					<label style={CategoryNameStyle}>{subCategory.name}</label>
					<div style={SpacerStyle}/>
					<label style={CategoryMenuStyle}><Glyphicon glyph="triangle-bottom" />&nbsp;Edit</label>
				</div>

				<hr style={HRStyle}/>
				<div style={RowStyle}>
					<label style={CategoryPropertyNameStyle}>Cash Left Over from {prevMonthName}</label>
					<span style={SpacerStyle}/>
					<label style={CategoryPropertyValueStyle}>{cashLeftOver}</label>
				</div>
				<div style={RowStyle}>
					<label style={CategoryPropertyNameStyle}>Budgeted This Month</label>
					<span style={SpacerStyle}/>
					<label style={CategoryPropertyValueStyle}>{budgetedThisMonth}</label>
				</div>
				<div style={RowStyle}>
					<label style={CategoryPropertyNameStyle}>Cash Spending</label>
					<span style={SpacerStyle}/>
					<label style={CategoryPropertyValueStyle}>{cashSpending}</label>
				</div>
				<div style={RowStyle}>
					<label style={CategoryPropertyNameStyle}>Credit Spending</label>
					<span style={SpacerStyle}/>
					<label style={CategoryPropertyValueStyle}>{creditSpending}</label>
				</div>
				<hr style={HRStyle}/>
				<div style={RowStyle}>
					<label style={categoryAvailableStyle}>Available</label>
					<span style={SpacerStyle}/>
					<PBalanceValue monthlySubCategoryBudget={monthlySubCategoryBudget} />
				</div>

				<div style={PillHeaderRowStyle}>
					<div style={PillHeaderStyle}>
						QUICK BUDGET
					</div>
				</div>
				<ul style={ListStyle}>
					{quickBudgetItems}
				</ul>

				<div style={PillHeaderRowStyle}>
					<div style={PillHeaderStyle}>
						GOALS
					</div>
				</div>

				<div style={PillHeaderRowStyle}>
					<div style={PillHeaderStyle}>
						NOTES
					</div>
				</div>
			</div>
		);
	}
}