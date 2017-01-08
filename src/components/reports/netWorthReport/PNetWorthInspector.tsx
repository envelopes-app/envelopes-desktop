/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon } from 'react-bootstrap';

import { UIConstants } from '../../../constants';
import { DataFormatter, DateWithoutTime, SimpleObjectMap } from '../../../utilities';
import { IReportState } from '../../../interfaces/state';
import { NetWorthReportData } from './NetWorthReportData';

export interface PNetWorthInspectorProps {
	dataFormatter:DataFormatter;
	reportState:IReportState;
	reportData:NetWorthReportData;
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

const ListItemLabelStyle:React.CSSProperties = {
	flex: "1 1 auto",
	fontSize: "14px",
	fontWeight: "normal",
	cursor: "inherit"
}

const ChangeInNetWorthValueContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "center",
	justifyContent: "space-between",
}

const ListItemValueStyle:React.CSSProperties = {
	flex: "0 0 auto",
	textAlign: "right",
	fontSize: "14px",
	fontWeight: "normal",
	cursor: "inherit"
}

const LargeArrowGlyphStyle:React.CSSProperties = {
	fontSize: "24px",
	color: "#588697",
	marginRight: "5px",
}

const GlyphStyle:React.CSSProperties = {
	flex: "0 0 auto",
	fontSize: "12px",
	marginLeft: "3px",
	marginBottom: "5px",
	opacity: 0.8
}

const RedArrowGlyphStyle = Object.assign({}, GlyphStyle, {
	color: "#D33C2D",
});

const GreenArrowGlyphStyle = Object.assign({}, GlyphStyle, {
	color: "#16A336",
});

const GreyDashGlyphStyle = Object.assign({}, GlyphStyle, {
	color: "#588697",
});

export class PNetWorthInspector extends React.Component<PNetWorthInspectorProps, {}> {

	public render() {

		var reportState = this.props.reportState;
		var dataFormatter = this.props.dataFormatter;
		var reportData = this.props.reportData;

		var startMonth = reportState.startDate;
		var endMonth = reportState.endDate;
		var timeFrame = `${startMonth.format("MMM YYYY")} - ${endMonth.format("MMM YYYY")}`;
		var inclusionString = (reportState.allAccountsSelected) ? "All accounts included" : "Some accounts excluded";

		var netWorthItems:Array<JSX.Element> = [];
		var itemsDataArray = reportData.getItemDataArray();
		for(var i:number = itemsDataArray.length - 1; i >= 0; i--) {

			var itemData = itemsDataArray[i];
			var month = DateWithoutTime.createFromISOString(itemData.monthName);
			var glyph:JSX.Element;
			if(itemData.netWorthIncreasing)
				glyph = <Glyphicon glyph="arrow-up" style={GreenArrowGlyphStyle} />;
			else if(itemData.netWorthDecreasing)
				glyph = <Glyphicon glyph="arrow-down" style={RedArrowGlyphStyle} />;
			else
				glyph = <Glyphicon glyph="minus" style={GreyDashGlyphStyle} />;

			netWorthItems.push(
				<li key={itemData.monthName} style={ListItemStyle}>
					<label style={ListItemLabelStyle}>{month.format("MMM YYYY")}</label>
					<label style={ListItemValueStyle}>{dataFormatter.formatCurrency(itemData.netWorth)}</label>
					{glyph}
				</li>
			);
		}

		var glyphForOverallChangeInNetWorth:JSX.Element = null;
		if(reportData.getChangeInNetWorth() > 0)
			glyphForOverallChangeInNetWorth = <Glyphicon glyph="upload" style={LargeArrowGlyphStyle} />;
		else if(reportData.getChangeInNetWorth() < 0)
			glyphForOverallChangeInNetWorth = <Glyphicon glyph="download" style={LargeArrowGlyphStyle} />;

		return (
			<div style={InspectorContainerStyle}>
				<div style={SectionStyle}>
					<label style={ValueStyle}>{timeFrame}</label>
					<label style={Label2Style}>{inclusionString}</label>
				</div>
				<hr style={HRStyle} />
				<div style={SectionStyle}>
					<label style={Label1Style}>CHANGE IN NET WORTH</label>
					<div style={ChangeInNetWorthValueContainerStyle}>
						{glyphForOverallChangeInNetWorth}
						<label style={ValueStyle}>{dataFormatter.formatCurrency(Math.abs(reportData.getChangeInNetWorth()))}</label>
					</div>
					<label style={Label2Style}>{reportData.getPercentageChangeInNetWorth()}%</label>
				</div>
				<hr style={HRStyle} />
				<ul style={ListStyle}>
					<li style={ListHeaderItemStyle}>
						<label style={ListHeaderLabelStyle}>MONTH</label>
						<label style={ListHeaderLabelStyle}>NET WORTH</label>
					</li>
					{netWorthItems}
				</ul>
			</div>
		);
	}
}