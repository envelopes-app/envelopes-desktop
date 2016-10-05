/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection } from '../../../interfaces/state';

export interface PMonthSummaryProps {
	currentMonth:DateWithoutTime;
	entitiesCollection:IEntitiesCollection;
}

export interface PMonthSummaryState { }

const MonthSummaryContainerStyle = {
	flex: '0 0 auto',
	backgroundColor: 'transparent',
	paddingLeft: '5px',
	paddingRight: '5px'
}

const MonthSummaryInnerStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',
}

const ATBContainerStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	alignItems: 'center',
	padding: '4px',
	borderRadius: '6px',
	backgroundColor: '#16A336',
	paddingLeft: '10px',
	paddingRight: '10px'
}

const ATBNumberStyle = {
	color: '#ffffff',
	fontSize: '28px',
	fontWeight: 'normal',
	margin: '0px'
}

const ATBLabelStyle = {
	color: '#003440',
	fontSize: '14px',
	fontWeight: 'normal',
	fontStyle: 'italic'
}

const SummaryNumbersContainerStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	alignItems: 'flex-end',
	paddingLeft: '5px',
	paddingRight: '5px'
}

const SummaryNumberStyle = {
	color: '#ffffff',
	fontSize: '12px',
	fontWeight: 'bold',
	margin: '0px'
}

const SummaryLabelsContainerStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	alignItems: 'flex-start'
}

const SummaryLabelStyle = {
	color: '#ffffff',
	fontSize: '12px',
	fontWeight: 'normal',
	fontStyle: 'italic',
	margin: '0px'
}

export class PMonthSummary extends React.Component<PMonthSummaryProps, PMonthSummaryState> {

	public render() {

		var availableToBudget = 0;
		var entitiesCollection = this.props.entitiesCollection;
		if(entitiesCollection && entitiesCollection.monthlyBudgets) {

			var currentMonth = this.props.currentMonth;
			var monthlyBudget = entitiesCollection.monthlyBudgets.getMonthlyBudgetByMonth(currentMonth.toISOString());
			availableToBudget = monthlyBudget.availableToBudget;
		}

		var atbContainerStyle:any = ATBContainerStyle;
		if(availableToBudget < 0) {
			atbContainerStyle = Object.assign({}, ATBContainerStyle);
			atbContainerStyle.backgroundColor = "#D33C2D";
		}
		return (
			<div style={MonthSummaryContainerStyle}>
				<div style={MonthSummaryInnerStyle}>
					<div style={atbContainerStyle}>
						<label style={ATBNumberStyle}>{availableToBudget}</label>
						<label style={ATBLabelStyle}>To be Budgeted</label>
					</div>
					<div style={SummaryNumbersContainerStyle}>
						<label style={SummaryNumberStyle}>+802</label>
						<label style={SummaryNumberStyle}>-7</label>
						<label style={SummaryNumberStyle}>-1000</label>
						<label style={SummaryNumberStyle}>-0</label>
					</div>
					<div style={SummaryLabelsContainerStyle}>
						<label style={SummaryLabelStyle}>Funds for Oct</label>
						<label style={SummaryLabelStyle}>Overspent in Sep</label>
						<label style={SummaryLabelStyle}>Budgeted in Oct</label>
						<label style={SummaryLabelStyle}>Budgeted in Future</label>
					</div>
				</div>
			</div>
		);
	}
}