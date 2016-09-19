/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PBudgetHeader } from './header/PBudgetHeader';
import { PBudgetToolbar } from './toolbar/PBudgetToolbar';
import { PMonthlyBudget } from './monthlyBudget/PMonthlyBudget';
import { PInspectorContainer } from './inspectors/PInspectorContainer';

import { DateWithoutTime } from '../../utilities';
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

export class PBudget extends React.Component<PBudgetProps, {}> {
  
	constructor(props: any) {
        super(props);
		this.onAddTransactionSelected = this.onAddTransactionSelected.bind(this);
		this.onAddCategoryGroupSelected = this.onAddCategoryGroupSelected.bind(this);
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

		var currentMonth = DateWithoutTime.createForCurrentMonth();
    	return (
			<div style={BudgetContainerStyle}>
				<PBudgetHeader />
				<PBudgetToolbar onAddTransactionSelected={this.onAddTransactionSelected} onAddCategoryGroupSelected={this.onAddCategoryGroupSelected} />
				<div style={BudgetSubContainerStyle}>
					<PMonthlyBudget currentMonth={currentMonth} entitiesCollection={this.props.applicationState.entitiesCollection} updateEntities={this.props.updateEntities} />
					<PInspectorContainer />
				</div>
			</div>
		);
  	}
}