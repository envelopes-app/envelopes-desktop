/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { UIConstants } from '../../../constants';
import { DataFormatter, DateWithoutTime, SimpleObjectMap } from '../../../utilities';
import { IReportState } from '../../../interfaces/state';
import { SpendingReportData } from './SpendingReportData';

export interface PSpendingInspectorProps {
	dataFormatter:DataFormatter;
	reportState:IReportState;
	reportData:SpendingReportData;
	showSpendingActivityDialog:(itemId:string, itemName, element:HTMLElement, placement?:string)=>void;
}

const InspectorContainerStyle:React.CSSProperties = {
	flex: "0 0 auto",
	height: "100%",
	width: UIConstants.ReportsInspectorWidth,
	color: "#588697",
	borderColor: UIConstants.ReportsInspectorBorderColor,
	borderStyle: "solid",
	borderTopWidth: "0px",
	borderBottomWidth: "0px",
	borderRightWidth: "0px",
	borderLeftWidth: "1px",
	backgroundColor: UIConstants.ReportsInspectorBackgroundColor
}

const SectionStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: 'column nowrap',
	alignItems: "center",
	paddingTop: "10px",
	width: "100%"
}

const Label1Style:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal",
	marginBottom: "0px"
}

const Label2Style = Object.assign({}, Label1Style, {
	fontStyle: "italic",
});

const ValueStyle:React.CSSProperties = {
	fontSize: "24px",
	fontWeight: "bold",
	marginBottom: "0px"
}

const HRStyle:React.CSSProperties = {
	width: "80%",
	marginTop: "10px",
	marginBottom: "10px",
	borderTop: "1px solid #588697"
}

const ListStyle:React.CSSProperties = {
	paddingLeft: "20px",
	paddingRight: "20px",
	listStyleType: "none",
	width: "100%"
}

const ListHeaderItemStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "center",
	justifyContent: "space-between",
	width: "100%"
}

const ListHeaderLabelStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "bold"
}

const ListItemStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "center",
	justifyContent: "space-between",
	width: "100%",
	cursor: "pointer"
}

const ListItemSvgStyle:React.CSSProperties = {
	flex: "0 0 auto",
	width: "16px", 
	height: "16px", 
	marginBottom: "5px",
	marginRight: "5px",
	cursor: "inherit"
}

const ListItemLabelStyle:React.CSSProperties = {
	flex: "1 1 auto",
	fontSize: "14px",
	fontWeight: "normal",
	cursor: "inherit"
}

const ListItemValueStyle:React.CSSProperties = {
	flex: "0 0 auto",
	textAlign: "right",
	fontSize: "14px",
	fontWeight: "normal",
	cursor: "inherit"
}

export class PSpendingInspector extends React.Component<PSpendingInspectorProps, {}> {

	private handleItemClick(itemId:string, itemName:string, event:React.MouseEvent<any>):void {

		var listElement = event.currentTarget;
		this.props.showSpendingActivityDialog(itemId, itemName, listElement);
	}

	public render() {

		var reportState = this.props.reportState;
		var dataFormatter = this.props.dataFormatter;

		var startMonth = reportState.startDate;
		var endMonth = reportState.endDate;
		var timeFrame = `${startMonth.format("MMM YYYY")} - ${endMonth.format("MMM YYYY")}`;
		var inclusionString = (reportState.allAccountsSelected && reportState.allCategoriesSelected) ? "All categories and accounts included" : "Some categories and accounts excluded";

		var totalSpending = this.props.reportData.getOverallTotalSpending();

		var numberOfMonths = endMonth.monthsApart(startMonth) + 1;
		var averageSpending = totalSpending / numberOfMonths;

		var spendingItems:Array<JSX.Element> = [];
		var itemsDataArray = this.props.reportData.getOverallItemDataArray();
		var colors = UIConstants.ChartColors;
		for(var i:number = 0; i < itemsDataArray.length; i++) {

			var color = colors[i];
			var listItemSvgStyle = Object.assign({}, ListItemSvgStyle, {fill: color});
			var itemData = itemsDataArray[i];
			
			spendingItems.push(
				<li key={itemData.itemId} style={ListItemStyle} onClick={this.handleItemClick.bind(this, itemData.itemId, itemData.itemName)}>
					<svg style={listItemSvgStyle}>
						<circle cx="8" cy="8" r="8" />
					</svg>
					<label style={ListItemLabelStyle}>{itemData.itemName}</label>
					<label style={ListItemValueStyle}>{dataFormatter.formatCurrency(itemData.value)}</label>
				</li>
			);
		}

		return (
			<div style={InspectorContainerStyle}>
				<div style={SectionStyle}>
					<label style={ValueStyle}>{timeFrame}</label>
					<label style={Label2Style}>{inclusionString}</label>
				</div>
				<hr style={HRStyle} />
				<div style={SectionStyle}>
					<label style={Label1Style}>TOTAL SPENDING</label>
					<label style={ValueStyle}>{dataFormatter.formatCurrency(totalSpending)}</label>
					<label style={Label2Style}>For this time period</label>
				</div>
				<hr style={HRStyle} />
				<div style={SectionStyle}>
					<label style={Label1Style}>AVERAGE SPENDING</label>
					<label style={ValueStyle}>{dataFormatter.formatCurrency(averageSpending)}</label>
					<label style={Label2Style}>Per month</label>
				</div>
				<hr style={HRStyle} />
				<ul style={ListStyle}>
					<li style={ListHeaderItemStyle}>
						<label style={ListHeaderLabelStyle}>CATEGORIES</label>
						<label style={ListHeaderLabelStyle}>SPENDING</label>
					</li>
					{spendingItems}
				</ul>
			</div>
		);
	}
}