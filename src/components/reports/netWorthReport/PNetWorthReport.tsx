/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PNetWorthChart } from './PNetWorthChart';
import { PNetWorthInspector } from './PNetWorthInspector';

import { DataFormatter, SimpleObjectMap } from '../../../utilities';
import { IEntitiesCollection, IReportState } from '../../../interfaces/state';
import { NetWorthReportData } from './NetWorthReportData';

export interface PNetWorthReportProps {
	dataFormatter:DataFormatter;
	reportState:IReportState;
	entitiesCollection:IEntitiesCollection;
}

export interface PNetWorthReportState {
	reportData:NetWorthReportData;
}

const ReportsContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: "row nowrap",
	width: "100%",
	height: "100%",
}

const ReportsInnerContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: "column nowrap",
	width: "100%",
	height: "100%",
}

const ReportNameStyle:React.CSSProperties = {
	flex: "0 0 auto",
	width: "100%",
	height: "50px",
	padding: "10px",
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: "flex-start",
	fontSize: "20px",
	fontWeight: "normal"
}

export class PNetWorthReport extends React.Component<PNetWorthReportProps, PNetWorthReportState> {

	constructor(props:PNetWorthReportProps) {
		super(props);		
		this.state = {
			reportData: this.calculateReportData(props)
		}
	}

	private calculateReportData(props:PNetWorthReportProps):NetWorthReportData {

		var entitiesCollection = props.entitiesCollection;
		var accountsArray = entitiesCollection.accounts;
		var accountMonthlyCalculationsArray = entitiesCollection.accountMonthlyCalculations;
		var reportState = props.reportState;
		var accountInclusionMap:SimpleObjectMap<boolean> = {};
		var reportData = new NetWorthReportData(reportState.startDate, reportState.endDate);

		// Put a true in the above maps for included accounts and categories
		_.forEach(reportState.selectedAccountIds, (accountId)=>{
			accountInclusionMap[accountId] = true;
		});

		var accountMonthlyCalculations = accountMonthlyCalculationsArray.getAllItems();
		// Iterate through each of these accountMonthlyCalculations and add their balance to the itemData object
		_.forEach(accountMonthlyCalculations, (accountMonthlyCalculation)=>{

			let itemData = reportData.getMonthlyItemData(accountMonthlyCalculation.month);
			// Is this account included in the report
			if(accountInclusionMap[accountMonthlyCalculation.accountId] == true) {

				var accountBalance = accountMonthlyCalculation.clearedBalance + accountMonthlyCalculation.unclearedBalance;
				if(accountBalance > 0)
					itemData.assetValue += accountBalance;
				else
					itemData.debtValue += (-accountBalance);
			}
		});

		reportData.prepareDataForPresentation();
		return reportData;
	}

	public componentWillReceiveProps(nextProps:PNetWorthReportProps):void {

		var state = Object.assign({}, this.state);
		state.reportData = this.calculateReportData(nextProps);
		this.setState(state);
	}

	public render() {
		debugger;

		return (
			<div style={ReportsContainerStyle}>
				<div style={ReportsInnerContainerStyle}>
					<div style={ReportNameStyle}>Net Worth</div>
					<PNetWorthChart 
						dataFormatter={this.props.dataFormatter}
						reportState={this.props.reportState}
						reportData={this.state.reportData}
					/>
				</div>
				<PNetWorthInspector 
					dataFormatter={this.props.dataFormatter}
					reportState={this.props.reportState}
					reportData={this.state.reportData}
				/>
			</div>
		);
	}
}