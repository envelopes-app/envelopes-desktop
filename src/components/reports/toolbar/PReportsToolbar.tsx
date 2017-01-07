/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon } from 'react-bootstrap';

import { PHoverableDiv } from '../../common/PHoverableDiv';
import { PAccountSelectionDialog } from '../dialogs/PAccountSelectionDialog';
import { PCategorySelectionDialog } from '../dialogs/PCategorySelectionDialog';
import { PTimeframeSelectionDialog } from '../dialogs/PTimeframeSelectionDialog';

import { ReportNames, UIConstants } from '../../../constants';
import { DataFormatter, DateWithoutTime, SimpleObjectMap } from '../../../utilities';
import { IEntitiesCollection, IReportState } from '../../../interfaces/state';

export interface PReportsToolbarProps {
	dataFormatter:DataFormatter;
	selectedReport:string;
	reportState:IReportState;
	entitiesCollection:IEntitiesCollection;

	setReportState(reportState:IReportState):void;
}

const ReportsToolbarContainerStyle:React.CSSProperties = {
	flex: '0 0 auto',
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '45px',
	width: '100%',
	backgroundColor: "#FFFFFF",
	paddingLeft: '20px',
	paddingRight: '20px',
	borderStyle: "solid",
	borderColor: UIConstants.BorderColor,
	borderWidth: "0px",
	borderBottomWidth: "1px",
}

const ButtonDefaultStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: 'center',
	fontSize: "16px",
	fontWeight: "normal",
	color: "#009cc2",
	marginRight: "20px",
	cursor: "pointer"
}

const ButtonHoverStyle = Object.assign({}, ButtonDefaultStyle, {
	color: "#005076"
});

const ButtonDisabledStyle = Object.assign({}, ButtonDefaultStyle, {
	color: "#DEE3E8",
	cursor: "default"
});

const GlyphStyle:React.CSSProperties = {
	fontSize: "12px",
	marginLeft: "5px"
}

export class PReportsToolbar extends React.Component<PReportsToolbarProps, {}> {

	private accountsSelectionButton:PHoverableDiv;
	private categoriesSelectionButton:PHoverableDiv;
	private timeframeSelectionButton:PHoverableDiv;

	private accountSelectionDialog:PAccountSelectionDialog;
	private categorySelectionDialog:PCategorySelectionDialog;
	private timeframeSelectionDialog:PTimeframeSelectionDialog;

	constructor(props:PReportsToolbarProps) {
		super(props);
		this.handleCategorySelectionButtonClicked = this.handleCategorySelectionButtonClicked.bind(this);
		this.handleTimeframeSelectionButtonClicked = this.handleTimeframeSelectionButtonClicked.bind(this);
		this.handleAccountSelectionButtonClicked = this.handleAccountSelectionButtonClicked.bind(this);
	}

	private handleCategorySelectionButtonClicked(event:React.MouseEvent<any>):void {

		if(this.categorySelectionDialog.isShowing() == false)
			this.categorySelectionDialog.show(this.props.selectedReport, this.props.reportState, this.categoriesSelectionButton.getRootElement(), "bottom");
	}

	private handleTimeframeSelectionButtonClicked(event:React.MouseEvent<any>):void {

		if(this.timeframeSelectionDialog.isShowing() == false)
			this.timeframeSelectionDialog.show(this.props.selectedReport, this.props.reportState, this.timeframeSelectionButton.getRootElement(), "bottom");
	}

	private handleAccountSelectionButtonClicked(event:React.MouseEvent<any>):void {

		if(this.accountSelectionDialog.isShowing() == false)
			this.accountSelectionDialog.show(this.props.selectedReport, this.props.reportState, this.accountsSelectionButton.getRootElement(), "bottom");
	}
	
	public render() {
		
		var reportState = this.props.reportState;
		var accountsSelectionButtonLabel:string;
		var categoriesSelectionButtonLabel:string;
		var timeframeSelectionButtonLabel:string;

		if(reportState.allAccountsSelected)
			accountsSelectionButtonLabel = "All Accounts";
		else if(reportState.noAccountsSelected)
			accountsSelectionButtonLabel = "No Accounts";
		else
			accountsSelectionButtonLabel = "Some Accounts";

		if(reportState.allCategoriesSelected)
			categoriesSelectionButtonLabel = "All Categories";
		else if(reportState.noCategoriesSelected)
			categoriesSelectionButtonLabel = "No Categories";
		else
			categoriesSelectionButtonLabel = "Some Categories";

		var startDate = reportState.startDate;
		var endDate = reportState.endDate;
		timeframeSelectionButtonLabel = `${startDate.format("MMM YYYY")} - ${endDate.format("MMM YYYY")}`;

		return (
			<div style={ReportsToolbarContainerStyle}>

				<PHoverableDiv ref={(b)=> this.categoriesSelectionButton = b }
					defaultStyle={ButtonDefaultStyle} 
					hoverStyle={ButtonHoverStyle} 
					disabledStyle={ButtonDisabledStyle}
					enabled={this.props.selectedReport != ReportNames.NetWorth}
					onClick={this.handleCategorySelectionButtonClicked}>
					{categoriesSelectionButtonLabel}
					<Glyphicon glyph="triangle-bottom" style={GlyphStyle} />
				</PHoverableDiv> 

				<PHoverableDiv ref={(b)=> this.timeframeSelectionButton = b }
					defaultStyle={ButtonDefaultStyle} 
					hoverStyle={ButtonHoverStyle} 
					disabledStyle={ButtonDisabledStyle}
					onClick={this.handleTimeframeSelectionButtonClicked}>
					{timeframeSelectionButtonLabel}
					<Glyphicon glyph="triangle-bottom" style={GlyphStyle} />
				</PHoverableDiv> 

				<PHoverableDiv ref={(b)=> this.accountsSelectionButton = b }
					defaultStyle={ButtonDefaultStyle} 
					hoverStyle={ButtonHoverStyle} 
					disabledStyle={ButtonDisabledStyle}
					onClick={this.handleAccountSelectionButtonClicked}>
					{accountsSelectionButtonLabel}
					<Glyphicon glyph="triangle-bottom" style={GlyphStyle} />
				</PHoverableDiv> 

				<PCategorySelectionDialog 
					ref={(d)=> this.categorySelectionDialog = d }
					entitiesCollection={this.props.entitiesCollection}
					setReportState={this.props.setReportState}
				/>

				<PAccountSelectionDialog 
					ref={(d)=> this.accountSelectionDialog = d }
					entitiesCollection={this.props.entitiesCollection}
					setReportState={this.props.setReportState}
				/>

				<PTimeframeSelectionDialog 
					ref={(d)=> this.timeframeSelectionDialog = d }
					entitiesCollection={this.props.entitiesCollection}
					setReportState={this.props.setReportState}
				/>
			</div>
		);
	}
}