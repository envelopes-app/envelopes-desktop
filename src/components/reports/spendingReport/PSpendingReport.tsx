/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PSpendingTotals } from './PSpendingTotals';
import { PSpendingTrends } from './PSpendingTrends';
import { PSpendingInspector } from './PSpendingInspector';
import { DataFormatter } from '../../../utilities';
import { IEntitiesCollection, IReportState } from '../../../interfaces/state';

export interface PSpendingReportProps {
	dataFormatter:DataFormatter;
	reportState:IReportState;
	entitiesCollection:IEntitiesCollection;
}

export interface PSpendingReportState {
	showingTotals:boolean;
	masterCategoryId:string;
	subCategoryId:string;
	payeeId:string;
}

const ReportsContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	width: "100%",
	height: "100%",
	display: "flex",
	flexFlow: "row nowrap"
}

export class PSpendingReport extends React.Component<PSpendingReportProps, PSpendingReportState> {

	constructor(props:PSpendingReportProps) {
		super(props);
		this.state = {
			showingTotals: true,
			masterCategoryId: null,
			subCategoryId: null,
			payeeId: null
		}
	}

	public render() {

		if(this.state.showingTotals) {
			return (
				<div style={ReportsContainerStyle}>
					<PSpendingTotals />
					<PSpendingInspector />
				</div>
			);
		}
		else {
			return (
				<div style={ReportsContainerStyle}>
					<PSpendingTrends />
					<PSpendingInspector />
				</div>
			);
		}
	}
}