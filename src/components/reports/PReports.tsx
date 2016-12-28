/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PReportsHeader } from './header/PReportsHeader';
import { PReportsToolbar } from './toolbar/PReportsToolbar';

import * as budgetEntities from '../../interfaces/budgetEntities';
import * as catalogEntities from '../../interfaces/catalogEntities';
import { IDataFormat } from '../../interfaces/formatters';
import { ReportNames } from '../../constants';
import { DataFormats, DataFormatter, DateWithoutTime, SimpleObjectMap } from '../../utilities';
import { IEntitiesCollection } from '../../interfaces/state';

export interface PReportsProps {
	// State Variables
	activeBudgetId:string;
	entitiesCollection:IEntitiesCollection;
}

export interface PReportsState {
	selectedReport:string;
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
		this.state = {
			selectedReport: ReportNames.Spending
		}
	}

	private setSelectedReport(reportName:string):void {
		var state = Object.assign({}, this.state);
		state.selectedReport = reportName;
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
					selectedReport={this.state.selectedReport}
					entitiesCollection={this.props.entitiesCollection}
				/>
			</div>
		);
	}
}