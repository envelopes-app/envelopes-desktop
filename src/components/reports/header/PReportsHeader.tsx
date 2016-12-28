/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PHoverableDiv } from '../../common/PHoverableDiv';

import { ReportNames, UIConstants } from '../../../constants';

export interface PReportsHeaderProps {
	selectedReport:string;
	setSelectedReport:(reportName:string)=>void;
}

const ReportsHeaderContainerStyle:React.CSSProperties = {
	flex: '0 0 auto',
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '45px',
	width: '100%',
	backgroundColor: UIConstants.HeaderBackgroundColor,
	paddingLeft: '20px',
	paddingRight: '20px',
}

const ButtonDefaultStyle:React.CSSProperties = {
	fontSize: "16px",
	fontWeight: "normal",
	color: "#FFFFFF",
	backgroundColor: UIConstants.HeaderBackgroundColor,
	paddingLeft: '8px',
	paddingRight: '8px',
	paddingTop: '3px',
	paddingBottom: '3px',
	borderRadius: "100px",
	marginRight: "10px",
	cursor: "pointer"
}

const ButtonHoverStyle = Object.assign({}, ButtonDefaultStyle, {
	backgroundColor: "#16A336"
});

const ButtonSelectedStyle = Object.assign({}, ButtonHoverStyle, {
	cursor: "default"
});

export class PReportsHeader extends React.Component<PReportsHeaderProps, {}> {

	constructor(props:PReportsHeaderProps) {
		super(props);
		this.handleSpendingReportClick = this.handleSpendingReportClick.bind(this);
		this.handleNetWorthReportClick = this.handleNetWorthReportClick.bind(this);
		this.handleIncomeExpenseReportClick = this.handleIncomeExpenseReportClick.bind(this);
	}

	private handleSpendingReportClick(event:React.MouseEvent<any>):void {

		if(this.props.selectedReport != ReportNames.Spending)
			this.props.setSelectedReport(ReportNames.Spending);
	}

	private handleNetWorthReportClick(event:React.MouseEvent<any>):void {

		if(this.props.selectedReport != ReportNames.NetWorth)
			this.props.setSelectedReport(ReportNames.NetWorth);
	}

	private handleIncomeExpenseReportClick(event:React.MouseEvent<any>):void {

		if(this.props.selectedReport != ReportNames.IncomeVsExpense)
			this.props.setSelectedReport(ReportNames.IncomeVsExpense);
	}

	public render() {
		return (
			<div style={ReportsHeaderContainerStyle}>
				<PHoverableDiv defaultStyle={ButtonDefaultStyle} 
					hoverStyle={ButtonHoverStyle} 
					selectedStyle={ButtonSelectedStyle}
					onClick={this.handleSpendingReportClick}
					selected={this.props.selectedReport == ReportNames.Spending}>
					Spending
				</PHoverableDiv> 

				<PHoverableDiv defaultStyle={ButtonDefaultStyle} 
					hoverStyle={ButtonHoverStyle} 
					selectedStyle={ButtonSelectedStyle}
					onClick={this.handleNetWorthReportClick}
					selected={this.props.selectedReport == ReportNames.NetWorth}>
					Net Worth
				</PHoverableDiv> 

				<PHoverableDiv defaultStyle={ButtonDefaultStyle} 
					hoverStyle={ButtonHoverStyle} 
					selectedStyle={ButtonSelectedStyle}
					onClick={this.handleIncomeExpenseReportClick}
					selected={this.props.selectedReport == ReportNames.IncomeVsExpense}>
					Income v Expense
				</PHoverableDiv> 
			</div>
		);
	}
}