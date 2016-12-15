/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PMonthSelection } from './PMonthSelection';
import { PMonthSummary } from './PMonthSummary';
import { PMonthAOM } from './PMonthAOM';

import { UIConstants } from '../../../constants';
import { DataFormatter, DateWithoutTime } from '../../../utilities';
import * as catalogEntities from '../../../interfaces/catalogEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PBudgetHeaderProps {
	dataFormatter:DataFormatter;
	currentMonth:DateWithoutTime;
	currentBudget:catalogEntities.IBudget;
	entitiesCollection:IEntitiesCollection;
	inspectorCollapsed:boolean;

	setSelectedMonth:(month:DateWithoutTime)=>void;
	showCoverOverspendingDialog:(subCategoryId:string, amountToCover:number, element:HTMLElement, placement?:string)=>void;
	showMoveMoneyDialog:(subCategoryId:string, amountToMove:number, element:HTMLElement, placement?:string)=>void;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

const BudgetHeaderContainerStyle:React.CSSProperties = {
	flex: '0 0 auto',
	height: '90px',
	width: '100%',
	backgroundColor: '#003540',
	paddingLeft: '5px',
	paddingRight: '5px',
}

const BudgetHeaderStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'space-between',
	alignItems: 'center',
	height: '100%',
	width: '100%',
	paddingRight: '5px'
}

const RightContainerStyle:React.CSSProperties = {
	flex: "0 0 auto",
}

export class PBudgetHeader extends React.Component<PBudgetHeaderProps, {}> {
  
	private getRightContainer():JSX.Element {

		var rightContainerStyle = Object.assign({}, RightContainerStyle, {
			width: this.props.inspectorCollapsed ? UIConstants.InspectorCollapsedWidth : UIConstants.InspectorExpandedWidth
		});

		var rightContainer:JSX.Element;
		if(this.props.inspectorCollapsed) {
			rightContainer = <div style={rightContainerStyle} />;
		}
		else {
			// The container is expanded so we can put the ageOfMoney in it
			rightContainer = (
				<div style={rightContainerStyle}>
					<PMonthAOM 
						currentMonth={this.props.currentMonth} 
						entitiesCollection={this.props.entitiesCollection}
					/>
				</div>
			);
		}

		return rightContainer;
	}

	public render() {

		var rightContainer = this.getRightContainer();

		// Get the first and last months from the budget entity. Min and Max months will
		// be -1 and +1 months from them respectively.
		var minMonth, maxMonth:DateWithoutTime;
		var budgetEntity = this.props.currentBudget;

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
					<PMonthSelection 
						currentMonth={this.props.currentMonth} 
						minMonth={minMonth} maxMonth={maxMonth} 
						setSelectedMonth={this.props.setSelectedMonth} 
					/>

					<div className="spacer" />

					<PMonthSummary 
						dataFormatter={this.props.dataFormatter}
						currentMonth={this.props.currentMonth} 
						entitiesCollection={this.props.entitiesCollection}
						showCoverOverspendingDialog={this.props.showCoverOverspendingDialog}
						showMoveMoneyDialog={this.props.showMoveMoneyDialog}
					/>

					{rightContainer}
				</div>
			</div>
		);
  	}
}