/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PBudgetHeader } from './header/PBudgetHeader';
import { PMonthlyBudget } from './monthlyBudget/PMonthlyBudget';
import { PInspectorContainer } from './inspectors/PInspectorContainer';

import * as dialogs from './dialogs';
import { InternalCategories } from '../../constants';
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
	visibleMonths:number;
	componentWidth:number;
	componentHeight:number;
	editingSubCategoryId:string;
	editingSubCategoryMonth:DateWithoutTime;
	selectedSubCategories:Array<string>;
	selectedSubCategoriesMap:SimpleObjectMap<boolean>;
	selectedMasterCategoriesMap:SimpleObjectMap<boolean>;
	collapsedMasterCategoriesMap:SimpleObjectMap<boolean>;
	inspectorCollapsed:boolean;
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
	overflowX: 'auto',
	overflowY: "hidden"
}

export class PBudget extends React.Component<PBudgetProps, PBudgetState> {
  
	private budgetContainer:HTMLDivElement;
	private monthlyBudget:PMonthlyBudget;

	// TODO: Activity column numbers should be disabled when there are is no activity

	private createCategoryDialog:dialogs.PCreateCategoryDialog;
	private subCategoryEditDialog:dialogs.PSubCategoryEditDialog;
	private masterCategoryEditDialog:dialogs.PMasterCategoryEditDialog;
	private moveMoneyDialog:dialogs.PMoveMoneyDialog;
	private coverOverspendingDialog:dialogs.PCoverOverspendingDialog;
	private hiddenCategoriesDialog:dialogs.PHiddenCategoriesDialog;
	private defaultCategoryActivityDialog:dialogs.PDefaultCategoryActivityDialog;
	private debtCategoryActivityDialog:dialogs.PDebtCategoryActivityDialog;
	private masterCategoryActivityDialog:dialogs.PMasterCategoryActivityDialog;
	private upcomingTransactionsDialog:dialogs.PUpcomingTransactionsDialog;
	private reorderCategoriesDialog:dialogs.PReorderCategoriesDialog;

	constructor(props:PBudgetProps) {
        super(props);
		this.handleWindowResize = this.handleWindowResize.bind(this);
		this.setSelectedMonth = this.setSelectedMonth.bind(this); 
		this.selectAllCategories = this.selectAllCategories.bind(this);
		this.unselectAllCategories = this.unselectAllCategories.bind(this);
		this.selectSubCategory = this.selectSubCategory.bind(this);
		this.unselectSubCategory = this.unselectSubCategory.bind(this);
		this.selectMasterCategory = this.selectMasterCategory.bind(this);
		this.unselectMasterCategory = this.unselectMasterCategory.bind(this);
		this.selectSubCategoryForEditing = this.selectSubCategoryForEditing.bind(this);
		this.selectNextSubCategoryForEditing = this.selectNextSubCategoryForEditing.bind(this);
		this.selectPreviousSubCategoryForEditing = this.selectPreviousSubCategoryForEditing.bind(this);
		this.expandMasterCategory = this.expandMasterCategory.bind(this);
		this.collapseMasterCategory = this.collapseMasterCategory.bind(this);
		this.expandAllMasterCategories = this.expandAllMasterCategories.bind(this);
		this.collapseAllMasterCategories = this.collapseAllMasterCategories.bind(this);
		this.setInspectorState = this.setInspectorState.bind(this);
		this.showSubCategoryEditDialog = this.showSubCategoryEditDialog.bind(this);
		this.showMasterCategoryEditDialog = this.showMasterCategoryEditDialog.bind(this);
		this.showCreateCategoryDialog = this.showCreateCategoryDialog.bind(this);
		this.showCoverOverspendingDialog = this.showCoverOverspendingDialog.bind(this);
		this.showMoveMoneyDialog = this.showMoveMoneyDialog.bind(this);
		this.showHiddenCategoriesDialog = this.showHiddenCategoriesDialog.bind(this);
		this.showDefaultSubCategoryActivityDialog = this.showDefaultSubCategoryActivityDialog.bind(this);
		this.showDebtSubCategoryActivityDialog = this.showDebtSubCategoryActivityDialog.bind(this);
		this.showMasterCategoryActivityDialog = this.showMasterCategoryActivityDialog.bind(this);
		this.showUpcomingTransactionsDialog = this.showUpcomingTransactionsDialog.bind(this);
		this.showReorderCategoriesDialog = this.showReorderCategoriesDialog.bind(this);
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
			visibleMonths: 1,
			componentWidth: 0, 
			componentHeight: 0, 
			editingSubCategoryId: null,
			editingSubCategoryMonth: null,
			selectedSubCategories: [],
			selectedSubCategoriesMap: {},
			selectedMasterCategoriesMap: {},
			collapsedMasterCategoriesMap: {},
			inspectorCollapsed: false
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
	private selectSubCategory(subCategory:budgetEntities.ISubCategory, month:DateWithoutTime, unselectAllOthers:boolean, setAsEditing:boolean):void {

		var state = Object.assign({}, this.state) as PBudgetState;
		if(unselectAllOthers) {
			state.selectedSubCategories = [];
			state.selectedSubCategoriesMap = {};
			state.selectedMasterCategoriesMap = {};

			if(setAsEditing) {

				state.editingSubCategoryId = subCategory.entityId;
				state.editingSubCategoryMonth = month.clone();
			}
			else {

				state.editingSubCategoryId = null;
				state.editingSubCategoryMonth = null;
			}
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
		state.editingSubCategoryId = null;
		state.editingSubCategoryMonth = null;
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

	private selectAllCategories():void {

		var state = Object.assign({}, this.state) as PBudgetState;
		state.editingSubCategoryId = null;
		state.editingSubCategoryMonth = null;
		state.selectedSubCategories = [];
		state.selectedSubCategoriesMap = {};
		state.selectedMasterCategoriesMap = {};

		_.forEach(this.props.entitiesCollection.masterCategories.getAllItems(), (masterCategory)=>{
			if(masterCategory.isTombstone == 0 && masterCategory.isHidden == 0 && 
				(!masterCategory.internalName || masterCategory.internalName == InternalCategories.DebtPaymentMasterCategory)
			) {
				state.selectedMasterCategoriesMap[masterCategory.entityId] = true;
			}
		});

		_.forEach(this.props.entitiesCollection.subCategories.getAllItems(), (subCategory)=>{
			if(subCategory.isTombstone == 0 && subCategory.isHidden == 0 && 
				!subCategory.internalName &&
				state.selectedMasterCategoriesMap[subCategory.masterCategoryId] == true
			) {
				state.selectedSubCategories.push(subCategory.entityId);
				state.selectedSubCategoriesMap[subCategory.entityId] = true;
			}
		});

		this.setState(state);
	}

	private unselectAllCategories():void {

		var state = Object.assign({}, this.state) as PBudgetState;
		state.editingSubCategoryId = null;
		state.editingSubCategoryMonth = null;
		state.selectedSubCategories = [];
		state.selectedSubCategoriesMap = {};
		state.selectedMasterCategoriesMap = {};
		this.setState(state);
	}

	private selectMasterCategory(masterCategory:budgetEntities.IMasterCategory, unselectAllOthers:boolean):void {

		var state = Object.assign({}, this.state) as PBudgetState;
		if(unselectAllOthers) {
			state.editingSubCategoryId = null;
			state.editingSubCategoryMonth = null;
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
			state.editingSubCategoryId = null;
			state.editingSubCategoryMonth = null;
			state.selectedSubCategories.splice(index, 1);
			state.selectedSubCategoriesMap[subCategory.entityId] = false;
		});
		// Mark the master category as unselected
		state.selectedMasterCategoriesMap[masterCategory.entityId] = false;
		this.setState(state);
	}

	private selectSubCategoryForEditing(subCategory:budgetEntities.ISubCategory, month:DateWithoutTime):void {

		var subCategoryId = subCategory.entityId;
		var state = Object.assign({}, this.state) as PBudgetState;
		state.editingSubCategoryId = subCategoryId;
		state.editingSubCategoryMonth = month.clone();
		state.selectedSubCategories = [subCategoryId];
		state.selectedSubCategoriesMap = {};
		state.selectedSubCategoriesMap[subCategoryId] = true;
		state.selectedMasterCategoriesMap = {};
		this.setState(state);
	}

	private selectNextSubCategoryForEditing():void {

		var state = Object.assign({}, this.state) as PBudgetState;
		// Get the sorted list of subcategories
		var subCategoryIds = this.getSortedCategoryIdsList();
		// If we don't currently have a subcategory being edited, then set the first category
		// from the list to be the one being edited
		if(!state.editingSubCategoryId)
			state.editingSubCategoryId = subCategoryIds[0];
		else {
			// Find the index of the subcategory currently being edited
			var index = _.indexOf(subCategoryIds, state.editingSubCategoryId);
			// if the index is for the last item in the list, then set it to zero.
			// Otherwise increment it to point to next subcategory
			if(index == subCategoryIds.length - 1)
				index = 0;
			else
				index++;

			var subCategoryId = subCategoryIds[index];
			state.editingSubCategoryId = subCategoryId;
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
		if(!state.editingSubCategoryId)
			state.editingSubCategoryId = subCategoryIds[0];
		else {
			// Find the index of the subcategory currently being edited
			var index = _.indexOf(subCategoryIds, state.editingSubCategoryId);
			// if the index is for the first item in the list, then set it to the last item.
			// Otherwise decrement it to point to previous subcategory
			if(index == 0)
				index = subCategoryIds.length - 1;
			else
				index--;

			var subCategoryId = subCategoryIds[index];
			state.editingSubCategoryId = subCategoryId;
			state.selectedSubCategories = [subCategoryId];
			state.selectedSubCategoriesMap = {};
			state.selectedSubCategoriesMap[subCategoryId] = true;
			state.selectedMasterCategoriesMap = {};
		}

		this.setState(state);
	}

	private expandAllMasterCategories():void {

		var state = Object.assign({}, this.state) as PBudgetState;
		_.forEach(this.props.entitiesCollection.masterCategories.getAllItems(), (masterCategory)=>{

			if(masterCategory.isTombstone == 0 && masterCategory.isHidden == 0 && 
				(!masterCategory.internalName || masterCategory.internalName == InternalCategories.DebtPaymentMasterCategory)
			) {
				state.collapsedMasterCategoriesMap[masterCategory.entityId] = false;
			}
		});

		this.setState(state);
	}

	private collapseAllMasterCategories():void {

		var state = Object.assign({}, this.state) as PBudgetState;
		_.forEach(this.props.entitiesCollection.masterCategories.getAllItems(), (masterCategory)=>{

			if(masterCategory.isTombstone == 0 && masterCategory.isHidden == 0 && 
				(!masterCategory.internalName || masterCategory.internalName == InternalCategories.DebtPaymentMasterCategory)
			) {
				state.collapsedMasterCategoriesMap[masterCategory.entityId] = true;
			}
		});

		this.setState(state);
	}

	private expandMasterCategory(masterCategoryId:string):void {

		var state = Object.assign({}, this.state) as PBudgetState;
		state.collapsedMasterCategoriesMap[masterCategoryId] = false;
		this.setState(state);
	}

	private collapseMasterCategory(masterCategoryId:string):void {

		var state = Object.assign({}, this.state) as PBudgetState;
		state.collapsedMasterCategoriesMap[masterCategoryId] = true;
		this.setState(state);
	}

	private setInspectorState(collapsed:boolean):void {
		
		var state = Object.assign({}, this.state) as PBudgetState;
		state.inspectorCollapsed = collapsed;
		this.setState(state);
	}

	private showSubCategoryEditDialog(subCategoryId:string, element:HTMLElement, placement:string = "bottom"):void {
		// Show the dialog for editing the subcategory
		this.subCategoryEditDialog.show(subCategoryId, element, placement);
	}

	private showMasterCategoryEditDialog(masterCategoryId:string, element:HTMLElement, placement:string = "bottom"):void {
		// Show the dialog for editing the subcategory
		this.masterCategoryEditDialog.show(masterCategoryId, element, placement);
	}

	private showCreateCategoryDialog(masterCategoryId:string, element:HTMLElement, placement:string = "bottom"):void {
		// Show the dialog for creating a category
		this.createCategoryDialog.show(masterCategoryId, element, placement);
	}

	private showDefaultSubCategoryActivityDialog(subCategoryId:string, month:DateWithoutTime, element:HTMLElement, placement:string = "bottom"):void {
		// Show the dialog for default category activity
		this.defaultCategoryActivityDialog.show(subCategoryId, month, element, placement);
	}

	private showDebtSubCategoryActivityDialog(subCategoryId:string, month:DateWithoutTime, element:HTMLElement, placement:string = "bottom"):void {
		// Show the dialog for debt category activity
		this.debtCategoryActivityDialog.show(subCategoryId, month, element, placement);
	}

	private showMasterCategoryActivityDialog(masterCategoryId:string, month:DateWithoutTime, element:HTMLElement, placement:string = "bottom"):void {
		// Show the dialog for master category activity
		this.masterCategoryActivityDialog.show(masterCategoryId, month, element, placement);
	}

	private showCoverOverspendingDialog(subCategoryId:string, month:DateWithoutTime, amountToCover:number, element:HTMLElement, placement:string = "left"):void {
		// Show the cover overspending dialog for subcategory
		this.coverOverspendingDialog.show(subCategoryId, month, amountToCover, element, placement);
	}

	private showMoveMoneyDialog(subCategoryId:string, month:DateWithoutTime, amountToMove:number, element:HTMLElement, placement:string = "left"):void {
		// Show the move money dialog for subcategory
		this.moveMoneyDialog.show(subCategoryId, month, amountToMove, element, placement);
	}

	private showHiddenCategoriesDialog(element:HTMLElement, placement:string = "top"):void {
		// Show the dialog for unhiding any hidden categories
		this.hiddenCategoriesDialog.show(element, placement);
	}

	private showUpcomingTransactionsDialog(monthlySubCategoryBudgetId:string, element:HTMLElement, placement:string = "left"):void {
		// Show the dialog for upcoming transactions
		this.upcomingTransactionsDialog.show(monthlySubCategoryBudgetId, element, placement);
	}

	private showReorderCategoriesDialog():void {

		if(this.reorderCategoriesDialog.isShowing() == false) {
			this.reorderCategoriesDialog.show();
		}
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

	private calculateVisibleMonths():void {

		var visibleMonths = 1;
		if(this.monthlyBudget)
			visibleMonths = this.monthlyBudget.calculateVisibleMonths();

		if(visibleMonths != this.state.visibleMonths) {
			// Update the visibleMonths value in the state
			var state = Object.assign({}, this.state);
			state.visibleMonths = visibleMonths;
			this.setState(state);
		}
	}
	
  	// *******************************************************************************************************
	// Action Handlers for commands in the Budget Toolbar
	// *******************************************************************************************************
	private onAddCategoryGroupSelected(element:HTMLElement):void {
		this.showCreateCategoryDialog(null, element);
	}

	// *******************************************************************************************************
	// *******************************************************************************************************
	public componentDidMount() {
		window.addEventListener("resize", this.handleWindowResize);
		this.updateComponentDimensions();
	}

	public componentWillUnmount() {
		window.removeEventListener("resize", this.handleWindowResize);
	}

	private handleWindowResize():void {
		this.updateComponentDimensions();
	}

	public updateComponentDimensions() {

		var state = Object.assign({}, this.state) as PBudgetState;
		var div = ReactDOM.findDOMNode(this.budgetContainer);
		state.componentWidth = div.clientWidth;
		state.componentHeight = div.clientHeight;
		this.setState(state);
	}

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

	public componentDidUpdate() {

		this.calculateVisibleMonths();
	}

	public render() {

		if(!this.props.entitiesCollection.budgets || this.props.entitiesCollection.budgets.length == 0)
			return <div ref={(d)=> this.budgetContainer = d} style={BudgetContainerStyle} />;
			
		var selectedMonth = this.props.selectedBudgetMonth;
		var currentBudget = this.props.entitiesCollection.budgets.getEntityById(this.props.activeBudgetId);

    	return (
			<div ref={(d)=> this.budgetContainer = d} style={BudgetContainerStyle}>
				<PBudgetHeader 
					visibleMonths={this.state.visibleMonths}
					currentMonth={selectedMonth} 
					currentBudget={currentBudget}
					dataFormatter={this.state.dataFormatter}
					inspectorCollapsed={this.state.inspectorCollapsed}
					entitiesCollection={this.props.entitiesCollection}
					setSelectedMonth={this.setSelectedMonth} />

				<div style={BudgetSubContainerStyle}>
					<PMonthlyBudget 
						ref={(d)=> this.monthlyBudget = d}
						dataFormatter={this.state.dataFormatter}
						containerHeight={this.state.componentHeight}
						containerWidth={this.state.componentWidth}
						visibleMonths={this.state.visibleMonths}
						currentMonth={selectedMonth} 
						entitiesCollection={this.props.entitiesCollection} 
						updateEntities={this.props.updateEntities} 
						editingSubCategoryId={this.state.editingSubCategoryId}
						editingSubCategoryMonth={this.state.editingSubCategoryMonth}
						selectedSubCategoriesMap={this.state.selectedSubCategoriesMap}
						selectedMasterCategoriesMap={this.state.selectedMasterCategoriesMap}
						collapsedMasterCategoriesMap={this.state.collapsedMasterCategoriesMap}
						selectAllCategories={this.selectAllCategories}
						unselectAllCategories={this.unselectAllCategories}
						selectSubCategory={this.selectSubCategory}
						unselectSubCategory={this.unselectSubCategory}
						selectMasterCategory={this.selectMasterCategory}
						unselectMasterCategory={this.unselectMasterCategory}
						selectSubCategoryForEditing={this.selectSubCategoryForEditing}
						selectNextSubCategoryForEditing={this.selectNextSubCategoryForEditing}
						selectPreviousSubCategoryForEditing={this.selectPreviousSubCategoryForEditing}
						expandAllMasterCategories={this.expandAllMasterCategories}
						collapseAllMasterCategories={this.collapseAllMasterCategories}
						onAddCategoryGroupSelected={this.onAddCategoryGroupSelected} 
						showReorderCategoriesDialog={this.showReorderCategoriesDialog}
						expandMasterCategory={this.expandMasterCategory}
						collapseMasterCategory={this.collapseMasterCategory}
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
						inspectorCollapsed={this.state.inspectorCollapsed}
						entitiesCollection={this.props.entitiesCollection} 
						setInspectorState={this.setInspectorState}
						showUpcomingTransactionsDialog={this.showUpcomingTransactionsDialog}
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

				<dialogs.PUpcomingTransactionsDialog 
					ref={(d)=> this.upcomingTransactionsDialog = d} 
					dataFormatter={this.state.dataFormatter}
					entitiesCollection={this.props.entitiesCollection}
				/>

				<dialogs.PReorderCategoriesDialog 
					ref={(d)=> this.reorderCategoriesDialog = d} 
					entitiesCollection={this.props.entitiesCollection}
					updateEntities={this.props.updateEntities}
				/>
			</div>
		);
  	}
}