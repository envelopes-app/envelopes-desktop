/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const pattern = require('patternomaly');
const { Chart } = require('chart.js');

import { UIConstants } from '../../../constants';
import { DataFormatter, DateWithoutTime, SimpleObjectMap } from '../../../utilities';
import { ISpendingReportItemData } from '../../../interfaces/reports';
import { SpendingReportData } from './SpendingReportData';

export interface PSpendingTotalsProps {
	dataFormatter:DataFormatter;
	masterCategoryId:string;
	reportData:SpendingReportData;

	setMasterCategoryId:(masterCategoryId:string)=>void;
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

	constructor(props:PSpendingTotalsProps) {
		super(props);
		this.handleChartClick = this.handleChartClick.bind(this);
	}

	private handleChartClick(itemIndex:number):void {

		// Are we currently showing top-level chart, or the first level chart
		if(!this.props.masterCategoryId) {

			// We are currently showing the top level chart (master categories data). Determine the master
			// category item that was clicked. 
			var itemIds = this.props.reportData.getOverallSortedItemIds();
			var clickedMasterCategoryId = itemIds[itemIndex];
			this.props.setMasterCategoryId(clickedMasterCategoryId);
		} 
	}

	private initializeChart(props:PSpendingTotalsProps) {

		var element = ReactDOM.findDOMNode(this.refCanvas) as any;
      	var ctx = element.getContext("2d");
		var dataFormatter = props.dataFormatter;

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
					position: "nearest",
					displayColors: false,
					backgroundColor: "#F5F6F8",
					titleFontColor: "#000000",
					bodyFontColor: "#000000",
					bodyFontSize: 16,
					bodyFontStyle: "bold",
					footerFontColor: "#000000",
					callbacks: {
						title: (tooltipItems, data)=>{
							var tooltipItem = tooltipItems[0];
							var title = data.labels[tooltipItem.index];
							return title;
						},
						label: (tooltipItem, data)=>{
							var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
							var formattedValue = dataFormatter.formatCurrency(value);
							return formattedValue;
						},
						footer: (tooltipItems, data)=>{
							var tooltipItem = tooltipItems[0];
							var valuesArray = data.datasets[tooltipItem.datasetIndex].data;
							var value = valuesArray[tooltipItem.index];
							var sumOfAllValues = _.reduce(valuesArray, (sum, value:number)=>{
								return sum + value;
							}, 0);
							var percentage = value == 0 ? 0 : value/sumOfAllValues*100;
							return `${Math.round(percentage*100)/100}% of Total`;	
						}
					}
				},
				onClick: (event, chartElements)=>{

					if(chartElements.length > 0) {

						var chartElement = chartElements[0];
						var itemIndex = chartElement._index;
						this.handleChartClick(itemIndex);
					}
				}
			}
		});
	}

	private buildDataObject(props:PSpendingTotalsProps):any {

		var dataItems = props.reportData.getOverallItemDataArray();
		var labels = _.map(dataItems, "itemName");
		var values = _.map(dataItems, "value");
		var percentages = _.map(dataItems, "percentageOfTotal");

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

		var dataItems = props.reportData.getOverallItemDataArray();
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