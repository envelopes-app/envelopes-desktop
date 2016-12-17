/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PNotes } from './PNotes';
import { PMessage } from './PMessage';
import { PDefaultCategorySummary } from './PDefaultCategorySummary';
import { PDefaultCategoryQuickBudget } from './PDefaultCategoryQuickBudget';
import { PDefaultCategoryGoals } from './PDefaultCategoryGoals';

import { DataFormatter, DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PDefaultCategoryInspectorProps {
	dataFormatter:DataFormatter;
	subCategoryId:string;
	currentMonth:DateWithoutTime;
	entitiesCollection:IEntitiesCollection;
	showUpcomingTransactionsDialog:(monthlySubCategoryBudgetId:string, element:HTMLElement, placement?:string)=>void;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

const DefaultCategoryInspectorContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: 'column nowrap',
	alignItems: "center",
	justifyContent: "flex-start",
	color: "#588697",
}

export class PDefaultCategoryInspector extends React.Component<PDefaultCategoryInspectorProps, {}> {

	public render() {

		var subCategoryId = this.props.subCategoryId;
		var currentMonth = this.props.currentMonth;
		var entitiesCollection = this.props.entitiesCollection;
		// Get the subCategory and monthlySubCategoryBudget entity from the entitiesCollection
		var subCategory = entitiesCollection.subCategories.getEntityById(subCategoryId);
		var monthlySubCategoryBudget = entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(subCategoryId, currentMonth.toISOString());

		return (
			<div style={DefaultCategoryInspectorContainerStyle}>

				<PDefaultCategorySummary 
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

				<PDefaultCategoryQuickBudget
					dataFormatter={this.props.dataFormatter}
					monthlySubCategoryBudget={monthlySubCategoryBudget}
					updateEntities={this.props.updateEntities}
				/>	

				<PDefaultCategoryGoals 
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