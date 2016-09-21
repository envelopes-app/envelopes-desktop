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
import { DateWithoutTime, SimpleObjectMap } from '../../utilities';
import { IApplicationState, ISimpleEntitiesCollection, IBudgetState } from '../../interfaces/state';

export interface PBudgetProps {
	// State Variables
	applicationState: IApplicationState;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PBudgetState {
	selectedMonth:DateWithoutTime;
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
  
	private subCategoryEditDialog:dialogs.PSubCategoryEditDialog;
	private masterCategoryEditDialog:dialogs.PMasterCategoryEditDialog;

	constructor(props: any) {
        super(props);
		this.selectSubCategory = this.selectSubCategory.bind(this);
		this.unselectSubCategory = this.unselectSubCategory.bind(this);
		this.selectMasterCategory = this.selectMasterCategory.bind(this);
		this.unselectMasterCategory = this.unselectMasterCategory.bind(this);
		this.showSubCategoryEditDialog = this.showSubCategoryEditDialog.bind(this);
		this.showMasterCategoryEditDialog = this.showMasterCategoryEditDialog.bind(this);
		
		this.showSubCategoryActivityDialog = this.showSubCategoryActivityDialog.bind(this);
		this.showMasterCategoryActivityDialog = this.showMasterCategoryActivityDialog.bind(this);
		this.showCoverOverspendingDialog = this.showCoverOverspendingDialog.bind(this);
		this.showMoveMoneyDialog = this.showMoveMoneyDialog.bind(this);
		this.showHiddenCategoriesDialog = this.showHiddenCategoriesDialog.bind(this);

		this.onAddTransactionSelected = this.onAddTransactionSelected.bind(this);
		this.onAddCategoryGroupSelected = this.onAddCategoryGroupSelected.bind(this);

		this.state = {
			selectedMonth: DateWithoutTime.createForCurrentMonth(),
			selectedSubCategories: [],
			selectedSubCategoriesMap: {},
			selectedMasterCategoriesMap: {}
		}
    }

  	// *******************************************************************************************************
	// Handlers for commands initiated from the budget rows
	// *******************************************************************************************************
	private selectSubCategory(subCategory:budgetEntities.ISubCategory, unselectAllOthers:boolean):void {

		debugger;
		var state = _.assign({}, this.state) as PBudgetState;
		if(unselectAllOthers) {
			state.selectedSubCategories = [];
			state.selectedSubCategoriesMap = {};
			state.selectedMasterCategoriesMap = {};
		}

		// Mark the passed subCategoryId as selected
		state.selectedSubCategories.push(subCategory.entityId);
		state.selectedSubCategoriesMap[subCategory.entityId] = true;
		// Check if the master category for this subcategory needs to be selected
		state.selectedMasterCategoriesMap[subCategory.masterCategoryId] = this.shouldMasterCategorybeSelected(subCategory.masterCategoryId);
		this.setState(state);
	}

	private unselectSubCategory(subCategory:budgetEntities.ISubCategory):void {

		var state = _.assign({}, this.state) as PBudgetState;
		// Mark the passed subCategoryId as unselected
		var index = _.findIndex(state.selectedSubCategories, subCategory.entityId);
		state.selectedSubCategories.splice(index, 1);
		state.selectedSubCategoriesMap[subCategory.entityId] = false;
		// Since we are unselecting the subcategory, it's master category, if selected, would also ne unselected
		state.selectedMasterCategoriesMap[subCategory.masterCategoryId] = false;
		this.setState(state);
	}

	private shouldMasterCategorybeSelected(masterCategoryId:string):boolean {

		var allSelected:boolean = true;
		// Get all the subcategories for this master category and check if they are all selected
		var subCategoriesArray = this.props.applicationState.entitiesCollection.subCategories;
		var subCategories = subCategoriesArray.getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategoryId);
		// Check if all these subCategories are selected
		_.forEach(subCategories, (subCategory)=>{
			if(!this.state.selectedSubCategoriesMap[subCategory.entityId])
				allSelected = false;
		});

		return allSelected;
	}

	private selectMasterCategory(masterCategory:budgetEntities.IMasterCategory, unselectAllOthers:boolean):void {

		debugger;
		var state = _.assign({}, this.state) as PBudgetState;
		if(unselectAllOthers) {
			state.selectedSubCategories = [];
			state.selectedSubCategoriesMap = {};
			state.selectedMasterCategoriesMap = {};
		}

		// Get all the subcategories for this master category and set them as selected
		var subCategoriesArray = this.props.applicationState.entitiesCollection.subCategories;
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

		debugger;
		var state = _.assign({}, this.state) as PBudgetState;
		// Get all the subcategories for this master category and set them as unselected
		var subCategoriesArray = this.props.applicationState.entitiesCollection.subCategories;
		var subCategories = subCategoriesArray.getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategory.entityId);
		// Mark all these subCategories as unselected
		_.forEach(subCategories, (subCategory)=>{
			var index = _.findIndex(state.selectedSubCategories, subCategory.entityId);
			state.selectedSubCategories.splice(index, 1);
			state.selectedSubCategoriesMap[subCategory.entityId] = false;
		});
		// Mark the master category as unselected
		state.selectedMasterCategoriesMap[masterCategory.entityId] = false;
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

	private showSubCategoryActivityDialog(subCategoryId:string):void {

	}

	private showMasterCategoryActivityDialog(masterCategoryId:string):void {

	}

	private showCoverOverspendingDialog(subCategoryId:string):void {

	}

	private showMoveMoneyDialog(subCategoryId:string):void {

	}

	private showHiddenCategoriesDialog():void {
		
	}
  	// *******************************************************************************************************
	// Action Handlers for commands in the Regsiter Toolbar
	// *******************************************************************************************************
	private onAddTransactionSelected():void {

	}

	private onAddCategoryGroupSelected():void {

	}

	// *******************************************************************************************************
	// *******************************************************************************************************
	public render() {

    	return (
			<div style={BudgetContainerStyle}>
				<PBudgetHeader />
				<PBudgetToolbar onAddTransactionSelected={this.onAddTransactionSelected} onAddCategoryGroupSelected={this.onAddCategoryGroupSelected} />
				<div style={BudgetSubContainerStyle}>
					<PMonthlyBudget 
						currentMonth={this.state.selectedMonth} 
						entitiesCollection={this.props.applicationState.entitiesCollection} 
						updateEntities={this.props.updateEntities} 
						selectedSubCategories={this.state.selectedSubCategories}
						selectedSubCategoriesMap={this.state.selectedSubCategoriesMap}
						selectedMasterCategoriesMap={this.state.selectedMasterCategoriesMap}
						selectSubCategory={this.selectSubCategory}
						unselectSubCategory={this.unselectSubCategory}
						showSubCategoryEditDialog={this.showSubCategoryEditDialog}
						selectMasterCategory={this.selectMasterCategory}
						unselectMasterCategory={this.unselectMasterCategory}
						showMasterCategoryEditDialog={this.showMasterCategoryEditDialog}
					/>
					<PInspectorContainer />
				</div>

				<dialogs.PSubCategoryEditDialog 
					ref={(d)=> this.subCategoryEditDialog = d} 
					entitiesCollection={this.props.applicationState.entitiesCollection}
					updateEntities={this.props.updateEntities}
				/>

				<dialogs.PMasterCategoryEditDialog 
					ref={(d)=> this.masterCategoryEditDialog = d} 
					entitiesCollection={this.props.applicationState.entitiesCollection}
					updateEntities={this.props.updateEntities}
				/>
			</div>
		);
  	}
}