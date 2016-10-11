/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Glyphicon } from 'react-bootstrap';

import { PNotes } from './PNotes';
import { PMessage } from './PMessage';
import { PLinkButton } from '../../common/PLinkButton';
import { PBalanceValue } from '../monthlyBudget/PBalanceValue';
import { PDefaultCategoryQuickBudget } from './PDefaultCategoryQuickBudget';
import { PDefaultCategoryGoals } from './PDefaultCategoryGoals';
import { DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

// TODO: Category Name Edit dialog
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

export class PDefaultCategoryInspector extends React.Component<PDefaultCategoryInspectorProps, {}> {

	public render() {

		var entitiesCollection = this.props.entitiesCollection;
		var subCategoryId = this.props.subCategoryId;
		var currentMonth = this.props.currentMonth;``
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

		return (
			<div style={DefaultCategoryInspectorContainerStyle}>
				<div style={RowStyle}>
					<label style={CategoryNameStyle}>{subCategory.name}</label>
					<div style={SpacerStyle}/>
					<label style={CategoryMenuStyle}><Glyphicon glyph="triangle-bottom" />&nbsp;Edit</label>
				</div>

				<hr className="inspector-horizontal-rule" />
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
				<hr className="inspector-horizontal-rule" />
				<div style={RowStyle}>
					<label style={categoryAvailableStyle}>Available</label>
					<span style={SpacerStyle}/>
					<PBalanceValue monthlySubCategoryBudget={monthlySubCategoryBudget} />
				</div>

				<PMessage subCategory={subCategory} monthlySubCategoryBudget={monthlySubCategoryBudget} />

				<PDefaultCategoryQuickBudget
					monthlySubCategoryBudget={monthlySubCategoryBudget}
					updateEntities={this.props.updateEntities}
				/>	

				<PDefaultCategoryGoals 
					subCategoryId={this.props.subCategoryId}
					currentMonth={this.props.currentMonth}
					entitiesCollection={this.props.entitiesCollection}
					updateEntities={this.props.updateEntities}
				/>

				<PNotes 
					subCategoryId={subCategoryId} 
					entitiesCollection={this.props.entitiesCollection} 
					updateEntities={this.props.updateEntities} 
				/>
			</div>
		);
	}
}