/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PHeaderRow } from './PHeaderRow';
import { PMasterCategoryRow } from './PMasterCategoryRow';
import { PSubCategoryRow } from './PSubCategoryRow';

import { InternalCategories } from '../../../constants'; 
import { SubCategoriesArray } from '../../../collections';
import { DataFormatter, DateWithoutTime, SimpleObjectMap } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PMonthlyBudgetProps {
	dataFormatter:DataFormatter;
	currentMonth:DateWithoutTime;
	entitiesCollection:IEntitiesCollection;
	editingSubCategory:string;
	selectedSubCategories:Array<string>;
	selectedSubCategoriesMap:SimpleObjectMap<boolean>;
	selectedMasterCategoriesMap:SimpleObjectMap<boolean>;
	// Local UI state updation functions
	selectAllCategories:()=>void;
	unselectAllCategories:()=>void;
	selectSubCategory:(subCategory:budgetEntities.ISubCategory, unselectAllOthers:boolean, setAsEditing:boolean)=>void;
	unselectSubCategory:(subCategory:budgetEntities.ISubCategory)=>void;
	selectMasterCategory:(masterCategory:budgetEntities.IMasterCategory, unselectAllOthers:boolean)=>void;
	unselectMasterCategory:(masterCategory:budgetEntities.IMasterCategory)=>void;
	selectSubCategoryForEditing:(subCategory:budgetEntities.ISubCategory)=>void;
	selectNextSubCategoryForEditing:()=>void;
	selectPreviousSubCategoryForEditing:()=>void;
	showCreateCategoryDialog:(masterCategoryId:string, element:HTMLElement)=>void;
	showSubCategoryEditDialog:(subCategoryId:string, element:HTMLElement)=>void;
	showMasterCategoryEditDialog:(masterCategoryId:string, element:HTMLElement)=>void;
	showCoverOverspendingDialog:(subCategoryId:string, amountToCover:number, element:HTMLElement, placement?:string)=>void;
	showMoveMoneyDialog:(subCategoryId:string, amountToMove:number, element:HTMLElement, placement?:string)=>void;
	showHiddenCategoriesDialog:(element:HTMLElement, placement?:string)=>void;
	showDefaultSubCategoryActivityDialog:(subCategoryId:string, element:HTMLElement, placement?:string)=>void;
	showDebtSubCategoryActivityDialog:(subCategoryId:string, element:HTMLElement, placement?:string)=>void;
	showMasterCategoryActivityDialog:(masterCategoryId:string, element:HTMLElement, placement?:string)=>void;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

const MonthlyBudgetContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	minWidth: "600px",
	backgroundColor: "#FFFFFF",
	borderColor: "#DFE4E9",
	borderStyle: "solid",
	borderTopWidth: "1px",
	borderBottomWidth: "0px",
	borderRightWidth: "1px",
	borderLeftWidth: "0px",
	overflowY: "scroll"
}

const MonthlyBudgetSubContainerStyle:React.CSSProperties = {
	width: "100%",
	height: "100%",
	display: "flex",
	flexFlow: 'column nowrap',
}

export class PMonthlyBudget extends React.Component<PMonthlyBudgetProps, {}> {

	private getBudgetRows(masterCategory:budgetEntities.IMasterCategory, 
					subCategoriesArray:SubCategoriesArray,
					monthlySubCategoryBudgetsMap:SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget>):JSX.Element {

		var masterCategoryRow:JSX.Element;
		var subCategoryRows:Array<JSX.Element> = [];
		var monthlySubCategoryBudgets:Array<budgetEntities.IMonthlySubCategoryBudget> = [];
		// If this is the hidden master category, then we won't be creating subcategory rows for it
		var createSubCategoryRows = (masterCategory.internalName != InternalCategories.HiddenMasterCategory);

		var subCategories = subCategoriesArray.getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategory.entityId);
		_.forEach(subCategories, (subCategory)=>{

			var monthlySubCategoryBudget = monthlySubCategoryBudgetsMap[subCategory.entityId];
			monthlySubCategoryBudgets.push(monthlySubCategoryBudget);

			if(createSubCategoryRows) {

				var subCategoryRow = (
					<PSubCategoryRow 
						key={subCategory.entityId} 
						dataFormatter={this.props.dataFormatter}
						subCategory={subCategory} monthlySubCategoryBudget={monthlySubCategoryBudget}
						editingSubCategory={this.props.editingSubCategory}
						selectedSubCategories={this.props.selectedSubCategories} 
						selectedSubCategoriesMap={this.props.selectedSubCategoriesMap}
						selectSubCategory={this.props.selectSubCategory}
						unselectSubCategory={this.props.unselectSubCategory}
						selectSubCategoryForEditing={this.props.selectSubCategoryForEditing}
						selectNextSubCategoryForEditing={this.props.selectNextSubCategoryForEditing}
						selectPreviousSubCategoryForEditing={this.props.selectPreviousSubCategoryForEditing}
						showSubCategoryEditDialog={this.props.showSubCategoryEditDialog}
						showCoverOverspendingDialog={this.props.showCoverOverspendingDialog}
						showMoveMoneyDialog={this.props.showMoveMoneyDialog}
						showDefaultSubCategoryActivityDialog={this.props.showDefaultSubCategoryActivityDialog}
						showDebtSubCategoryActivityDialog={this.props.showDebtSubCategoryActivityDialog}
						entitiesCollection={this.props.entitiesCollection}
						updateEntities={this.props.updateEntities} />
				);
				subCategoryRows.push(subCategoryRow);
			}
		});

		masterCategoryRow = (
				<PMasterCategoryRow
					key={masterCategory.entityId} 
					dataFormatter={this.props.dataFormatter}
					masterCategory={masterCategory} 
					subCategories={subCategories} 
					monthlySubCategoryBudgets={monthlySubCategoryBudgets}
					selectedMasterCategoriesMap={this.props.selectedMasterCategoriesMap}
					selectMasterCategory={this.props.selectMasterCategory}
					unselectMasterCategory={this.props.unselectMasterCategory}
					showMasterCategoryEditDialog={this.props.showMasterCategoryEditDialog}
					showCreateCategoryDialog={this.props.showCreateCategoryDialog}
					showHiddenCategoriesDialog={this.props.showHiddenCategoriesDialog}
					showMasterCategoryActivityDialog={this.props.showMasterCategoryActivityDialog}

					entitiesCollection={this.props.entitiesCollection}
					updateEntities={this.props.updateEntities}
					>
					{subCategoryRows}
				</PMasterCategoryRow>
		);

		return masterCategoryRow;
	}

	private getUncategorizedRow():JSX.Element {

		var monthString = this.props.currentMonth.toISOString();
		// Get the uncategorized subcategory
		var uncategorizedSubCategory = this.props.entitiesCollection.subCategories.getUncategorizedSubCategory();
		var monthlySubCategoryBudget = this.props.entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(uncategorizedSubCategory.entityId, monthString);
		var uncategorizedRow = (
			<PSubCategoryRow 
				key={uncategorizedSubCategory.entityId} 
				dataFormatter={this.props.dataFormatter}
				subCategory={uncategorizedSubCategory} monthlySubCategoryBudget={monthlySubCategoryBudget}
				editingSubCategory={this.props.editingSubCategory}
				selectedSubCategories={this.props.selectedSubCategories} 
				selectedSubCategoriesMap={this.props.selectedSubCategoriesMap}
				selectSubCategory={this.props.selectSubCategory}
				unselectSubCategory={this.props.unselectSubCategory}
				selectSubCategoryForEditing={this.props.selectSubCategoryForEditing}
				selectNextSubCategoryForEditing={this.props.selectNextSubCategoryForEditing}
				selectPreviousSubCategoryForEditing={this.props.selectPreviousSubCategoryForEditing}
				showSubCategoryEditDialog={this.props.showSubCategoryEditDialog}
				showCoverOverspendingDialog={this.props.showCoverOverspendingDialog}
				showMoveMoneyDialog={this.props.showMoveMoneyDialog}
				showDefaultSubCategoryActivityDialog={this.props.showDefaultSubCategoryActivityDialog}
				showDebtSubCategoryActivityDialog={this.props.showDebtSubCategoryActivityDialog}
				entitiesCollection={this.props.entitiesCollection}
				updateEntities={this.props.updateEntities} />
		);

		return uncategorizedRow;
	}

	public render() {

		var masterCategoryRow:JSX.Element; 
		var masterCategoryRows:Array<JSX.Element> = [];

		var masterCategoriesArray = this.props.entitiesCollection.masterCategories;
		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var monthlySubCategoryBudgetsArray = this.props.entitiesCollection.monthlySubCategoryBudgets;

		if(masterCategoriesArray) {

			// Get the MonthlySubCategoryBudget entities for the current month
			var monthString = this.props.currentMonth.toISOString();
			var monthlySubCategoryBudgets = monthlySubCategoryBudgetsArray.getMonthlySubCategoryBudgetsByMonth(monthString);
			// Create a map of these monthly subcategory budget entities by subCategoryId
			var monthlySubCategoryBudgetsMap:SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget> = {};
			_.forEach(monthlySubCategoryBudgets, (monthlySubCategoryBudget)=>{
				monthlySubCategoryBudgetsMap[monthlySubCategoryBudget.subCategoryId] = monthlySubCategoryBudget;
			});

			// Add the Uncategorized Subcategory row at the top if we have uncategorized values in this month
			var monthlyBudget = this.props.entitiesCollection.monthlyBudgets.getMonthlyBudgetByMonth(monthString);
			if(monthlyBudget && (monthlyBudget.uncategorizedBalance != 0 || 
				monthlyBudget.uncategorizedCashOutflows != 0 || monthlyBudget.uncategorizedCreditOutflows != 0)) {

				masterCategoryRows.push( this.getUncategorizedRow() );
			}

			// Add the Debt Payment master category row, provided we have any debt categories
			var debtPaymentMasterCategory = masterCategoriesArray.getDebtPaymentMasterCategory();
			var debtPaymentSubCategories = subCategoriesArray.getVisibleNonTombstonedSubCategoriesForMasterCategory(debtPaymentMasterCategory.entityId);
			if(debtPaymentSubCategories.length > 0) {
				masterCategoryRow = this.getBudgetRows(debtPaymentMasterCategory, subCategoriesArray, monthlySubCategoryBudgetsMap);
				masterCategoryRows.push(masterCategoryRow);
			}

			// Iterate through the rest of the master categories and create rows for them
			var masterCategories = masterCategoriesArray.getVisibleNonTombstonedMasterCategories();
			_.forEach(masterCategories, (masterCategory)=>{
				masterCategoryRow = this.getBudgetRows(masterCategory, subCategoriesArray, monthlySubCategoryBudgetsMap);
				masterCategoryRows.push(masterCategoryRow);
			});

			// If there are hidden master categories or subcategories, then we are going to show a row
			// for the HiddenMasterCategory as well
			var hasHiddenMasterCategories:boolean = false;
			var hasHiddenSubCategories:boolean = false;
			_.forEach(masterCategoriesArray.getAllItems(), (masterCategory)=>{
				if(masterCategory.isTombstone == 0 && masterCategory.isHidden == 1) {
					hasHiddenMasterCategories = true;
					return false;
				}
			});

			var hiddenSubCategories = subCategoriesArray.getHiddenSubCategories();
			if(hiddenSubCategories.length > 0)
				hasHiddenSubCategories = true;

			if(hasHiddenMasterCategories || hasHiddenSubCategories) {

				var hiddenMasterCategory = masterCategoriesArray.getHiddenMasterCategory();
				masterCategoryRow = this.getBudgetRows(hiddenMasterCategory, subCategoriesArray, monthlySubCategoryBudgetsMap);
				masterCategoryRows.push(masterCategoryRow);
			}
		}

    	return (
			<div style={MonthlyBudgetContainerStyle}>
				<PHeaderRow 
					selectAllCategories={this.props.selectAllCategories}
					unselectAllCategories={this.props.unselectAllCategories}
				/>
				<div style={MonthlyBudgetSubContainerStyle}>
					{masterCategoryRows}
				</div>
			</div>
		);
  	}
}