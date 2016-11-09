/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';

import { InternalCategories } from '../../../constants';
import { DataFormatter, DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PMultiCategoryInspectorProps {
	dataFormatter:DataFormatter;
	currentMonth:DateWithoutTime;
	selectedSubCategories:Array<string>;
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

interface SelectedCategoryValues {

	budgeted:number;
	activity:number;
	available:number;
	underFunded:number;
	budgetedLastMonth:number;
	spentLastMonth:number;
	averageBudgeted:number;
	averageSpent:number
}

const DefaultInspectorContainerStyle = {
	display: "flex",
	flexFlow: 'column nowrap',
	alignItems: "center",
	justifyContent: "flex-start",
	color: "#588697",
	paddingTop: "10px",
}

const InspectorHeaderStyle = {
	fontSize: "22px",
	fontWeight: "bold"
}

const CategoryNamesStyle = {
	fontSize: "14px",
	fontWeight: "normal",
	paddingLeft: "10px",
	paddingRight: "10px",
	textAlign: "center"
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

export class PMultiCategoryInspector extends React.Component<PMultiCategoryInspectorProps, {}> {

	constructor(props: any) {
        super(props);
		this.setBudgetedToUnderFunded = this.setBudgetedToUnderFunded.bind(this);
		this.setBudgetedToBudgetedLastMonth = this.setBudgetedToBudgetedLastMonth.bind(this);
		this.setBudgetedToSpentLastMonth = this.setBudgetedToSpentLastMonth.bind(this);
		this.setBudgetedToAverageBudgeted = this.setBudgetedToAverageBudgeted.bind(this);
		this.setBudgetedToAverageSpent = this.setBudgetedToAverageSpent.bind(this);
	}

	private setBudgetedToUnderFunded():void {

		var currentMonth = this.props.currentMonth;
		var selectedSubCategories = this.props.selectedSubCategories;
		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var monthlySubCategoryBudgetsArray = this.props.entitiesCollection.monthlySubCategoryBudgets;

		var changedEntities:ISimpleEntitiesCollection = {
			monthlySubCategoryBudgets: []
		};

		// Get the monthlySubCategoryBudget entities for current month
		var monthlySubCategoryBudgets = monthlySubCategoryBudgetsArray.getMonthlySubCategoryBudgetsByMonth(currentMonth.toISOString());

		// Build a map of the monthlySubCategoryBudgets by subCategoryId
		var monthlySubCategoryBudgetsMap = _.keyBy(monthlySubCategoryBudgets, "subCategoryId");

		// Iterate through all the selected subcategories and update the budgeted values for overspent categories
		_.forEach(selectedSubCategories, (subCategoryId)=>{

			var subCategory = subCategoriesArray.getEntityById(subCategoryId);
			// Get the corresponding monthlySubCategoryBudget
			var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[subCategory.entityId];
			if(monthlySubCategoryBudget.balance < 0) {

				monthlySubCategoryBudget = Object.assign({}, monthlySubCategoryBudget);
				monthlySubCategoryBudget.budgeted += (-monthlySubCategoryBudget.balance);
				changedEntities.monthlySubCategoryBudgets.push(monthlySubCategoryBudget);
			}
		});

		this.props.updateEntities(changedEntities);
	}

	private setBudgetedToBudgetedLastMonth():void {

		var currentMonth = this.props.currentMonth;
		var selectedSubCategories = this.props.selectedSubCategories;
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
		_.forEach(selectedSubCategories, (subCategoryId)=>{

			var subCategory = subCategoriesArray.getEntityById(subCategoryId);
			// Get the corresponding monthlySubCategoryBudget
			var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[subCategory.entityId];
			if(monthlySubCategoryBudget.budgeted != monthlySubCategoryBudget.budgetedPreviousMonth) {

				monthlySubCategoryBudget = Object.assign({}, monthlySubCategoryBudget);
				monthlySubCategoryBudget.budgeted = monthlySubCategoryBudget.budgetedPreviousMonth;
				changedEntities.monthlySubCategoryBudgets.push(monthlySubCategoryBudget);
			}
		});

		this.props.updateEntities(changedEntities);
	}

	private setBudgetedToSpentLastMonth():void {

		var currentMonth = this.props.currentMonth;
		var selectedSubCategories = this.props.selectedSubCategories;
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
		_.forEach(selectedSubCategories, (subCategoryId)=>{

			var subCategory = subCategoriesArray.getEntityById(subCategoryId);
			// Get the corresponding monthlySubCategoryBudget
			var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[subCategory.entityId];
			if(monthlySubCategoryBudget.budgeted != (-monthlySubCategoryBudget.spentPreviousMonth)) {

				monthlySubCategoryBudget = Object.assign({}, monthlySubCategoryBudget);
				monthlySubCategoryBudget.budgeted = (-monthlySubCategoryBudget.spentPreviousMonth);
				changedEntities.monthlySubCategoryBudgets.push(monthlySubCategoryBudget);
			}
		});

		this.props.updateEntities(changedEntities);
	}

	private setBudgetedToAverageBudgeted():void {

		var currentMonth = this.props.currentMonth;
		var selectedSubCategories = this.props.selectedSubCategories;
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
		_.forEach(selectedSubCategories, (subCategoryId)=>{

			var subCategory = subCategoriesArray.getEntityById(subCategoryId);
			// Get the corresponding monthlySubCategoryBudget
			var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[subCategory.entityId];
			if(monthlySubCategoryBudget.budgeted != monthlySubCategoryBudget.budgetedAverage) {

				monthlySubCategoryBudget = Object.assign({}, monthlySubCategoryBudget);
				monthlySubCategoryBudget.budgeted = monthlySubCategoryBudget.budgetedAverage;
				changedEntities.monthlySubCategoryBudgets.push(monthlySubCategoryBudget);
			}
		});

		this.props.updateEntities(changedEntities);
	}

	private setBudgetedToAverageSpent():void {

		var currentMonth = this.props.currentMonth;
		var selectedSubCategories = this.props.selectedSubCategories;
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
		_.forEach(selectedSubCategories, (subCategoryId)=>{

			var subCategory = subCategoriesArray.getEntityById(subCategoryId);
			// Get the corresponding monthlySubCategoryBudget
			var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[subCategory.entityId];
			if(monthlySubCategoryBudget.budgeted != (-monthlySubCategoryBudget.spentAverage)) {

				monthlySubCategoryBudget = Object.assign({}, monthlySubCategoryBudget);
				monthlySubCategoryBudget.budgeted = (-monthlySubCategoryBudget.spentAverage);
				changedEntities.monthlySubCategoryBudgets.push(monthlySubCategoryBudget);
			}
		});

		this.props.updateEntities(changedEntities);
	}
	
	private getSelectedCategoryValues(selectedSubCategories:Array<string>):SelectedCategoryValues {

		var retVal = {
			budgeted:0,
			activity:0,
			available:0,
			underFunded:0, 
			budgetedLastMonth:0, 
			spentLastMonth:0, 
			averageBudgeted:0, 
			averageSpent:0
		};

		var entitiesCollection = this.props.entitiesCollection;
		var monthlySubCategoryBudgetsArray = entitiesCollection.monthlySubCategoryBudgets;
		if(monthlySubCategoryBudgetsArray) {

			var currentMonth = this.props.currentMonth;

			// Get the monthlySubCategoryBudget entities for current month
			var monthlySubCategoryBudgets = monthlySubCategoryBudgetsArray.getMonthlySubCategoryBudgetsByMonth(currentMonth.toISOString());

			// Build a map of the monthlySubCategoryBudgets by subCategoryId
			var monthlySubCategoryBudgetsMap = _.keyBy(monthlySubCategoryBudgets, "subCategoryId");

			// Iterate through all the subcategories, and calculate the quick budget values
			_.forEach(selectedSubCategories, (subCategoryId:string)=>{

				// Get the corresponding monthlySubCategoryBudget and sum up the budgeted/spent values
				var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[subCategoryId];
				retVal.budgeted += monthlySubCategoryBudget.budgeted;
				retVal.activity += (monthlySubCategoryBudget.cashOutflows + monthlySubCategoryBudget.creditOutflows);
				retVal.available += monthlySubCategoryBudget.balance;
				retVal.underFunded += monthlySubCategoryBudget.balance < 0 ? monthlySubCategoryBudget.balance : 0;
				retVal.budgetedLastMonth += monthlySubCategoryBudget.budgetedPreviousMonth;
				retVal.spentLastMonth += monthlySubCategoryBudget.spentPreviousMonth;
				retVal.averageBudgeted += monthlySubCategoryBudget.budgetedAverage;
				retVal.averageSpent += monthlySubCategoryBudget.spentAverage;
			});
		}

		return retVal;
	}

	public render() {

		var dataFormatter = this.props.dataFormatter;
		var currentMonth = this.props.currentMonth;
		var entitiesCollection = this.props.entitiesCollection;

		// Get the category names 
		var categoryNames = "";
		var subCategoriesArray = this.props.entitiesCollection.subCategories;

		if(this.props.selectedSubCategories) {

			_.forEach(this.props.selectedSubCategories, (subCategoryId)=>{

				var subCategory = subCategoriesArray.getEntityById(subCategoryId);
				categoryNames += `${subCategory.name}, `;
			});

			// Remove the space and comma from the end of the names string
			categoryNames = categoryNames.substring(0, categoryNames.length - 2);
		}

		// Get the selected category values
		var categoryValues = this.getSelectedCategoryValues(this.props.selectedSubCategories);

    	return (
			<div style={DefaultInspectorContainerStyle}>
				<div style={SectionStyle}>
					<label style={InspectorHeaderStyle}>{this.props.selectedSubCategories ? this.props.selectedSubCategories.length : 0} Categories Selected</label>
					<label style={CategoryNamesStyle}>{categoryNames}</label>
				</div>
				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>TOTAL BUDGETED</label>
					<label style={ValueStyle}>{dataFormatter.formatCurrency(categoryValues.budgeted)}</label>
				</div>
				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>TOTAL ACTIVTY</label>
					<label style={ValueStyle}>{dataFormatter.formatCurrency(categoryValues.activity)}</label>
				</div>
				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>TOTAL AVAILABLE</label>
					<label style={ValueStyle}>{dataFormatter.formatCurrency(categoryValues.available)}</label>
				</div>

				<hr style={HRStyle}/>
				<div style={SectionStyle}>
					<label style={LabelStyle}>QUICK BUDGET</label>
					<ul style={ListStyle}>
						<li style={ListItemStyle}>
							<Button className="quick-budget-button" onClick={this.setBudgetedToUnderFunded}>
								Underfunded: {dataFormatter.formatCurrency(-categoryValues.underFunded)}
							</Button>
						</li>
						<li style={ListItemStyle}>
							<Button className="quick-budget-button" onClick={this.setBudgetedToBudgetedLastMonth}>
								Budgeted Last Month: {dataFormatter.formatCurrency(categoryValues.budgetedLastMonth)}
							</Button>
						</li>
						<li style={ListItemStyle}>
							<Button className="quick-budget-button" onClick={this.setBudgetedToSpentLastMonth}>
								Spent Last Month: {dataFormatter.formatCurrency(-categoryValues.spentLastMonth)}
							</Button>
						</li>
						<li style={ListItemStyle}>
							<Button className="quick-budget-button" onClick={this.setBudgetedToAverageBudgeted}>
								Average Budgeted: {dataFormatter.formatCurrency(categoryValues.averageBudgeted)}
							</Button>
						</li>
						<li style={ListItemStyle}>
							<Button className="quick-budget-button" onClick={this.setBudgetedToAverageSpent}>
								Average Spent: {dataFormatter.formatCurrency(-categoryValues.averageSpent)}
							</Button>
						</li>
					</ul>
				</div>
			</div>
		);
  	}
}