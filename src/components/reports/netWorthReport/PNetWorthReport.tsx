/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DataFormatter } from '../../../utilities';
import { IEntitiesCollection, IReportState } from '../../../interfaces/state';

export interface PNetWorthReportProps {
	dataFormatter:DataFormatter;
	reportState:IReportState;
	entitiesCollection:IEntitiesCollection;
}

export interface PNetWorthReportState {
}

export class PNetWorthReport extends React.Component<PNetWorthReportProps, PNetWorthReportState> {

	public render() {
		return <div />;
	}
}