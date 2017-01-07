/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon } from 'react-bootstrap';

import { PHoverableDiv } from '../../common/PHoverableDiv';
import { UIConstants } from '../../../constants';
import { IReportState } from '../../../interfaces/state';

export interface PSpendingReportHeaderProps {
	showingTotals:boolean;
	masterCategoryName:string;
	setReportView:(showTotals:boolean)=>void;
	setMasterCategoryId:(masterCategoryId:string)=>void;
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

const BreadCrumbContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "center",
	marginTop: "5px"
}

const ReportNameStyle:React.CSSProperties = {
	fontSize: "20px",
	fontWeight: "normal"
}

const CategorySelectionStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal",
	marginBottom: "0px",
	marginRight: "5px"
}

const CategorySelectionLinkStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#23A9CA",
	marginBottom: "0px",
	marginRight: "5px",
	cursor: "pointer"
}

const GlyphStyle:React.CSSProperties = {
	fontSize: "12px",
	marginRight: "4px"
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
		this.onAllCategoriesLinkClicked = this.onAllCategoriesLinkClicked.bind(this);
		this.onTotalsButtonClicked = this.onTotalsButtonClicked.bind(this);
		this.onTrendsButtonClicked = this.onTrendsButtonClicked.bind(this);
	}

	private onAllCategoriesLinkClicked(event:React.MouseEvent<any>):void {
		this.props.setMasterCategoryId(null);
	}

	private onTotalsButtonClicked(event:React.MouseEvent<any>):void {
		this.props.setReportView(true);
	}

	private onTrendsButtonClicked(event:React.MouseEvent<any>):void {
		this.props.setReportView(false);
	}

	private getBreadCrumb():JSX.Element {

		var breadCrumb:JSX.Element;

		if(!this.props.masterCategoryName) {
			breadCrumb = (
				<div style={BreadCrumbContainer}>
					<label style={CategorySelectionStyle}>All Categories</label>
				</div>
			);
		}
		else {
			breadCrumb = (
				<div style={BreadCrumbContainer}>
					<label style={CategorySelectionLinkStyle} onClick={this.onAllCategoriesLinkClicked}>All Categories</label>
					<Glyphicon glyph="triangle-right" style={GlyphStyle}/>
					<label style={CategorySelectionStyle}>{this.props.masterCategoryName}</label>
				</div>
			);
		}

		return breadCrumb;
	}

	public render() {

		var reportName = this.props.showingTotals ? "Spending Totals" : "Spending Trends";
		var breadCrumb = this.getBreadCrumb();

		return (
			<div style={ReportsHeaderStyle}>
				<div style={HeaderLeftSection}>
					<label style={ReportNameStyle}>{reportName}</label>
					{breadCrumb}
				</div>
				<div style={HeaderRightSection}>
					<PHoverableDiv defaultStyle={ButtonDefaultStyle} 
						hoverStyle={ButtonHoverStyle} 
						selectedStyle={ButtonSelectedStyle}
						onClick={this.onTotalsButtonClicked}
						selected={this.props.showingTotals == true}>
						<div>Totals</div>
					</PHoverableDiv> 
					<PHoverableDiv defaultStyle={ButtonDefaultStyle} 
						hoverStyle={ButtonHoverStyle} 
						selectedStyle={ButtonSelectedStyle}
						onClick={this.onTrendsButtonClicked}
						selected={this.props.showingTotals == false}>
						<div>Trends</div>
					</PHoverableDiv> 
				</div>
			</div>
		);
	}
}