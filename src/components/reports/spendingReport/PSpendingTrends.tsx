/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const { Chart } = require('chart.js');

import { UIConstants } from '../../../constants';
import { IReportState } from '../../../interfaces/state';
import { DataFormatter, DateWithoutTime, SimpleObjectMap } from '../../../utilities';
import { ISpendingReportItemData } from '../../../interfaces/reports';
import { SpendingReportData } from './SpendingReportData';

export interface PSpendingTrendsProps {
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

export class PSpendingTrends extends React.Component<PSpendingTrendsProps, {}> {

	private chart:any;
	private refCanvas:HTMLCanvasElement;

	constructor(props:PSpendingTrendsProps) {
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

	private initializeChart(props:PSpendingTrendsProps) {

		var element = ReactDOM.findDOMNode(this.refCanvas) as any;
      	var ctx = element.getContext("2d");
		var dataFormatter = props.dataFormatter;

		this.chart = new Chart(ctx, {
			type: 'bar',
			data: this.buildDataObject(props),
			options: {
				layout: {
					padding: {top:100, bottom:100, left:25, right:25}
				},
				legend: {
					display: false
				},
				scales: {
					xAxes: [{
						stacked: true
					}],
					yAxes: [{
						stacked: true,
						ticks: {
							callback: (value, index, values)=>{
								return dataFormatter.formatCurrency(value);
							}
						}
					}],
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
							var title = data.datasets[tooltipItem.datasetIndex].label;
							return title;
						},
						label: (tooltipItem, data)=>{
							var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
							var formattedValue = dataFormatter.formatCurrency(value);
							return formattedValue;
						},
						footer: (tooltipItems, data)=>{

							var tooltipItem = tooltipItems[0];
							if(tooltipItem.datasetIndex == 0) {
								// We are currently hovering over the totals line chart
								// Instead of showing the percentage of total value, we are going to show the month name
								var monthString = "01/" + tooltipItem.xLabel;
								var date = DateWithoutTime.createFromString(monthString, "DD/MM/YYYY");
								return date.format("MMM YYYY");
							}
							else {
								var sumOfAllValues = _.reduce(data.datasets, (sum, dataset:any)=>{
									return sum + dataset.data[tooltipItem.index];
								}, 0);

								var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
								var percentage = value == 0 ? 0 : value/sumOfAllValues*100;
								return `${Math.round(percentage*100)/100}% of Total`;	
							}
						}
					}
				},
				onClick: (event, chartElements)=>{

					var chartElements = this.chart.getElementAtEvent(event);
					if(chartElements.length > 0) {

						var chartElement = chartElements[0];
						var itemIndex = chartElement._datasetIndex;
						// We dont want to handle click on the line chart, and the "all_other_categories" item
						if(itemIndex > 0 && itemIndex < 11) {
							// We are subtracting 1 because the first dataset is for the "totals" line chart 
							this.handleChartClick(itemIndex - 1);
						}
					}
				}
			}
		});
	}

	private buildDataObject(props:PSpendingTrendsProps):any {

		var reportData = props.reportData;
		var data = {
			labels: reportData.getAllMonthNames(),
			datasets: this.buildDatasets(props)
		};

		return data;
	}

	private updateDataObject(props:PSpendingTrendsProps):void {

		var reportData = props.reportData;
		var labels = reportData.getAllMonthNames();
		var datasets = this.buildDatasets(props);

		// Update the chart data with these new values
		this.chart.data.labels = labels;
		for(var i:number = 0; i <= 11; i++) {
			this.chart.data.datasets[i].label = datasets[i].label;
			this.chart.data.datasets[i].data = datasets[i].data;
		}
		this.chart.update();
	}

	private buildDatasets(props:PSpendingTrendsProps):Array<any> {

		var reportData = props.reportData;
		let datasets:Array<any> = [];
		// First add a dataset for the line chart
		let dataSet = {
			type: 'line',
			fill: false,
			lineTension: 0,
			label: 'Total Spending',
			borderColor: "#333333",
			pointBorderWidth: 2,
			pointBorderColor: "#333333",
			pointBackgroundColor: "#E5F5F9",
			pointHoverBackgroundColor: "#E5F5F9",
			pointRadius: 6,
			pointHoverRadius: 6,
			data: reportData.getMonthlyTotalValues()
		};
		datasets.push(dataSet);

		// Add dataset for each item in the report data
		var itemIds = reportData.getOverallSortedItemIds();
		var itemNames = reportData.getOverallSortedItemNames();
		var colors = UIConstants.ChartColors;

		for(let i:number = 0; i < 11; i++) {

			var itemId = itemIds[i];
			var monthlyItemValues:Array<number>;
			if(itemId)
				monthlyItemValues = reportData.getMonthlyValuesForItem(itemId);
			else
				monthlyItemValues = [];

			var color = colors[i];
			// We want a colors array of the same length as the values array. Would contain the same color as this 
			// item is going to be represented by the same color in all months.
			let backgroundColors:Array<string> = [];
			let borderColors:Array<string> = [];
			let hoverBackgroundColors:Array<string> = [];
			let hoverBorderColors:Array<string> = [];
			for(let j:number = 0; j < monthlyItemValues.length; j++) {
				backgroundColors.push(color);
				borderColors.push(color);
				hoverBackgroundColors.push(color);
				hoverBorderColors.push(color);
			}

			let dataSet = {
				label: itemNames[i],
				backgroundColor: backgroundColors,
				borderColor: borderColors,
				hoverBackgroundColor: hoverBackgroundColors,
				hoverBorderColor: hoverBorderColors,
				borderWidth: 1,
				data: monthlyItemValues
			};

			datasets.push(dataSet);
		}

		return datasets;
	}

	public componentDidMount():void {

		this.initializeChart(this.props);
	}

	public componentWillUnmount():void {

		this.chart.destroy();
	}

	public componentWillReceiveProps(nextProps:PSpendingTrendsProps):void {

		this.updateDataObject(nextProps);
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