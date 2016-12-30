/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DataFormatter } from '../../../utilities';
import { IEntitiesCollection, IReportState } from '../../../interfaces/state';

export interface PIncomeExpenseReportProps {
	dataFormatter:DataFormatter;
	reportState:IReportState;
	entitiesCollection:IEntitiesCollection;
}

export interface PIncomeExpenseReportState {
}

export class PIncomeExpenseReport extends React.Component<PIncomeExpenseReportProps, PIncomeExpenseReportState> {

	public render() {
		return <div />;
	}
}