/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PBudgetHeader } from './header/PBudgetHeader';
import { PBudgetToolbar } from './toolbar/PBudgetToolbar';

import * as budgetEntities from '../../interfaces/budgetEntities';
import { IApplicationState, ISimpleEntitiesCollection, IBudgetState } from '../../interfaces/state';

const BudgetContainerStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	height: '100%',
	width: '100%'
}

const PBudgetItemStyle = {
	flex: "1 0 auto"
}

export interface PBudgetProps {
	// State Variables
	applicationState: IApplicationState;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
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
    	return (
			<div style={BudgetContainerStyle}>
				<PBudgetHeader />
				<PBudgetToolbar onAddTransactionSelected={this.onAddTransactionSelected} onAddCategoryGroupSelected={this.onAddCategoryGroupSelected} />
				<div style={PBudgetItemStyle}>Budget</div>
			</div>
		);
  	}
}