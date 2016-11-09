/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon } from 'react-bootstrap';

import { PBalanceValue } from '../monthlyBudget/PBalanceValue';
import { PSubCategoryEditDialog } from '../dialogs';
import { DataFormatter, DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PDebtCategorySummaryProps {
	dataFormatter:DataFormatter;
	currentMonth:DateWithoutTime;
	subCategory:budgetEntities.ISubCategory;
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

const DebtCategorySummaryContainerStyle = {
	display: "flex",
	flexFlow: 'column nowrap',
	width: "100%",
	color: "#588697",
	paddingTop: "5px",
	paddingLeft: "10px",
	paddingRight: "10px"
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
	fontSize: "18px",
	fontWeight: "normal",
	cursor: "pointer"
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

export class PDebtCategorySummary extends React.Component<PDebtCategorySummaryProps, {}> {

	private categoryEditMenu:HTMLDivElement;
	private subCategoryEditDialog:PSubCategoryEditDialog;

	constructor(props: any) {
        super(props);
		this.onEditClick = this.onEditClick.bind(this);
	}

	private onEditClick(event:React.MouseEvent):void {
		// Show the dialog for editing the subcategory
		this.subCategoryEditDialog.show(this.props.subCategory.entityId, this.categoryEditMenu);
	}

	public render() {

		var dataFormatter = this.props.dataFormatter;
		var subCategory = this.props.subCategory;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;

		var currentMonth = this.props.currentMonth;
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
			<div style={DebtCategorySummaryContainerStyle}>
				<div style={RowStyle}>
					<label style={CategoryNameStyle}>{subCategory.name}</label>
					<div style={SpacerStyle}/>
					<div style={CategoryMenuStyle} onClick={this.onEditClick} ref={(d)=> this.categoryEditMenu = d}>
						<Glyphicon glyph="cog" />&nbsp;Edit
					</div>
				</div>

				<hr className="inspector-horizontal-rule" />
				<div style={RowStyle}>
					<label style={CategoryPropertyNameStyle}>Cash Left Over from {prevMonthName}</label>
					<span style={SpacerStyle}/>
					<label style={CategoryPropertyValueStyle}>{dataFormatter.formatCurrency(cashLeftOver)}</label>
				</div>
				<div style={RowStyle}>
					<label style={CategoryPropertyNameStyle}>Budgeted This Month</label>
					<span style={SpacerStyle}/>
					<label style={CategoryPropertyValueStyle}>{dataFormatter.formatCurrency(budgetedThisMonth)}</label>
				</div>
				<div style={RowStyle}>
					<label style={CategoryPropertyNameStyle}>Activity this Month</label>
					<span style={SpacerStyle}/>
					<label style={CategoryPropertyValueStyle}>{dataFormatter.formatCurrency(cashSpending)}</label>
				</div>
				<hr className="inspector-horizontal-rule" />
				<div style={RowStyle}>
					<label style={categoryAvailableStyle}>Available</label>
					<span style={SpacerStyle}/>
					<PBalanceValue 
						dataFormatter={dataFormatter}
						monthlySubCategoryBudget={monthlySubCategoryBudget} 
					/>
				</div>

				<PSubCategoryEditDialog 
					ref={(d)=> this.subCategoryEditDialog = d} 
					entitiesCollection={this.props.entitiesCollection}
					updateEntities={this.props.updateEntities}
				/>
			</div>
		);
	}
}