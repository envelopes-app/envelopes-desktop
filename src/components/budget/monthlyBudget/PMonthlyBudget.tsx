/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PHeaderRow } from './PHeaderRow';
import { PToolbarRow } from './PToolbarRow';
import { PMasterCategoryRow } from './PMasterCategoryRow';
import { PSubCategoryRow } from './PSubCategoryRow';

import { InternalCategories } from '../../../constants'; 
import { SubCategoriesArray } from '../../../collections';
import { DataFormatter, DateWithoutTime, SimpleObjectMap } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PMonthlyBudgetProps {
	dataFormatter:DataFormatter;
	containerHeight:number;
	containerWidth:number;
	visibleMonths:number;
	currentMonth:DateWithoutTime;
	entitiesCollection:IEntitiesCollection;
	editingSubCategoryId:string;
	editingSubCategoryMonth:DateWithoutTime;
	selectedSubCategoriesMap:SimpleObjectMap<boolean>;
	selectedMasterCategoriesMap:SimpleObjectMap<boolean>;
	collapsedMasterCategoriesMap:SimpleObjectMap<boolean>;
	// Local UI state updation functions
	selectAllCategories:()=>void;
	unselectAllCategories:()=>void;
	selectSubCategory:(subCategory:budgetEntities.ISubCategory, month:DateWithoutTime, unselectAllOthers:boolean, setAsEditing:boolean)=>void;
	unselectSubCategory:(subCategory:budgetEntities.ISubCategory)=>void;
	selectMasterCategory:(masterCategory:budgetEntities.IMasterCategory, unselectAllOthers:boolean)=>void;
	unselectMasterCategory:(masterCategory:budgetEntities.IMasterCategory)=>void;
	selectSubCategoryForEditing:(subCategory:budgetEntities.ISubCategory, month:DateWithoutTime)=>void;
	selectNextSubCategoryForEditing:()=>void;
	selectPreviousSubCategoryForEditing:()=>void;
	expandAllMasterCategories:()=>void;
	collapseAllMasterCategories:()=>void;
	onAddCategoryGroupSelected:(element:HTMLElement)=>void;
	showReorderCategoriesDialog:()=>void;
	expandMasterCategory:(masterCategoryId:string)=>void;
	collapseMasterCategory:(masterCategoryId:string)=>void;
	showCreateCategoryDialog:(masterCategoryId:string, element:HTMLElement)=>void;
	showSubCategoryEditDialog:(subCategoryId:string, element:HTMLElement)=>void;
	showMasterCategoryEditDialog:(masterCategoryId:string, element:HTMLElement)=>void;
	showCoverOverspendingDialog:(subCategoryId:string, month:DateWithoutTime, amountToCover:number, element:HTMLElement, placement?:string)=>void;
	showMoveMoneyDialog:(subCategoryId:string, month:DateWithoutTime, amountToMove:number, element:HTMLElement, placement?:string)=>void;
	showHiddenCategoriesDialog:(element:HTMLElement, placement?:string)=>void;
	showDefaultSubCategoryActivityDialog:(subCategoryId:string, month:DateWithoutTime, element:HTMLElement, placement?:string)=>void;
	showDebtSubCategoryActivityDialog:(subCategoryId:string, month:DateWithoutTime, element:HTMLElement, placement?:string)=>void;
	showMasterCategoryActivityDialog:(masterCategoryId:string, month:DateWithoutTime, element:HTMLElement, placement?:string)=>void;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

const MonthlyBudgetContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: 'column nowrap',
	minWidth: "600px",
	backgroundColor: "#FFFFFF",
	borderColor: "#DFE4E9",
	borderStyle: "solid",
	borderTopWidth: "0px",
	borderBottomWidth: "0px",
	borderRightWidth: "1px",
	borderLeftWidth: "0px",
}

const MonthlyBudgetSubContainerStyle:React.CSSProperties = {
	width: "100%",
	display: "flex",
	flexFlow: 'column nowrap',
	overflowY: "auto"
}

export class PMonthlyBudget extends React.Component<PMonthlyBudgetProps, {}> {

	private monthlyBudgetContainer:HTMLDivElement;

	private getBudgetRows(masterCategory:budgetEntities.IMasterCategory, 
					subCategoriesArray:SubCategoriesArray,
					monthlySubCategoryBudgetsMap:SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget>):JSX.Element {

		var masterCategoryRow:JSX.Element;
		var subCategoryRows:Array<JSX.Element> = [];
		var currentMonth = this.props.currentMonth;
		// If this is the hidden master category, then we won't be creating subcategory rows for it
		var createSubCategoryRows = (masterCategory.internalName != InternalCategories.HiddenMasterCategory);

		var subCategories = subCategoriesArray.getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategory.entityId);
		_.forEach(subCategories, (subCategory)=>{

			if(createSubCategoryRows) {

				var subCategoryRow = (
					<PSubCategoryRow 
						key={subCategory.entityId} 
						dataFormatter={this.props.dataFormatter}
						containerHeight={this.props.containerHeight}
						containerWidth={this.props.containerWidth}
						visibleMonths={this.props.visibleMonths}
						currentMonth={this.props.currentMonth}
						subCategory={subCategory} 
						monthlySubCategoryBudgetsMap={monthlySubCategoryBudgetsMap}
						editingSubCategoryId={this.props.editingSubCategoryId}
						editingSubCategoryMonth={this.props.editingSubCategoryMonth}
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
						updateEntities={this.props.updateEntities} />
				);
				subCategoryRows.push(subCategoryRow);
			}
		});

		masterCategoryRow = (
				<PMasterCategoryRow
					key={masterCategory.entityId} 
					dataFormatter={this.props.dataFormatter}
					containerHeight={this.props.containerHeight}
					containerWidth={this.props.containerWidth}
					visibleMonths={this.props.visibleMonths}
					currentMonth={this.props.currentMonth}
					masterCategory={masterCategory} 
					subCategories={subCategories} 
					monthlySubCategoryBudgetsMap={monthlySubCategoryBudgetsMap}
					selectedMasterCategoriesMap={this.props.selectedMasterCategoriesMap}
					collapsedMasterCategoriesMap={this.props.collapsedMasterCategoriesMap}
					selectMasterCategory={this.props.selectMasterCategory}
					unselectMasterCategory={this.props.unselectMasterCategory}
					expandMasterCategory={this.props.expandMasterCategory}
					collapseMasterCategory={this.props.collapseMasterCategory}
					showMasterCategoryEditDialog={this.props.showMasterCategoryEditDialog}
					showCreateCategoryDialog={this.props.showCreateCategoryDialog}
					showHiddenCategoriesDialog={this.props.showHiddenCategoriesDialog}
					showMasterCategoryActivityDialog={this.props.showMasterCategoryActivityDialog}>

					{subCategoryRows}
				</PMasterCategoryRow>
		);

		return masterCategoryRow;
	}

	private getUncategorizedRow(monthlySubCategoryBudgetsMap:SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget>):JSX.Element {

		var monthString = this.props.currentMonth.toISOString();
		// Get the uncategorized subcategory
		var uncategorizedSubCategory = this.props.entitiesCollection.subCategories.getUncategorizedSubCategory();
		var monthlySubCategoryBudget = this.props.entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(uncategorizedSubCategory.entityId, monthString);
		var uncategorizedRow = (
			<PSubCategoryRow 
				key={uncategorizedSubCategory.entityId} 
				dataFormatter={this.props.dataFormatter}
				containerHeight={this.props.containerHeight}
				containerWidth={this.props.containerWidth}
				visibleMonths={this.props.visibleMonths}
				currentMonth={this.props.currentMonth}
				subCategory={uncategorizedSubCategory} 
				monthlySubCategoryBudgetsMap={monthlySubCategoryBudgetsMap}
				editingSubCategoryId={this.props.editingSubCategoryId}
				editingSubCategoryMonth={this.props.editingSubCategoryMonth}
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
				updateEntities={this.props.updateEntities} />
		);

		return uncategorizedRow;
	}

	public calculateVisibleMonths():number {

		if(this.monthlyBudgetContainer) {

			// We are going to allocate a minimum of 290px for the name column 
			var categoryColumnNameWidth = 300; // Added 10 for right padding
			var monthlyDataColumnWidth = 305;
			// Get the width of the container available for displaying the monthly budget data and 
			// calculate the number of visible months that we can fit
			var availableWidth = this.monthlyBudgetContainer.clientWidth - categoryColumnNameWidth;
			var visibleMonths = Math.max(Math.floor(availableWidth / monthlyDataColumnWidth), 1);
			return visibleMonths;
		}

		return 1;
	}

	private showUncategorizedRow():boolean {

		var currentMonth = this.props.currentMonth.clone();
		var visibleMonths = this.props.visibleMonths;

		// We want to show the uncategorized row if we have uncategorized values in any of the visible month values
		for(var i:number = 0; i < visibleMonths; i++) {
			var monthString = currentMonth.toISOString();
			var monthlyBudget = this.props.entitiesCollection.monthlyBudgets.getMonthlyBudgetByMonth(monthString);
			if(monthlyBudget && (monthlyBudget.uncategorizedBalance != 0 || 
				monthlyBudget.uncategorizedCashOutflows != 0 || monthlyBudget.uncategorizedCreditOutflows != 0)) {
				return true;
			}

			currentMonth.subtractMonths(1);
		}

		return false;
	}

	public render() {

		var masterCategoryRow:JSX.Element; 
		var masterCategoryRows:Array<JSX.Element> = [];

		var masterCategoriesArray = this.props.entitiesCollection.masterCategories;
		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var monthlySubCategoryBudgetsArray = this.props.entitiesCollection.monthlySubCategoryBudgets;

		if(masterCategoriesArray) {

			var visibleMonths = this.props.visibleMonths;
			var currentMonth = this.props.currentMonth.clone();
			var monthlySubCategoryBudgetsMap:SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget> = {};

			for(var i:number = 0; i < visibleMonths; i++) {

				// Get the MonthlySubCategoryBudget entities for the current month
				var monthString = currentMonth.toISOString();
				var monthlySubCategoryBudgets = monthlySubCategoryBudgetsArray.getMonthlySubCategoryBudgetsByMonth(monthString);
				// Create a map of these monthly subcategory budget entities by month and subCategoryId concatenated
				_.forEach(monthlySubCategoryBudgets, (monthlySubCategoryBudget)=>{
					monthlySubCategoryBudgetsMap[`${monthString}_${monthlySubCategoryBudget.subCategoryId}`] = monthlySubCategoryBudget;
				});

				// Subtract a month from the current month so that we can get the data for previous visible months, if any.
				currentMonth.subtractMonths(1);
			}

			// Add the Uncategorized Subcategory row at the top if we have uncategorized values in any of the visible months
			if(this.showUncategorizedRow()) {
				masterCategoryRows.push( this.getUncategorizedRow(monthlySubCategoryBudgetsMap) );
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
			<div ref={(d)=> this.monthlyBudgetContainer = d} style={MonthlyBudgetContainerStyle}>

				<PToolbarRow 
					dataFormatter={this.props.dataFormatter}
					visibleMonths={this.props.visibleMonths}
					currentMonth={this.props.currentMonth}
					entitiesCollection={this.props.entitiesCollection}
					expandAllMasterCategories={this.props.expandAllMasterCategories}
					collapseAllMasterCategories={this.props.collapseAllMasterCategories}
					onAddCategoryGroupSelected={this.props.onAddCategoryGroupSelected} 
					showReorderCategoriesDialog={this.props.showReorderCategoriesDialog}
					showMoveMoneyDialog={this.props.showMoveMoneyDialog}
					showCoverOverspendingDialog={this.props.showCoverOverspendingDialog}
				/>
				<PHeaderRow 
					visibleMonths={this.props.visibleMonths}
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