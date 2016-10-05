/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PMonthSelection } from './PMonthSelection';
import { DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PBudgetHeaderProps {
	currentMonth:DateWithoutTime;
	entitiesCollection:IEntitiesCollection;

	setSelectedMonth:(month:DateWithoutTime)=>void;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

const BudgetHeaderContainerStyle = {
	flex: '0 0 auto',
	height: '90px',
	width: '100%',
	backgroundColor: '#003540',
	paddingLeft: '5px',
	paddingRight: '5px'
}

const BudgetHeaderStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '100%',
	width: '100%',
	paddingRight: '5px'
}

const SymbolStyle = {
	color: '#588697',
	padding: '10px',
	fontSize: '16px',
	fontWeight: 'bold'
}
const BlankSpaceStyle = {
	flex: '1 1 auto'
}

export class PBudgetHeader extends React.Component<PBudgetHeaderProps, {}> {
  
	public render() {

		// Get the first and last months from the budget entity. Min and Max months will
		// be -1 and +1 months from them respectively.
		var minMonth, maxMonth:DateWithoutTime;
		var budgetEntity = this.props.entitiesCollection.budget;

		if(budgetEntity && budgetEntity.firstMonth)
			minMonth = DateWithoutTime.createFromISOString(budgetEntity.firstMonth).subtractMonths(1);
		else 
			minMonth = DateWithoutTime.createForCurrentMonth().subtractMonths(1);
		
		if(budgetEntity && budgetEntity.lastMonth)
			maxMonth = DateWithoutTime.createFromISOString(budgetEntity.lastMonth).addMonths(1);
		else 
			maxMonth = DateWithoutTime.createForCurrentMonth().addMonths(1);

    	return (
			<div style={BudgetHeaderContainerStyle}>
				<div style={BudgetHeaderStyle}>
					<PMonthSelection currentMonth={this.props.currentMonth} 
						minMonth={minMonth} maxMonth={maxMonth} 
						setSelectedMonth={this.props.setSelectedMonth} 
					/>
					<div style={BlankSpaceStyle} />
				</div>
			</div>
		);
  	}
}