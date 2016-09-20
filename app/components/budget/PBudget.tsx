/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PBudgetHeader } from './header/PBudgetHeader';
import { PBudgetToolbar } from './toolbar/PBudgetToolbar';
import { PMonthlyBudget } from './monthlyBudget/PMonthlyBudget';
import { PInspectorContainer } from './inspectors/PInspectorContainer';

import { DateWithoutTime, SimpleObjectMap } from '../../utilities';
import * as budgetEntities from '../../interfaces/budgetEntities';
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
  
	constructor(props: any) {
        super(props);
		this.selectSubCategory = this.selectSubCategory.bind(this);
		this.unselectSubCategory = this.unselectSubCategory.bind(this);
		this.onAddTransactionSelected = this.onAddTransactionSelected.bind(this);
		this.onAddCategoryGroupSelected = this.onAddCategoryGroupSelected.bind(this);

		this.state = {
			selectedMonth: DateWithoutTime.createForCurrentMonth(),
			selectedSubCategories: [],
			selectedSubCategoriesMap: {}
		}
    }

	private selectSubCategory(subCategoryId:string, unselectAllOthers:boolean):void {

		var state = _.assign({}, this.state) as PBudgetState;
		if(unselectAllOthers) {
			state.selectedSubCategories = [];
			state.selectedSubCategoriesMap = {};
		}

		// Mark the passed subCategoryId as selected
		state.selectedSubCategories.push(subCategoryId);
		state.selectedSubCategoriesMap[subCategoryId] = true;
		this.setState(state);
	}

	private unselectSubCategory(subCategoryId:string):void {

		var state = _.assign({}, this.state) as PBudgetState;
		// Mark the passed subCategoryId as unselected
		var index = _.findIndex(state.selectedSubCategories, subCategoryId);
		state.selectedSubCategories.splice(index, 1);
		state.selectedSubCategoriesMap[subCategoryId] = false;
		this.setState(state);
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
						selectSubCategory={this.selectSubCategory}
						unselectSubCategory={this.unselectSubCategory}
					/>
					<PInspectorContainer />
				</div>
			</div>
		);
  	}
}