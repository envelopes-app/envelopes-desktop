/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PReportsHeader } from './header/PReportsHeader';
import { PReportsToolbar } from './toolbar/PReportsToolbar';

import * as budgetEntities from '../../interfaces/budgetEntities';
import * as catalogEntities from '../../interfaces/catalogEntities';
import { IDataFormat } from '../../interfaces/formatters';
import { RegisterFilterTimeFrame, ReportNames } from '../../constants';
import { DataFormats, DataFormatter, DateWithoutTime, SimpleObjectMap } from '../../utilities';
import { IEntitiesCollection, IReportState } from '../../interfaces/state';

export interface PReportsProps {
	// State Variables
	activeBudgetId:string;
	entitiesCollection:IEntitiesCollection;
}

export interface PReportsState {
	dataFormat:string;
	dataFormatter:DataFormatter;
	selectedReport:string;
	selectedReportState:IReportState;

	reportsState: SimpleObjectMap<IReportState>;
}

const ReportsContainerStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	height: '100%',
	width: '100%'
}

export class PReports extends React.Component<PReportsProps, PReportsState> {

	constructor(props:PReportsProps) {
		super(props);
		this.setSelectedReport = this.setSelectedReport.bind(this);
		this.setReportState = this.setReportState.bind(this);

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

		var reportsState = {};
		reportsState[ReportNames.Spending] = this.getInitialStateForReport(ReportNames.Spending);
		reportsState[ReportNames.NetWorth] = this.getInitialStateForReport(ReportNames.NetWorth);
		reportsState[ReportNames.IncomeVsExpense] = this.getInitialStateForReport(ReportNames.IncomeVsExpense);
		
		this.state = {
			dataFormat: JSON.stringify(dataFormat),
			dataFormatter: new DataFormatter(dataFormat),
			selectedReport: ReportNames.Spending,
			selectedReportState: reportsState[ReportNames.Spending],
			reportsState: reportsState,
		}
	}
	
	private getInitialStateForReport(reportName:string):IReportState {

		var categoryIds:Array<string> = [];
		var masterCategories = this.props.entitiesCollection.masterCategories.getVisibleNonTombstonedMasterCategories();
		_.forEach(masterCategories, (masterCategory)=>{

			var subCategories = this.props.entitiesCollection.subCategories.getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategory.entityId);
			_.forEach(subCategories, (subCategory)=>{
				categoryIds.push(subCategory.entityId);
			})
		});

		var accountIds:Array<string> = [];
		var accounts = this.props.entitiesCollection.accounts.getNonTombstonedOpenAccounts();
		_.forEach(accounts, (account)=>{
			// For "Net Worth" report, add both budget and tracking accounts. Otherwise only include budget accounts.
			if(reportName == ReportNames.NetWorth || account.onBudget == 1)
				accountIds.push(account.entityId);
		});

		var reportState:IReportState = {
			
			allAccountsSelected: true,
			noAccountsSelected: false,
			selectedAccountIds: accountIds,

			allCategoriesSelected: true,
			noCategoriesSelected: false,
			uncategorizedTransactionsSelected: true,
			hiddenCategoriesSelected: true,
			selectedCategoryIds: categoryIds,

			selectedTimeframe: RegisterFilterTimeFrame.LatestThreeMonths,
			startDate: DateWithoutTime.createForCurrentMonth().subtractMonths(2),
			endDate: DateWithoutTime.createForCurrentMonth()
		};

		return reportState;
	}

	private setSelectedReport(reportName:string):void {
		var state = Object.assign({}, this.state);
		state.selectedReport = reportName;
		state.selectedReportState = state.reportsState[reportName];
		this.setState(state);
	}

	private setReportState(reportState:IReportState):void {
		var state = Object.assign({}, this.state);
		state.reportsState[state.selectedReport] = reportState;
		this.setState(state);
	}

	public render() {

		return (
			<div style={ReportsContainerStyle}>
				<PReportsHeader 
					selectedReport={this.state.selectedReport}
					setSelectedReport={this.setSelectedReport}
				/>
				<PReportsToolbar 
					dataFormatter={this.state.dataFormatter}
					selectedReport={this.state.selectedReport}
					reportState={this.state.selectedReportState}
					entitiesCollection={this.props.entitiesCollection}
					setReportState={this.setReportState}
				/>
			</div>
		);
	}
}