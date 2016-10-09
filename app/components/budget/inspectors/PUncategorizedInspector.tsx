/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PNotes } from './PNotes';
import { PMessage } from './PMessage';
import { PBalanceValue } from '../monthlyBudget/PBalanceValue';
import { DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

// TODO: Warning/Error Messages under Top Summary
// TODO: Notes
// TODO: Dialog for viewing Upcoming Transactions

export interface PUncategorizedInspectorProps {
	subCategoryId:string;
	currentMonth:DateWithoutTime;
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

const UncategorizedInspectorContainerStyle = {
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
	fontWeight: "bold"
});

const CategoryAvailableValueStyle = Object.assign({}, CategoryPropertyValueStyle, {
	fontWeight: "bold"
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

export class PUncategorizedInspector extends React.Component<PUncategorizedInspectorProps, {}> {

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
		var cashSpending = monthlySubCategoryBudget.cashOutflows;
		var creditSpending = monthlySubCategoryBudget.creditOutflows;
		var upcomingTransactions = monthlySubCategoryBudget.upcomingTransactions ? monthlySubCategoryBudget.upcomingTransactions : 0;
		var available = monthlySubCategoryBudget.balance;

		// Set the color value on the styles for the category available
		var categoryAvailableStyle = CategoryAvailableStyle;
		if(available < 0) { // Red
			categoryAvailableStyle = Object.assign({}, CategoryAvailableStyle, {color:"#B43326"});
		}
		else if(available - upcomingTransactions < 0) { // Orange
			categoryAvailableStyle = Object.assign({}, CategoryAvailableStyle, {color:"#C37B00"});
		}
		else if(available == 0 && upcomingTransactions == 0) { // Grey
		}
		else  { // if(balance - upcomingTransactions > 0) - Green
			categoryAvailableStyle = Object.assign({}, CategoryAvailableStyle, {color:"#138B2E"});
		}

		return (
			<div style={UncategorizedInspectorContainerStyle}>
				<div style={RowStyle}>
					<label style={CategoryNameStyle}>Uncategorized Transactions</label>
					<div style={SpacerStyle}/>
				</div>

				<hr style={HRStyle}/>
				<div style={RowStyle}>
					<label style={CategoryPropertyNameStyle}>Cash Left Over from {prevMonthName}</label>
					<span style={SpacerStyle}/>
					<label style={CategoryPropertyValueStyle}>{cashLeftOver}</label>
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

				<PMessage subCategory={subCategory} monthlySubCategoryBudget={monthlySubCategoryBudget} />

				<div style={PillHeaderRowStyle}>
					<div style={PillHeaderStyle}>
						NOTES
					</div>
				</div>
				<PNotes subCategoryId={subCategoryId} entitiesCollection={this.props.entitiesCollection} updateEntities={this.props.updateEntities} />
			</div>
		);
	}
}