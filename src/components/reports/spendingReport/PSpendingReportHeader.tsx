/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PHoverableDiv } from '../../common/PHoverableDiv';
import { UIConstants } from '../../../constants';
import { IReportState } from '../../../interfaces/state';

export interface PSpendingReportHeaderProps {
	showingTotals:boolean;
	reportState:IReportState;
	setReportView:(showTotals:boolean)=>void;
}

const ReportsHeaderStyle:React.CSSProperties = {
	flex: "0 0 auto",
	width: "100%",
	height: "50px",
	padding: "10px",
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: "space-around"
}

const HeaderLeftSection:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: "column nowrap",
	alignItems: "flex-start",
	justifyContent: "flex-start"
}

const HeaderRightSection:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "flex-start",
	justifyContent: "flex-end"
}

const ReportNameStyle:React.CSSProperties = {
	fontSize: "20px",
	fontWeight: "normal"
}

const CategorySelectionStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal"
}

const ButtonDefaultStyle:React.CSSProperties = {
	fontSize: "16px",
	fontWeight: "normal",
	color: "#009CC2",
	backgroundColor: "#FFFFFF",
	paddingLeft: '12px',
	paddingRight: '12px',
	paddingTop: '1px',
	paddingBottom: '1px',
	borderRadius: "100px",
	marginRight: "5px",
	cursor: "pointer"
}

const ButtonHoverStyle = Object.assign({}, ButtonDefaultStyle, {
	color: "#FFFFFF",
	backgroundColor: "#009CC2"
});

const ButtonSelectedStyle = Object.assign({}, ButtonHoverStyle, {
	cursor: "default"
});

export class PSpendingReportHeader extends React.Component<PSpendingReportHeaderProps, {}> {

	constructor(props:PSpendingReportHeaderProps) {
		super(props);
		this.onTotalsButtonClicked = this.onTotalsButtonClicked.bind(this);
		this.onTrendsButtonClicked = this.onTrendsButtonClicked.bind(this);
	}

	private onTotalsButtonClicked(event:React.MouseEvent<any>):void {
		this.props.setReportView(true);
	}

	private onTrendsButtonClicked(event:React.MouseEvent<any>):void {
		this.props.setReportView(false);
	}

	public render() {

		var reportState = this.props.reportState;
		var reportName = this.props.showingTotals ? "Spending Totals" : "Spending Trends";
		var categorySelection:string;
		if(reportState.allCategoriesSelected)
			categorySelection = "All Categories";
		else if(reportState.allCategoriesSelected == false && reportState.noCategoriesSelected == false)
			categorySelection = "Some Categories";
		else
			categorySelection = "No Categories";

		return (
			<div style={ReportsHeaderStyle}>
				<div style={HeaderLeftSection}>
					<label style={ReportNameStyle}>{reportName}</label>
					<label style={CategorySelectionStyle}>{categorySelection}</label>
				</div>
				<div style={HeaderRightSection}>
					<PHoverableDiv defaultStyle={ButtonDefaultStyle} 
						hoverStyle={ButtonHoverStyle} 
						selectedStyle={ButtonSelectedStyle}
						onClick={this.onTotalsButtonClicked}
						selected={this.props.showingTotals == true}>
						Totals
					</PHoverableDiv> 
					<PHoverableDiv defaultStyle={ButtonDefaultStyle} 
						hoverStyle={ButtonHoverStyle} 
						selectedStyle={ButtonSelectedStyle}
						onClick={this.onTrendsButtonClicked}
						selected={this.props.showingTotals == false}>
						Trends
					</PHoverableDiv> 
				</div>
			</div>
		);
	}
}