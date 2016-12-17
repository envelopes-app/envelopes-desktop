/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { InternalCategories } from '../../../constants';
import { DataFormatter, DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PDefaultInspectorProps {
	dataFormatter:DataFormatter;
	currentMonth:DateWithoutTime;
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

const DefaultInspectorContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: 'column nowrap',
	alignItems: "center",
	justifyContent: "flex-start",
	color: "#588697",
	paddingTop: "10px",
}

const SectionStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: 'column nowrap',
	alignItems: "center",
	paddingTop: "10px",
	width: "100%"
}

const LabelStyle:React.CSSProperties = {
	fontSize: "12px",
	fontWeight: "normal"
}

const ValueStyle:React.CSSProperties = {
	fontSize: "24px",
	fontWeight: "bold"
}

const HRStyle:React.CSSProperties = {
	width: "80%",
	marginTop: "10px",
	marginBottom: "10px",
	borderTop: "1px dashed #588697"
}

const ListStyle:React.CSSProperties = {
	paddingLeft: "20px",
	paddingRight: "20px",
	listStyleType: "none",
	width: "100%"
}

const ListItemStyle:React.CSSProperties = {
	width: "100%"
}

export class PDefaultInspector extends React.Component<PDefaultInspectorProps, {}> {

	constructor(props:PDefaultInspectorProps) {
        super(props);
		this.setBudgetedToUnderFunded = this.setBudgetedToUnderFunded.bind(this);
		this.setBudgetedToBudgetedLastMonth = this.setBudgetedToBudgetedLastMonth.bind(this);
		this.setBudgetedToSpentLastMonth = this.setBudgetedToSpentLastMonth.bind(this);
		this.setBudgetedToAverageBudgeted = this.setBudgetedToAverageBudgeted.bind(this);
		this.setBudgetedToAverageSpent = this.setBudgetedToAverageSpent.bind(this);
	}

	private setBudgetedToUnderFunded():void {

		var currentMonth = this.props.currentMonth;
		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var monthlySubCategoryBudgetsArray = this.props.entitiesCollection.monthlySubCategoryBudgets;

		var changedEntities:ISimpleEntitiesCollection = {
			monthlySubCategoryBudgets: []
		};

		// Get the monthlySubCategoryBudget entities for current month
		var monthlySubCategoryBudgets = monthlySubCategoryBudgetsArray.getMonthlySubCategoryBudgetsByMonth(currentMonth.toISOString());

		// Build a map of the monthlySubCategoryBudgets by subCategoryId
		var monthlySubCategoryBudgetsMap = _.keyBy(monthlySubCategoryBudgets, "subCategoryId");

		// Iterate through all the subcategories and update the budgeted values for overspent categories
		_.forEach(subCategoriesArray.getAllItems(), (subCategory)=>{
			// Skip the hidden and internal categories
			if(subCategory.isHidden == 0 && !subCategory.internalName) {

				// Get the corresponding monthlySubCategoryBudget
				var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[subCategory.entityId];
				if(monthlySubCategoryBudget.balance < 0) {

					monthlySubCategoryBudget = Object.assign({}, monthlySubCategoryBudget);
					monthlySubCategoryBudget.budgeted += (-monthlySubCategoryBudget.balance);
					changedEntities.monthlySubCategoryBudgets.push(monthlySubCategoryBudget);
				}
			}
		});

		this.props.updateEntities(changedEntities);
	}

	private setBudgetedToBudgetedLastMonth():void {

		var currentMonth = this.props.currentMonth;
		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var monthlySubCategoryBudgetsArray = this.props.entitiesCollection.monthlySubCategoryBudgets;

		var changedEntities:ISimpleEntitiesCollection = {
			monthlySubCategoryBudgets: []
		};

		// Get the monthlySubCategoryBudget entities for current month
		var monthlySubCategoryBudgets = monthlySubCategoryBudgetsArray.getMonthlySubCategoryBudgetsByMonth(currentMonth.toISOString());

		// Build a map of the monthlySubCategoryBudgets by subCategoryId
		var monthlySubCategoryBudgetsMap = _.keyBy(monthlySubCategoryBudgets, "subCategoryId");

		// Iterate through all the subcategories and update the budgeted values for categories
		_.forEach(subCategoriesArray.getAllItems(), (subCategory)=>{
			// Skip the hidden and internal categories
			if(subCategory.isHidden == 0 && !subCategory.internalName) {

				// Get the corresponding monthlySubCategoryBudget
				var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[subCategory.entityId];
				if(monthlySubCategoryBudget.budgeted != monthlySubCategoryBudget.budgetedPreviousMonth) {

					monthlySubCategoryBudget = Object.assign({}, monthlySubCategoryBudget);
					monthlySubCategoryBudget.budgeted = monthlySubCategoryBudget.budgetedPreviousMonth;
					changedEntities.monthlySubCategoryBudgets.push(monthlySubCategoryBudget);
				}
			}
		});

		this.props.updateEntities(changedEntities);
	}

	private setBudgetedToSpentLastMonth():void {

		var currentMonth = this.props.currentMonth;
		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var monthlySubCategoryBudgetsArray = this.props.entitiesCollection.monthlySubCategoryBudgets;

		var changedEntities:ISimpleEntitiesCollection = {
			monthlySubCategoryBudgets: []
		};

		// Get the monthlySubCategoryBudget entities for current month
		var monthlySubCategoryBudgets = monthlySubCategoryBudgetsArray.getMonthlySubCategoryBudgetsByMonth(currentMonth.toISOString());

		// Build a map of the monthlySubCategoryBudgets by subCategoryId
		var monthlySubCategoryBudgetsMap = _.keyBy(monthlySubCategoryBudgets, "subCategoryId");

		// Iterate through all the subcategories and update the budgeted values for categories
		_.forEach(subCategoriesArray.getAllItems(), (subCategory)=>{
			// Skip the hidden and internal categories
			if(subCategory.isHidden == 0 && !subCategory.internalName) {

				// Get the corresponding monthlySubCategoryBudget
				var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[subCategory.entityId];
				if(monthlySubCategoryBudget.budgeted != (-monthlySubCategoryBudget.spentPreviousMonth)) {

					monthlySubCategoryBudget = Object.assign({}, monthlySubCategoryBudget);
					monthlySubCategoryBudget.budgeted = (-monthlySubCategoryBudget.spentPreviousMonth);
					changedEntities.monthlySubCategoryBudgets.push(monthlySubCategoryBudget);
				}
			}
		});

		this.props.updateEntities(changedEntities);
	}

	private setBudgetedToAverageBudgeted():void {

		var currentMonth = this.props.currentMonth;
		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var monthlySubCategoryBudgetsArray = this.props.entitiesCollection.monthlySubCategoryBudgets;

		var changedEntities:ISimpleEntitiesCollection = {
			monthlySubCategoryBudgets: []
		};

		// Get the monthlySubCategoryBudget entities for current month
		var monthlySubCategoryBudgets = monthlySubCategoryBudgetsArray.getMonthlySubCategoryBudgetsByMonth(currentMonth.toISOString());

		// Build a map of the monthlySubCategoryBudgets by subCategoryId
		var monthlySubCategoryBudgetsMap = _.keyBy(monthlySubCategoryBudgets, "subCategoryId");

		// Iterate through all the subcategories and update the budgeted values for categories
		_.forEach(subCategoriesArray.getAllItems(), (subCategory)=>{
			// Skip the hidden and internal categories
			if(subCategory.isHidden == 0 && !subCategory.internalName) {

				// Get the corresponding monthlySubCategoryBudget
				var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[subCategory.entityId];
				if(monthlySubCategoryBudget.budgeted != monthlySubCategoryBudget.budgetedAverage) {

					monthlySubCategoryBudget = Object.assign({}, monthlySubCategoryBudget);
					monthlySubCategoryBudget.budgeted = monthlySubCategoryBudget.budgetedAverage;
					changedEntities.monthlySubCategoryBudgets.push(monthlySubCategoryBudget);
				}
			}
		});

		this.props.updateEntities(changedEntities);
	}

	private setBudgetedToAverageSpent():void {

		var currentMonth = this.props.currentMonth;
		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var monthlySubCategoryBudgetsArray = this.props.entitiesCollection.monthlySubCategoryBudgets;

		var changedEntities:ISimpleEntitiesCollection = {
			monthlySubCategoryBudgets: []
		};

		// Get the monthlySubCategoryBudget entities for current month
		var monthlySubCategoryBudgets = monthlySubCategoryBudgetsArray.getMonthlySubCategoryBudgetsByMonth(currentMonth.toISOString());

		// Build a map of the monthlySubCategoryBudgets by subCategoryId
		var monthlySubCategoryBudgetsMap = _.keyBy(monthlySubCategoryBudgets, "subCategoryId");

		// Iterate through all the subcategories and update the budgeted values for categories
		_.forEach(subCategoriesArray.getAllItems(), (subCategory)=>{
			// Skip the hidden and internal categories
			if(subCategory.isHidden == 0 && !subCategory.internalName) {

				// Get the corresponding monthlySubCategoryBudget
				var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[subCategory.entityId];
				if(monthlySubCategoryBudget.budgeted != (-monthlySubCategoryBudget.spentAverage)) {

					monthlySubCategoryBudget = Object.assign({}, monthlySubCategoryBudget);
					monthlySubCategoryBudget.budgeted = (-monthlySubCategoryBudget.spentAverage);
					changedEntities.monthlySubCategoryBudgets.push(monthlySubCategoryBudget);
				}
			}
		});

		this.props.updateEntities(changedEntities);
	}
	
	private getAverageBudgetedAndSpentForLastMonth():{averageBudgeted:number, averageSpent:number} {

		var retVal = {averageBudgeted:0, averageSpent:0};
		var entitiesCollection = this.props.entitiesCollection;
		var subCategoriesArray = entitiesCollection.subCategories;
		var monthlySubCategoryBudgetsArray = entitiesCollection.monthlySubCategoryBudgets;
		if(subCategoriesArray && monthlySubCategoryBudgetsArray) {

			var currentMonth = this.props.currentMonth;
			var prevMonth = currentMonth.clone().subtractMonths(1);

			// Get the monthlySubCategoryBudget entities for current month
			var monthlySubCategoryBudgets = monthlySubCategoryBudgetsArray.getMonthlySubCategoryBudgetsByMonth(currentMonth.toISOString());

			// Build a map of the monthlySubCategoryBudgets by subCategoryId
			var monthlySubCategoryBudgetsMap = _.keyBy(monthlySubCategoryBudgets, "subCategoryId");

			// Iterate through all the subcategories, and calculate the average budgeted and spent values
			_.forEach(subCategoriesArray.getAllItems(), (subCategory)=>{
				// Skip the hidden and internal categories
				if(subCategory.isHidden == 0 && !subCategory.internalName) {

					// Get the corresponding monthlySubCategoryBudget and sum up the budgeted/spent values
					var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[subCategory.entityId];
					retVal.averageBudgeted += monthlySubCategoryBudget.budgetedAverage;
					retVal.averageSpent += monthlySubCategoryBudget.spentAverage;
				}
			});
		}

		return retVal;
	}

	public render() {

		var dataFormatter = this.props.dataFormatter;
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
		var totalAvailable:number = monthlyBudget ? monthlyBudget.balance : 0;
		var totalInflows:number = monthlyBudget ? monthlyBudget.immediateIncome : 0;

		// Get the quick budget values
		var underfundedValue:number = monthlyBudget ? monthlyBudget.overSpent : 0;
		var budgetedLastMonth:number = monthlyBudgetForPrevMonth ? monthlyBudgetForPrevMonth.budgeted : 0;
		var spentLastMonth:number = monthlyBudgetForPrevMonth ? monthlyBudgetForPrevMonth.cashOutflows + monthlyBudgetForPrevMonth.creditOutflows : 0;
		var averageBudgetedAndSpent = this.getAverageBudgetedAndSpentForLastMonth();

    	return (
			<div style={DefaultInspectorContainerStyle}>
				<div style={SectionStyle}>
					<label style={LabelStyle}>TOTAL BUDGETED</label>
					<label style={ValueStyle}>{dataFormatter.formatCurrency(totalBudgeted)}</label>
				</div>
				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>TOTAL ACTIVTY</label>
					<label style={ValueStyle}>{dataFormatter.formatCurrency(totalActivity)}</label>
				</div>
				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>TOTAL AVAILABLE</label>
					<label style={ValueStyle}>{dataFormatter.formatCurrency(totalAvailable)}</label>
				</div>
				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>TOTAL INFLOWS</label>
					<label style={ValueStyle}>{dataFormatter.formatCurrency(totalInflows)}</label>
				</div>

				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>QUICK BUDGET</label>
					<ul style={ListStyle}>
						<li style={ListItemStyle}>
							<button className="quick-budget-button" onClick={this.setBudgetedToUnderFunded}>
								Underfunded: {dataFormatter.formatCurrency(underfundedValue)}
							</button>
						</li>
						<li style={ListItemStyle}>
							<button className="quick-budget-button" onClick={this.setBudgetedToBudgetedLastMonth}>
								Budgeted Last Month: {dataFormatter.formatCurrency(budgetedLastMonth)}
							</button>
						</li>
						<li style={ListItemStyle}>
							<button className="quick-budget-button" onClick={this.setBudgetedToSpentLastMonth}>
								Spent Last Month: {dataFormatter.formatCurrency(-spentLastMonth)}
							</button>
						</li>
						<li style={ListItemStyle}>
							<button className="quick-budget-button" onClick={this.setBudgetedToAverageBudgeted}>
								Average Budgeted: {dataFormatter.formatCurrency(averageBudgetedAndSpent.averageBudgeted)}
							</button>
						</li>
						<li style={ListItemStyle}>
							<button className="quick-budget-button" onClick={this.setBudgetedToAverageSpent}>
								Average Spent: {dataFormatter.formatCurrency(-averageBudgetedAndSpent.averageSpent)}
							</button>
						</li>
					</ul>
				</div>
			</div>
		);
  	}
}