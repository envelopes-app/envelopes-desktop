/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ControlLabel, FormControl, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { PHoverableDiv } from '../../common/PHoverableDiv';

import { DateWithoutTime } from '../../../utilities';
import { RegisterFilterTimeFrame } from '../../../constants';
import { IReportState, IEntitiesCollection } from '../../../interfaces/state';

export interface PTimeframeSelectionDialogProps {
	entitiesCollection:IEntitiesCollection;
	setReportState(reportState:IReportState):void;
}

export interface PTimeframeSelectionDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	selectedReport:string;
	reportState:IReportState;
	selectedTimeframe:string;
	startDate:DateWithoutTime;
	endDate:DateWithoutTime;
	minMonth:DateWithoutTime;
	maxMonth:DateWithoutTime;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'500px'
}

const TitleStyle:React.CSSProperties = {
	width: "100%",
	color: "#000000",
	fontSize: "18px",
	fontWeight: "normal"
}

const Separator1Style:React.CSSProperties = {
	marginTop: "0px",
	marginBottom: "8px"
}

const Separator2Style:React.CSSProperties = {
	marginTop: "8px",
	marginBottom: "8px"
}

const SelectionButtonsContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: 'flex-start',
	alignItems: 'center',
}

const SelectionButtonDefaultStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#009cc2",
	backgroundColor: "#FFFFFF",
	paddingLeft: '8px',
	paddingRight: '8px',
	paddingTop: '3px',
	paddingBottom: '3px',
	borderRadius: "100px",
	marginRight: "5px",
	cursor: "pointer"
}

const SelectionButtonHoverStyle = Object.assign({}, SelectionButtonDefaultStyle, {
	color: "#FFFFFF",
	backgroundColor: "#009cc2"
});

const SelectionButtonSelectedStyle = Object.assign({}, SelectionButtonHoverStyle, {
	cursor: "default"
});

const ControlsContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "center",
	width: "100%"
}

const FormControlStyle:React.CSSProperties = {
	borderColor: "#88979d",
	backgroundColor: "f8f8f8",
	borderWidth: "2px",
	borderRadius: "3px",
	marginRight: "5px",
	height: "30px"
}

const MonthSelectionFormControlStyle:React.CSSProperties = Object.assign({}, FormControlStyle, {
	width: "25%"
});

const YearSelectionFormControlStyle:React.CSSProperties = Object.assign({}, FormControlStyle, {
	width: "15%"
});

const DialogButtonsContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: 'flex-end',
	alignItems: 'center',
}

export class PTimeframeSelectionDialog extends React.Component<PTimeframeSelectionDialogProps, PTimeframeSelectionDialogState> {

	constructor(props:PTimeframeSelectionDialogProps) {
        super(props);
		this.hide = this.hide.bind(this);
		this.handleThisMonthClicked = this.handleThisMonthClicked.bind(this);
		this.handleLatest3MonthsClicked = this.handleLatest3MonthsClicked.bind(this);
		this.handleThisYearClicked = this.handleThisYearClicked.bind(this);
		this.handleLastYearClicked = this.handleLastYearClicked.bind(this);
		this.handleAllDatesClicked = this.handleAllDatesClicked.bind(this);
		this.onFromMonthChange = this.onFromMonthChange.bind(this);
		this.onFromYearChange = this.onFromYearChange.bind(this);
		this.onToMonthChange = this.onToMonthChange.bind(this);
		this.onToYearChange = this.onToYearChange.bind(this);
		this.handleCancelClicked = this.handleCancelClicked.bind(this);
		this.handleOkClicked = this.handleOkClicked.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"bottom",
			selectedReport: null,
			reportState: null,
			selectedTimeframe: null,
			startDate: null,
			endDate: null,
			minMonth: null,
			maxMonth: null
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}
	
	public show(selectedReport:string, reportState:IReportState, target:HTMLElement, placement:string = "left"):void {

		var minMonth = this.props.entitiesCollection.monthlyBudgets.getMinMonth();
		var maxMonth= this.props.entitiesCollection.monthlyBudgets.getMaxMonth(); 

		// Get the subCategory for the passed subCategoryId
		var state = Object.assign({}, this.state) as PTimeframeSelectionDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		state.selectedReport = selectedReport;
		state.reportState = reportState;
		state.selectedTimeframe = reportState.selectedTimeframe;
		state.startDate = reportState.startDate.clone();
		state.endDate = reportState.endDate.clone();
		state.minMonth = minMonth.clone();
		state.maxMonth = maxMonth.clone();
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PTimeframeSelectionDialogState;
		state.show = false;
		state.selectedReport = null;
		state.reportState = null;
		state.selectedTimeframe = null;
		state.startDate = null;
		state.endDate = null;
		state.minMonth = null;
		state.maxMonth = null;
		this.setState(state);
	}

	private handleThisMonthClicked(event:React.MouseEvent<any>):void {

		var reportState = this.state.reportState;
		reportState.selectedTimeframe = RegisterFilterTimeFrame.ThisMonth;
		reportState.startDate = DateWithoutTime.createForCurrentMonth();
		reportState.endDate = DateWithoutTime.createForCurrentMonth();
		this.props.setReportState(reportState);
		this.hide();
	}

	private handleLatest3MonthsClicked(event:React.MouseEvent<any>):void {

		var reportState = this.state.reportState;
		reportState.selectedTimeframe = RegisterFilterTimeFrame.LatestThreeMonths;
		reportState.startDate = DateWithoutTime.createForCurrentMonth().subtractMonths(2);
		reportState.endDate = DateWithoutTime.createForCurrentMonth();
		this.props.setReportState(reportState);
		this.hide();
	}

	private handleThisYearClicked(event:React.MouseEvent<any>):void {

		var reportState = this.state.reportState;
		reportState.selectedTimeframe = RegisterFilterTimeFrame.ThisYear;
		reportState.startDate = DateWithoutTime.createForCurrentMonth().setMonth(0);
		reportState.endDate = DateWithoutTime.createForCurrentMonth().setMonth(11);
		this.props.setReportState(reportState);
		this.hide();
	}

	private handleLastYearClicked(event:React.MouseEvent<any>):void {

		var reportState = this.state.reportState;
		reportState.selectedTimeframe = RegisterFilterTimeFrame.LastYear;
		reportState.startDate = DateWithoutTime.createForCurrentMonth().setMonth(0).subtractYears(1);
		reportState.endDate = DateWithoutTime.createForCurrentMonth().setMonth(11).subtractYears(1);
		this.props.setReportState(reportState);
		this.hide();
	}

	private handleAllDatesClicked(event:React.MouseEvent<any>):void {

		var reportState = this.state.reportState;
		reportState.selectedTimeframe = RegisterFilterTimeFrame.AllDates;
		reportState.startDate = this.state.minMonth.clone();
		reportState.endDate = this.state.maxMonth.clone();
		this.props.setReportState(reportState);
		this.hide();
	}

	private handleCancelClicked(event:React.MouseEvent<any>):void {
		this.hide();
	}

	private handleOkClicked(event:React.MouseEvent<any>):void {

		// Set the updated values back in the report state and send it back to the parent component
		var reportState = this.state.reportState;
		reportState.selectedTimeframe = this.state.selectedTimeframe;
		reportState.startDate = this.state.startDate.clone();
		reportState.endDate = this.state.endDate.clone();
		this.props.setReportState(reportState);
		this.hide();
	}

	private onFromMonthChange(event:React.FormEvent<any>):void {

		var value = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state) as PTimeframeSelectionDialogState;
		state.startDate.setMonth( parseInt(value) );
		state.selectedTimeframe = RegisterFilterTimeFrame.Custom;
		this.setState(state);
	}

	private onFromYearChange(event:React.FormEvent<any>):void {

		var value = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state) as PTimeframeSelectionDialogState;
		state.startDate.setYear( parseInt(value) );
		state.selectedTimeframe = RegisterFilterTimeFrame.Custom;
		this.setState(state);
	}

	private onToMonthChange(event:React.FormEvent<any>):void {

		var value = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state) as PTimeframeSelectionDialogState;
		state.endDate.setMonth( parseInt(value) );
		state.selectedTimeframe = RegisterFilterTimeFrame.Custom;
		this.setState(state);
	}

	private onToYearChange(event:React.FormEvent<any>):void {

		var value = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state) as PTimeframeSelectionDialogState;
		state.endDate.setYear( parseInt(value) );
		state.selectedTimeframe = RegisterFilterTimeFrame.Custom;
		this.setState(state);
	}

	public render() {

		if(this.state.show) {

			var yearOptions:Array<JSX.Element> = [];
			var minYear = this.state.minMonth.getYear() - 1;
			var maxYear = this.state.maxMonth.getYear() + 1;
			for(var i = minYear; i <= maxYear; i++) {
				var option = <option key={i} value={i}>{i.toString()}</option>;
				yearOptions.push(option);
			}

			var startDate = this.state.startDate;
			var endDate = this.state.endDate;
			// Get the string values for month and years from the above dates 
			var fromMonth = startDate.getMonth().toString();
			var fromYear = startDate.getYear().toString();
			var toMonth = endDate.getMonth().toString();
			var toYear = endDate.getYear().toString();

			return (
				<Overlay key="overlay" rootClose={true} show={this.state.show} placement={this.state.placement} 
					onHide={this.hide} target={ ()=> ReactDOM.findDOMNode(this.state.target) }>
					<Popover id="selectReportTimeframePopover" style={PopoverStyle}>
						<div style={TitleStyle}>Timeframe</div>
						<hr style={Separator1Style} />

						<div style={SelectionButtonsContainer}>
							<PHoverableDiv 
								defaultStyle={SelectionButtonDefaultStyle} 
								hoverStyle={SelectionButtonHoverStyle} 
								selectedStyle={SelectionButtonSelectedStyle}
								selected={this.state.selectedTimeframe == RegisterFilterTimeFrame.ThisMonth}
								onClick={this.handleThisMonthClicked}>
								This Month
							</PHoverableDiv> 
							<PHoverableDiv 
								defaultStyle={SelectionButtonDefaultStyle} 
								hoverStyle={SelectionButtonHoverStyle} 
								selectedStyle={SelectionButtonSelectedStyle}
								selected={this.state.selectedTimeframe == RegisterFilterTimeFrame.LatestThreeMonths}
								onClick={this.handleLatest3MonthsClicked}>
								Latest 3 Months
							</PHoverableDiv> 
							<PHoverableDiv 
								defaultStyle={SelectionButtonDefaultStyle} 
								hoverStyle={SelectionButtonHoverStyle} 
								selectedStyle={SelectionButtonSelectedStyle}
								selected={this.state.selectedTimeframe == RegisterFilterTimeFrame.ThisYear}
								onClick={this.handleThisYearClicked}>
								This Year
							</PHoverableDiv> 
							<PHoverableDiv 
								defaultStyle={SelectionButtonDefaultStyle} 
								hoverStyle={SelectionButtonHoverStyle} 
								selectedStyle={SelectionButtonSelectedStyle}
								selected={this.state.selectedTimeframe == RegisterFilterTimeFrame.LastYear}
								onClick={this.handleLastYearClicked}>
								Last Year
							</PHoverableDiv> 
							<PHoverableDiv 
								defaultStyle={SelectionButtonDefaultStyle} 
								hoverStyle={SelectionButtonHoverStyle} 
								selectedStyle={SelectionButtonSelectedStyle}
								selected={this.state.selectedTimeframe == RegisterFilterTimeFrame.AllDates}
								onClick={this.handleAllDatesClicked}>
								All Dates
							</PHoverableDiv> 
						</div>
						<hr style={Separator2Style} />

						<div style={ControlsContainerStyle}>
							<ControlLabel>From:&nbsp;</ControlLabel>
							<FormControl type="text" componentClass="select" style={MonthSelectionFormControlStyle} 
								value={fromMonth} onChange={this.onFromMonthChange}>
								<option value="0">January</option>
								<option value="1">February</option>
								<option value="2">March</option>
								<option value="3">April</option>
								<option value="4">May</option>
								<option value="5">June</option>
								<option value="6">July</option>
								<option value="7">August</option>
								<option value="8">September</option>
								<option value="9">October</option>
								<option value="10">November</option>
								<option value="11">December</option>
							</FormControl>
							<FormControl type="text" componentClass="select" style={YearSelectionFormControlStyle} 
								value={fromYear} onChange={this.onFromYearChange}>
								{yearOptions}
							</FormControl>
							<ControlLabel>To:&nbsp;</ControlLabel>
							<FormControl type="text" componentClass="select" style={MonthSelectionFormControlStyle} 
								value={toMonth} onChange={this.onToMonthChange}>
								<option value="0">January</option>
								<option value="1">February</option>
								<option value="2">March</option>
								<option value="3">April</option>
								<option value="4">May</option>
								<option value="5">June</option>
								<option value="6">July</option>
								<option value="7">August</option>
								<option value="8">September</option>
								<option value="9">October</option>
								<option value="10">November</option>
								<option value="11">December</option>
							</FormControl>
							<FormControl type="text" componentClass="select" style={YearSelectionFormControlStyle} 
								value={toYear} onChange={this.onToYearChange}>
								{yearOptions}
							</FormControl>
						</div> 

						<hr style={Separator2Style} />
						<div className="buttons-container">
							<div className="spacer" />
							<button className="dialog-secondary-button" onClick={this.handleCancelClicked}> 
								Cancel&nbsp;<Glyphicon glyph="remove-circle"/>
							</button>
							<div style={{width:"8px"}} />
							<button className="dialog-primary-button" onClick={this.handleOkClicked}> 
								Done&nbsp;<Glyphicon glyph="ok-circle"/>
							</button>
						</div>
					</Popover>
				</Overlay>
			);
		}
		else {
			return <div />;
		}
	}
}
