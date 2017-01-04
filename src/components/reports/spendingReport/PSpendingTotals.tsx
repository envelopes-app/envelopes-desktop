/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const pattern = require('patternomaly');
const { Chart } = require('chart.js');

import { UIConstants } from '../../../constants';
import { IReportState } from '../../../interfaces/state';
import { DataFormatter, DateWithoutTime, SimpleObjectMap } from '../../../utilities';
import { ISpendingReportItemData } from '../../../interfaces/reports';
import { SpendingReportTotalsData } from './SpendingReportTotalsData';

export interface PSpendingTotalsProps {
	dataFormatter:DataFormatter;
	reportState:IReportState;
	masterCategoryId:string;
	totalsData:SpendingReportTotalsData;
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

export class PSpendingTotals extends React.Component<PSpendingTotalsProps, {}> {

	private chart:any;
	private refCanvas:HTMLCanvasElement;

	private initializeChart(props:PSpendingTotalsProps) {

		var Chart = require('chart.js');
		var element = ReactDOM.findDOMNode(this.refCanvas) as any;
      	var ctx = element.getContext("2d");
		this.chart = new Chart(ctx, {
			type: 'pie',
			data: this.buildDataObject(props),
			options: {
				layout: {
					padding: 100
				},
				legend: {
					display: false
				},
				tooltips: {
					position: "nearest"
				},
				onClick: (...args:any[])=>{
					debugger;
				}
			}
		});
	}

	private buildDataObject(props:PSpendingTotalsProps):any {

		var totalsData = props.totalsData;
		var dataItems = totalsData.getItemDataArray();
		var labels = _.map(dataItems, "itemName");
		var values = _.map(dataItems, "value");

		let data = {
			labels: labels,
			datasets: [
				{
					data: values,
					backgroundColor: UIConstants.ChartColors,
					hoverBackgroundColor: UIConstants.ChartHoverColors,
					hoverBorderColor: UIConstants.ChartColors
				}]
		};

		return data;
	}

	private updateDataObject(props:PSpendingTotalsProps):void {

		var totalsData = props.totalsData;
		var dataItems = totalsData.getItemDataArray();
		var labels = _.map(dataItems, "itemName");
		var values = _.map(dataItems, "value");

		this.chart.data.labels = labels;
		this.chart.data.datasets[0].data = values;
	}

	public componentDidMount():void {

		this.initializeChart(this.props);
	}

	public componentWillUnmount():void {

		var chart = this.chart;
      	chart.destroy();
	}

	public componentWillReceiveProps(nextProps:PSpendingTotalsProps):void {

		this.updateDataObject(nextProps);
		this.chart.update();
	}

	public render() {

		var dataFormatter = this.props.dataFormatter;
		var data = this.props.totalsData.getItemDataArray();

		return (
			<div style={ChartContainerStyle}>
				<canvas 
					style={{width: "100%", height: "100%"}}
					ref={(c)=> this.refCanvas = c }
				/>
			</div>
		);
	}
}