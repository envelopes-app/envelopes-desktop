/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PNotes } from './PNotes';
import { PMessage } from './PMessage';
import { PDebtCategorySummary } from './PDebtCategorySummary';
import { PDebtCategoryPayments } from './PDebtCategoryPayments';
import { PDebtCategoryQuickBudget } from './PDebtCategoryQuickBudget';
import { PDebtCategoryGoals } from './PDebtCategoryGoals';

import { DataFormatter, DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PDebtCategoryInspectorProps {
	dataFormatter:DataFormatter;
	subCategoryId:string;
	currentMonth:DateWithoutTime;
	entitiesCollection:IEntitiesCollection;
	showUpcomingTransactionsDialog:(monthlySubCategoryBudgetId:string, element:HTMLElement, placement?:string)=>void;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

const DebtCategoryInspectorContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: 'column nowrap',
	alignItems: "center",
	justifyContent: "flex-start",
	color: "#588697"
}

export class PDebtCategoryInspector extends React.Component<PDebtCategoryInspectorProps, {}> {

	public render() {

		var subCategoryId = this.props.subCategoryId;
		var currentMonth = this.props.currentMonth;
		var entitiesCollection = this.props.entitiesCollection;
		// Get the account, subCategory and monthlySubCategoryBudget entity from the entitiesCollection
		var subCategory = entitiesCollection.subCategories.getEntityById(subCategoryId);
		var account = entitiesCollection.accounts.getEntityById(subCategory.accountId);
		var monthlySubCategoryBudget = entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(subCategoryId, currentMonth.toISOString());

		return (
			<div style={DebtCategoryInspectorContainerStyle}>

				<PDebtCategorySummary 
					dataFormatter={this.props.dataFormatter}
					currentMonth={currentMonth}
					subCategory={subCategory} 
					monthlySubCategoryBudget={monthlySubCategoryBudget} 
					entitiesCollection={this.props.entitiesCollection}
					updateEntities={this.props.updateEntities}
				/>

				<PMessage 
					dataFormatter={this.props.dataFormatter}
					subCategory={subCategory} 
					monthlySubCategoryBudget={monthlySubCategoryBudget} 
					showUpcomingTransactionsDialog={this.props.showUpcomingTransactionsDialog}
				/>

				<PDebtCategoryPayments
					dataFormatter={this.props.dataFormatter}
					account={account}
					subCategory={subCategory}
					monthlySubCategoryBudget={monthlySubCategoryBudget}
				/>

				<PDebtCategoryQuickBudget
					dataFormatter={this.props.dataFormatter}
					monthlySubCategoryBudget={monthlySubCategoryBudget}
					updateEntities={this.props.updateEntities}
				/>	

				<PDebtCategoryGoals 
					dataFormatter={this.props.dataFormatter}
					subCategory={subCategory}
					monthlySubCategoryBudget={monthlySubCategoryBudget}
					updateEntities={this.props.updateEntities}
				/>

				<PNotes 
					subCategory={subCategory} 
					updateEntities={this.props.updateEntities} 
				/>
			</div>
		);
	}
}