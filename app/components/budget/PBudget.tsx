/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PBudgetHeader } from './header/PBudgetHeader';
import { PBudgetToolbar } from './toolbar/PBudgetToolbar';
import { PMonthlyBudget } from './monthlyBudget/PMonthlyBudget';
import { PInspectorContainer } from './inspectors/PInspectorContainer';

import * as dialogs from './dialogs';
import * as budgetEntities from '../../interfaces/budgetEntities';
import * as catalogEntities from '../../interfaces/catalogEntities';
import { IDataFormat } from '../../interfaces/formatters';
import { DataFormats, DataFormatter, DateWithoutTime, SimpleObjectMap } from '../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../interfaces/state';

export interface PBudgetProps {
	// State Variables
	activeBudgetId:string;
	selectedBudgetMonth:DateWithoutTime;
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
	setSelectedBudgetMonth:(month:DateWithoutTime)=>void;
}

export interface PBudgetState {
	dataFormat:string;
	dataFormatter:DataFormatter;
	editingSubCategory:string;
	selectedSubCategories:Array<string>;
	selectedSubCategoriesMap:SimpleObjectMap<boolean>;
	selectedMasterCategoriesMap:SimpleObjectMap<boolean>;
}

const BudgetContainerStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	height: '100%',
	width: '100%'
}

const BudgetSubContainerStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',
	height: '100%',
	width: '100%',
	overflowX: "scroll"
}

export class PBudget extends React.Component<PBudgetProps, PBudgetState> {
  
	// TODO: Select/Unselect all categories
	// TODO: Expand/Collapse all categories
	// TODO: Activity column numbers should be disabled when there are is no activity
	// TODO: In MoveMoneyDialog, category list does not appear when we select category field with mouse.

	private createCategoryDialog:dialogs.PCreateCategoryDialog;
	private subCategoryEditDialog:dialogs.PSubCategoryEditDialog;
	private masterCategoryEditDialog:dialogs.PMasterCategoryEditDialog;
	private moveMoneyDialog:dialogs.PMoveMoneyDialog;
	private coverOverspendingDialog:dialogs.PCoverOverspendingDialog;
	private hiddenCategoriesDialog:dialogs.PHiddenCategoriesDialog;
	private defaultCategoryActivityDialog:dialogs.PDefaultCategoryActivityDialog;
	private debtCategoryActivityDialog:dialogs.PDebtCategoryActivityDialog;
	private masterCategoryActivityDialog:dialogs.PMasterCategoryActivityDialog;

	constructor(props:PBudgetProps) {
        super(props);
		this.setSelectedMonth = this.setSelectedMonth.bind(this); 
		this.selectSubCategory = this.selectSubCategory.bind(this);
		this.unselectSubCategory = this.unselectSubCategory.bind(this);
		this.selectMasterCategory = this.selectMasterCategory.bind(this);
		this.unselectMasterCategory = this.unselectMasterCategory.bind(this);
		this.selectSubCategoryForEditing = this.selectSubCategoryForEditing.bind(this);
		this.selectNextSubCategoryForEditing = this.selectNextSubCategoryForEditing.bind(this);
		this.selectPreviousSubCategoryForEditing = this.selectPreviousSubCategoryForEditing.bind(this);
		this.showSubCategoryEditDialog = this.showSubCategoryEditDialog.bind(this);
		this.showMasterCategoryEditDialog = this.showMasterCategoryEditDialog.bind(this);
		this.showCreateCategoryDialog = this.showCreateCategoryDialog.bind(this);
		this.showCoverOverspendingDialog = this.showCoverOverspendingDialog.bind(this);
		this.showMoveMoneyDialog = this.showMoveMoneyDialog.bind(this);
		this.showHiddenCategoriesDialog = this.showHiddenCategoriesDialog.bind(this);
		this.showDefaultSubCategoryActivityDialog = this.showDefaultSubCategoryActivityDialog.bind(this);
		this.showDebtSubCategoryActivityDialog = this.showDebtSubCategoryActivityDialog.bind(this);
		this.showMasterCategoryActivityDialog = this.showMasterCategoryActivityDialog.bind(this);
		this.onAddCategoryGroupSelected = this.onAddCategoryGroupSelected.bind(this);

		// If there is not active budget, default the formatter to en_US so that 
		// we have something to work with at startup
		var dataFormat = DataFormats.locale_mappings["en_US"];
		var activeBudgetId = props.activeBudgetId;
		if(activeBudgetId && props.entitiesCollection.budgets) {

			var activeBudget = props.entitiesCollection.budgets.getEntityById(activeBudgetId);
			if(activeBudget && activeBudget.dataFormat) {
				dataFormat = JSON.parse(activeBudget.dataFormat) as IDataFormat;
			}
		}

		this.state = {
			dataFormat: JSON.stringify(dataFormat),
			dataFormatter: new DataFormatter(dataFormat),
			editingSubCategory: null,
			selectedSubCategories: [],
			selectedSubCategoriesMap: {},
			selectedMasterCategoriesMap: {}
		}
    }

	private setSelectedMonth(month:DateWithoutTime):void {

		var selectedMonth = this.props.selectedBudgetMonth;
		if(selectedMonth.equalsByMonth(month) == false) {
			// Call the dispatcher function to set the selected month
			this.props.setSelectedBudgetMonth(month);
		}
	}
  	// *******************************************************************************************************
	// Handlers for commands initiated from the budget rows
	// *******************************************************************************************************
	private selectSubCategory(subCategory:budgetEntities.ISubCategory, unselectAllOthers:boolean, setAsEditing:boolean):void {

		var state = Object.assign({}, this.state) as PBudgetState;
		if(unselectAllOthers) {
			state.selectedSubCategories = [];
			state.selectedSubCategoriesMap = {};
			state.selectedMasterCategoriesMap = {};

			if(setAsEditing)
				state.editingSubCategory = subCategory.entityId;
			else
				state.editingSubCategory = null;
		}

		// Mark the passed subCategoryId as selected
		state.selectedSubCategories.push(subCategory.entityId);
		state.selectedSubCategoriesMap[subCategory.entityId] = true;
		// Check if the master category for this subcategory needs to be selected
		state.selectedMasterCategoriesMap[subCategory.masterCategoryId] = this.shouldMasterCategorybeSelected(subCategory.masterCategoryId);
		this.setState(state);
	}

	private unselectSubCategory(subCategory:budgetEntities.ISubCategory):void {

		var state = Object.assign({}, this.state) as PBudgetState;
		// Mark the passed subCategoryId as unselected
		var index = _.findIndex(state.selectedSubCategories, subCategory.entityId);
		state.editingSubCategory = null;
		state.selectedSubCategories.splice(index, 1);
		state.selectedSubCategoriesMap[subCategory.entityId] = false;
		// Since we are unselecting the subcategory, it's master category, if selected, would also ne unselected
		state.selectedMasterCategoriesMap[subCategory.masterCategoryId] = false;
		this.setState(state);
	}

	private shouldMasterCategorybeSelected(masterCategoryId:string):boolean {

		var allSelected:boolean = true;
		// Get all the subcategories for this master category and check if they are all selected
		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var subCategories = subCategoriesArray.getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategoryId);
		// Check if all these subCategories are selected
		_.forEach(subCategories, (subCategory)=>{
			if(!this.state.selectedSubCategoriesMap[subCategory.entityId])
				allSelected = false;
		});

		return allSelected;
	}

	private shouldAllCategoriesBeSelected():boolean {

		var allSelected:boolean = true;
		return allSelected;
	}

	private selectMasterCategory(masterCategory:budgetEntities.IMasterCategory, unselectAllOthers:boolean):void {

		var state = Object.assign({}, this.state) as PBudgetState;
		if(unselectAllOthers) {
			state.editingSubCategory = null;
			state.selectedSubCategories = [];
			state.selectedSubCategoriesMap = {};
			state.selectedMasterCategoriesMap = {};
		}

		// Get all the subcategories for this master category and set them as selected
		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var subCategories = subCategoriesArray.getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategory.entityId);
		// Mark all these subCategories as selected
		_.forEach(subCategories, (subCategory)=>{
			state.selectedSubCategories.push(subCategory.entityId);
			state.selectedSubCategoriesMap[subCategory.entityId] = true;
		});
		// Mark the master category as selected
		state.selectedMasterCategoriesMap[masterCategory.entityId] = true;
		this.setState(state);
	}

	private unselectMasterCategory(masterCategory:budgetEntities.IMasterCategory):void {

		var state = Object.assign({}, this.state) as PBudgetState;
		// Get all the subcategories for this master category and set them as unselected
		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var subCategories = subCategoriesArray.getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategory.entityId);
		// Mark all these subCategories as unselected
		_.forEach(subCategories, (subCategory)=>{
			var index = _.findIndex(state.selectedSubCategories, subCategory.entityId);
			state.editingSubCategory = null;
			state.selectedSubCategories.splice(index, 1);
			state.selectedSubCategoriesMap[subCategory.entityId] = false;
		});
		// Mark the master category as unselected
		state.selectedMasterCategoriesMap[masterCategory.entityId] = false;
		this.setState(state);
	}

	private selectSubCategoryForEditing(subCategory:budgetEntities.ISubCategory):void {

		var subCategoryId = subCategory.entityId;
		var state = Object.assign({}, this.state) as PBudgetState;
		state.editingSubCategory = subCategoryId;
		state.selectedSubCategories = [subCategoryId];
		state.selectedSubCategoriesMap = {};
		state.selectedSubCategoriesMap[subCategoryId] = true;
		state.selectedMasterCategoriesMap = {};
		this.setState(state);
	}

	private selectNextSubCategoryForEditing():void {

		debugger;
		var state = Object.assign({}, this.state) as PBudgetState;
		// Get the sorted list of subcategories
		var subCategoryIds = this.getSortedCategoryIdsList();
		// If we don't currently have a subcategory being edited, then set the first category
		// from the list to be the one being edited
		if(!state.editingSubCategory)
			state.editingSubCategory = subCategoryIds[0];
		else {
			// Find the index of the subcategory currently being edited
			var index = _.indexOf(subCategoryIds, state.editingSubCategory);
			// if the index is for the last item in the list, then set it to zero.
			// Otherwise increment it to point to next subcategory
			if(index == subCategoryIds.length - 1)
				index = 0;
			else
				index++;

			var subCategoryId = subCategoryIds[index];
			state.editingSubCategory = subCategoryId;
			state.selectedSubCategories = [subCategoryId];
			state.selectedSubCategoriesMap = {};
			state.selectedSubCategoriesMap[subCategoryId] = true;
			state.selectedMasterCategoriesMap = {};
		}

		this.setState(state);
	}

	private selectPreviousSubCategoryForEditing():void {

		var state = Object.assign({}, this.state) as PBudgetState;
		// Get the sorted list of subcategories
		var subCategoryIds = this.getSortedCategoryIdsList();
		// If we don't currently have a subcategory being edited, then set the first category
		// from the list to be the one being edited
		if(!state.editingSubCategory)
			state.editingSubCategory = subCategoryIds[0];
		else {
			// Find the index of the subcategory currently being edited
			var index = _.indexOf(subCategoryIds, state.editingSubCategory);
			// if the index is for the first item in the list, then set it to the last item.
			// Otherwise decrement it to point to previous subcategory
			if(index == 0)
				index = subCategoryIds.length - 1;
			else
				index--;

			var subCategoryId = subCategoryIds[index];
			state.editingSubCategory = subCategoryId;
			state.selectedSubCategories = [subCategoryId];
			state.selectedSubCategoriesMap = {};
			state.selectedSubCategoriesMap[subCategoryId] = true;
			state.selectedMasterCategoriesMap = {};
		}

		this.setState(state);
	}

	private showSubCategoryEditDialog(subCategoryId:string, element:HTMLElement):void {
		// Show the dialog for editing the subcategory
		this.subCategoryEditDialog.show(subCategoryId, element);
	}

	private showMasterCategoryEditDialog(masterCategoryId:string, element:HTMLElement):void {
		// Show the dialog for editing the subcategory
		this.masterCategoryEditDialog.show(masterCategoryId, element);
	}

	private showCreateCategoryDialog(masterCategoryId:string, element:HTMLElement):void {
		// Show the dialog for creating a category
		this.createCategoryDialog.show(masterCategoryId, element);
	}

	private showDefaultSubCategoryActivityDialog(subCategoryId:string, element:HTMLElement):void {
		// Show the dialog for default category activity
		var selectedMonth = this.props.selectedBudgetMonth;
		this.defaultCategoryActivityDialog.show(subCategoryId, selectedMonth, element);
	}

	private showDebtSubCategoryActivityDialog(subCategoryId:string, element:HTMLElement):void {
		// Show the dialog for debt category activity
		var selectedMonth = this.props.selectedBudgetMonth;
		this.debtCategoryActivityDialog.show(subCategoryId, selectedMonth, element);
	}

	private showMasterCategoryActivityDialog(masterCategoryId:string, element:HTMLElement):void {
		// Show the dialog for master category activity
		var selectedMonth = this.props.selectedBudgetMonth;
		this.masterCategoryActivityDialog.show(masterCategoryId, selectedMonth, element);
	}

	private showCoverOverspendingDialog(subCategoryId:string, amountToCover:number, element:HTMLElement, placement:string = "left"):void {
		// Show the dialog for creating a category
		var selectedMonth = this.props.selectedBudgetMonth;
		this.coverOverspendingDialog.show(subCategoryId, selectedMonth, amountToCover, element, placement);
	}

	private showMoveMoneyDialog(subCategoryId:string, amountToMove:number, element:HTMLElement, placement:string = "left"):void {
		// Show the dialog for creating a category
		var selectedMonth = this.props.selectedBudgetMonth;
		this.moveMoneyDialog.show(subCategoryId, selectedMonth, amountToMove, element, placement);
	}

	private showHiddenCategoriesDialog(element:HTMLElement, placement:string = "top"):void {
		// Show the dialog for unhiding any hidden categories
		this.hiddenCategoriesDialog.show(element, placement);
	}

	private getSortedCategoryIdsList():Array<string> {

		var categoryIdsList:Array<string> = [];
		var masterCategoriesArray = this.props.entitiesCollection.masterCategories;
		var subCategoriesArray = this.props.entitiesCollection.subCategories;

		var debtPaymentMasterCategory = masterCategoriesArray.getDebtPaymentMasterCategory();
		var subCategories = subCategoriesArray.getVisibleNonTombstonedSubCategoriesForMasterCategory(debtPaymentMasterCategory.entityId);
		_.forEach(subCategories, (subCategory)=>{
			categoryIdsList.push(subCategory.entityId);
		});

		var masterCategories = masterCategoriesArray.getVisibleNonTombstonedMasterCategories();
		_.forEach(masterCategories, (masterCategory)=>{
			var subCategories = subCategoriesArray.getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategory.entityId);
			_.forEach(subCategories, (subCategory)=>{
				categoryIdsList.push(subCategory.entityId);
			});
		});

		return categoryIdsList;
	}
  	// *******************************************************************************************************
	// Action Handlers for commands in the Budget Toolbar
	// *******************************************************************************************************
	private onAddCategoryGroupSelected(element:HTMLElement):void {
		this.showCreateCategoryDialog(null, element);
	}

	// *******************************************************************************************************
	// *******************************************************************************************************
	public componentWillReceiveProps(nextProps:PBudgetProps):void {

		// If the dataFormat in the active budget has changed, then recreate the dataFormatter.
		var activeBudgetId = nextProps.activeBudgetId;
		if(activeBudgetId && nextProps.entitiesCollection.budgets) {

			var activeBudget = nextProps.entitiesCollection.budgets.getEntityById(activeBudgetId);
			if(activeBudget && activeBudget.dataFormat != this.state.dataFormat) {
				var dataFormat = JSON.parse(activeBudget.dataFormat) as IDataFormat;
				var dataFormatter = new DataFormatter(dataFormat);

				var state = Object.assign({}, this.state) as PBudgetState;
				state.dataFormat = activeBudget.dataFormat;
				state.dataFormatter = dataFormatter;
				this.setState(state);
			}
		}
	} 

	public render() {

		if(!this.props.entitiesCollection.budgets || this.props.entitiesCollection.budgets.length == 0)
			return <div />;
			
		var selectedMonth = this.props.selectedBudgetMonth;
		var currentBudget = this.props.entitiesCollection.budgets.getEntityById(this.props.activeBudgetId);

    	return (
			<div style={BudgetContainerStyle}>
				<PBudgetHeader 
					currentMonth={selectedMonth} 
					currentBudget={currentBudget}
					dataFormatter={this.state.dataFormatter}
					entitiesCollection={this.props.entitiesCollection}
					setSelectedMonth={this.setSelectedMonth}
					showCoverOverspendingDialog={this.showCoverOverspendingDialog}
					showMoveMoneyDialog={this.showMoveMoneyDialog}
					updateEntities={this.props.updateEntities} />

				<PBudgetToolbar onAddCategoryGroupSelected={this.onAddCategoryGroupSelected} />

				<div style={BudgetSubContainerStyle}>
					<PMonthlyBudget 
						dataFormatter={this.state.dataFormatter}
						currentMonth={selectedMonth} 
						entitiesCollection={this.props.entitiesCollection} 
						updateEntities={this.props.updateEntities} 
						editingSubCategory={this.state.editingSubCategory}
						selectedSubCategories={this.state.selectedSubCategories}
						selectedSubCategoriesMap={this.state.selectedSubCategoriesMap}
						selectedMasterCategoriesMap={this.state.selectedMasterCategoriesMap}
						selectSubCategory={this.selectSubCategory}
						unselectSubCategory={this.unselectSubCategory}
						selectMasterCategory={this.selectMasterCategory}
						unselectMasterCategory={this.unselectMasterCategory}
						selectSubCategoryForEditing={this.selectSubCategoryForEditing}
						selectNextSubCategoryForEditing={this.selectNextSubCategoryForEditing}
						selectPreviousSubCategoryForEditing={this.selectPreviousSubCategoryForEditing}
						showCreateCategoryDialog={this.showCreateCategoryDialog}
						showSubCategoryEditDialog={this.showSubCategoryEditDialog}
						showMasterCategoryEditDialog={this.showMasterCategoryEditDialog}
						showCoverOverspendingDialog={this.showCoverOverspendingDialog}
						showMoveMoneyDialog={this.showMoveMoneyDialog}
						showHiddenCategoriesDialog={this.showHiddenCategoriesDialog}
						showDefaultSubCategoryActivityDialog={this.showDefaultSubCategoryActivityDialog}
						showDebtSubCategoryActivityDialog={this.showDebtSubCategoryActivityDialog}
						showMasterCategoryActivityDialog={this.showMasterCategoryActivityDialog}
					/>
					<PInspectorContainer 
						dataFormatter={this.state.dataFormatter}
						currentMonth={selectedMonth}
						selectedSubCategories={this.state.selectedSubCategories}
						entitiesCollection={this.props.entitiesCollection} 
						updateEntities={this.props.updateEntities}
					/>
				</div>

				<dialogs.PCreateCategoryDialog 
					ref={(d)=> this.createCategoryDialog = d} 
					entitiesCollection={this.props.entitiesCollection}
					updateEntities={this.props.updateEntities}
				/>

				<dialogs.PSubCategoryEditDialog 
					ref={(d)=> this.subCategoryEditDialog = d} 
					entitiesCollection={this.props.entitiesCollection}
					updateEntities={this.props.updateEntities}
				/>

				<dialogs.PMasterCategoryEditDialog 
					ref={(d)=> this.masterCategoryEditDialog = d} 
					entitiesCollection={this.props.entitiesCollection}
					updateEntities={this.props.updateEntities}
				/>

				<dialogs.PMoveMoneyDialog 
					ref={(d)=> this.moveMoneyDialog = d}
					dataFormatter={this.state.dataFormatter} 
					entitiesCollection={this.props.entitiesCollection}
					updateEntities={this.props.updateEntities}
				/>

				<dialogs.PCoverOverspendingDialog 
					ref={(d)=> this.coverOverspendingDialog = d} 
					dataFormatter={this.state.dataFormatter}
					entitiesCollection={this.props.entitiesCollection}
					updateEntities={this.props.updateEntities}
				/>

				<dialogs.PHiddenCategoriesDialog 
					ref={(d)=> this.hiddenCategoriesDialog = d} 
					entitiesCollection={this.props.entitiesCollection}
					updateEntities={this.props.updateEntities}
				/>

				<dialogs.PDefaultCategoryActivityDialog 
					ref={(d)=> this.defaultCategoryActivityDialog = d} 
					dataFormatter={this.state.dataFormatter}
					entitiesCollection={this.props.entitiesCollection}
				/>

				<dialogs.PDebtCategoryActivityDialog 
					ref={(d)=> this.debtCategoryActivityDialog = d} 
					dataFormatter={this.state.dataFormatter}
					entitiesCollection={this.props.entitiesCollection}
				/>

				<dialogs.PMasterCategoryActivityDialog 
					ref={(d)=> this.masterCategoryActivityDialog = d} 
					dataFormatter={this.state.dataFormatter}
					entitiesCollection={this.props.entitiesCollection}
				/>
			</div>
		);
  	}
}