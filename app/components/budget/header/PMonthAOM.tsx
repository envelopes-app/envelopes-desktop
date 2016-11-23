/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection } from '../../../interfaces/state';

export interface PMonthAOMProps {
	currentMonth:DateWithoutTime;
	entitiesCollection:IEntitiesCollection;
}

export interface PMonthAOMState { }

const MonthAOMContainerStyle:React.CSSProperties = {
	flex: '0 0 auto',
	backgroundColor: 'transparent',
	paddingLeft: '5px',
	paddingRight: '5px'
}

const MonthAOMInnerContainerStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'column nowrap',
	alignItems: 'center',
	backgroundColor: 'transparent',
	paddingLeft: '5px',
	paddingRight: '5px'
}

const AOMNumberStyle:React.CSSProperties = {
	color: '#4E7C8C',
	fontSize: '28px',
	fontWeight: 'normal',
	margin: '0px'
}

const AOMLabelStyle:React.CSSProperties = {
	color: '#FFFFFF',
	fontSize: '12px',
	fontWeight: 'normal',
	fontStyle: 'italic'
}

export class PMonthAOM extends React.Component<PMonthAOMProps, PMonthAOMState> {

	public render() {

		var entitiesCollection = this.props.entitiesCollection;
		/* Hiding AOM for now.
		if(entitiesCollection && entitiesCollection.monthlyBudgets) {

			var currentMonth = this.props.currentMonth;
			var monthlyBudget = entitiesCollection.monthlyBudgets.getMonthlyBudgetByMonth(currentMonth.toISOString());
			var aomValue = monthlyBudget.ageOfMoney ? '' + monthlyBudget.ageOfMoney : "???";

			return (
				<div style={MonthAOMContainerStyle}>
					<div style={MonthAOMInnerContainerStyle}>
						<label style={AOMNumberStyle}>{aomValue}</label>
						<label style={AOMLabelStyle}>Age of Money</label>
					</div>
				</div>
			);
		}
		else */
		return <div/>;
	}
}