/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { VictoryPie, VictoryTheme } from 'victory';
const { VictoryTooltip } = require('victory');

import { UIConstants } from '../../../constants';
import { IReportState } from '../../../interfaces/state';
import { DataFormatter, DateWithoutTime, SimpleObjectMap } from '../../../utilities';
import { ISpendingReportItemData } from '../../../interfaces/reports';
import { SpendingReportTotalsData } from './SpendingReportTotalsData';
import { PReportLabel } from './PReportLabel';

export interface PSpendingTotalsProps {
	dataFormatter:DataFormatter;
	reportState:IReportState;
	masterCategoryId:string;
	totalsData:SpendingReportTotalsData;
}

export interface PSpendingTotalsState {

}

const ChartContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	width: "100%",
	height: "100%",
	justifyContent: "center",
	alignItems: "center",
	minWidth: UIConstants.ReportsChartMinWidth
}

export class PSpendingTotals extends React.Component<PSpendingTotalsProps, PSpendingTotalsState> {

	public render() {

		var dataFormatter = this.props.dataFormatter;
		var data = this.props.totalsData.getItemDataArray();
		debugger;

		return (
			<div style={ChartContainerStyle}>
				<VictoryPie 
					data={data}
					x="itemId"
					y={ (datum) => datum.value != 0 ? datum.value / 1000 : 0}
					labels={ (datum) => datum.itemName }
					labelComponent={ <VictoryTooltip /> }
					theme={VictoryTheme.material}
					events={[
						{
							target: "data",
							eventHandlers: {
								onMouseOver: () => {
									return [
										{
											mutation: (props) => {
												return {
													style: Object.assign({}, props.style, {opacity: 0.8})
												};
											}
										}
									];
								},
								onMouseOut: () => {
									return [
										{
											mutation: (props) => {
												return {
													style: Object.assign({}, props.style, {opacity: 1})
												};
											}
										}
									];
								}
							}
						}
					]}
				/>
			</div>
		);
	}
}