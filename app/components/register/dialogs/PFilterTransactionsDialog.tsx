/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Checkbox, ControlLabel, FormControl, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { IRegisterState } from '../../../interfaces/state';
import { DateWithoutTime } from '../../../utilities';
import { RegisterFilterTimeFrame } from '../../../constants';

export interface PFilterTransactionsDialogProps {
	minMonth:DateWithoutTime;
	maxMonth:DateWithoutTime;

	updateFilterTransactionSettings:(
		timeFrame:string, 
		startDate:DateWithoutTime, 
		endDate:DateWithoutTime, 
		showReconciled:boolean, 
		showScheduled:boolean
	)=>void;
}

export interface PFilterTransactionsDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;

	toMonth:string;
	toYear:string;
	fromMonth:string;
	fromYear:string;
	selectedTimeFrame:string;
	showReconciledTransactions:boolean;
	showScheduledTransactions:boolean;
}

const PopoverStyle = {
	maxWidth: 'none',
	width:'500px'
}

const TitleStyle = {
	width: "100%",
	color: "#000000",
	fontSize: "20px",
}

const Separator1Style = {
	marginTop: "0px",
	marginBottom: "8px"
}

const Separator2Style = {
	marginTop: "8px",
	marginBottom: "8px",
}

const SectionContainerStyle = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "center",
	width: "100%"
}

const FormControlStyle = {
	borderColor: "#88979d",
	backgroundColor: "f8f8f8",
	borderWidth: "2px",
	borderRadius: "3px",
	marginRight: "5px",
	height: "30px"
}

const MonthSelectionFormControlStyle = Object.assign({}, FormControlStyle, {
	width: "25%"
});

const YearSelectionFormControlStyle = Object.assign({}, FormControlStyle, {
	width: "15%"
});

const CheckBoxTextStyle = {
	fontSize: "16px",
	fontWeight: "normal"
}

const OkButtonStyle = {
	marginLeft: "10px"
}

export class PFilterTransactionsDialog extends React.Component<PFilterTransactionsDialogProps, PFilterTransactionsDialogState> {

	constructor(props: any) {
        super(props);
		this.hide = this.hide.bind(this);
		this.onShowReconciledTransactionsSelectionChange = this.onShowReconciledTransactionsSelectionChange.bind(this);
		this.onShowScheduledTransactionsSelectionChange = this.onShowScheduledTransactionsSelectionChange.bind(this);
		this.onFromMonthChange = this.onFromMonthChange.bind(this);
		this.onFromYearChange = this.onFromYearChange.bind(this);
		this.onToMonthChange = this.onToMonthChange.bind(this);
		this.onToYearChange = this.onToYearChange.bind(this);
		this.onOkClick = this.onOkClick.bind(this);
		this.onCancelClick = this.onCancelClick.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"bottom",
			toMonth: "0",
			toYear: "0",
			fromMonth: "0",
			fromYear: "0",
			selectedTimeFrame: RegisterFilterTimeFrame.LatestThreeMonths,
			showReconciledTransactions: false,
			showScheduledTransactions: false
		};
	}

	private setPresetTimeFrame(timeFrame:string):void {

		var startDate:DateWithoutTime;
		var endDate:DateWithoutTime;
		// Update the date fields based on the selected timeframe
		switch(timeFrame) {

			case RegisterFilterTimeFrame.ThisMonth:
				startDate = DateWithoutTime.createForCurrentMonth();
				endDate = DateWithoutTime.createForCurrentMonth();
				break;

			case RegisterFilterTimeFrame.LatestThreeMonths:
				startDate = DateWithoutTime.createForCurrentMonth().subtractMonths(2);
				endDate = DateWithoutTime.createForCurrentMonth();
				break;

			case RegisterFilterTimeFrame.ThisYear:
				startDate = DateWithoutTime.createForCurrentMonth().setMonth(0);
				endDate = DateWithoutTime.createForCurrentMonth().setMonth(11);
				break;

			case RegisterFilterTimeFrame.LastYear:
				startDate = DateWithoutTime.createForCurrentMonth().setMonth(0).subtractYears(1);
				endDate = DateWithoutTime.createForCurrentMonth().setMonth(11).subtractYears(1);
				break;

			case RegisterFilterTimeFrame.AllDates:
				startDate = this.props.minMonth.clone();
				endDate = this.props.maxMonth.clone();
				break;
		}

		// Pass the settings back to the register
		this.props.updateFilterTransactionSettings(
			timeFrame,
			startDate,
			endDate,
			this.state.showReconciledTransactions,
			this.state.showScheduledTransactions
		);

		// Hide the dialog
		this.hide();
	}

	private onShowReconciledTransactionsSelectionChange(event:React.SyntheticEvent):void {

		var element = event.target as HTMLInputElement;
		var state = Object.assign({}, this.state) as PFilterTransactionsDialogState;
		state.showReconciledTransactions = element.checked;
		this.setState(state);
	}

	private onShowScheduledTransactionsSelectionChange(event:React.SyntheticEvent):void {

		var element = event.target as HTMLInputElement;
		var state = Object.assign({}, this.state) as PFilterTransactionsDialogState;
		state.showScheduledTransactions = element.checked;
		this.setState(state);
	}

	private onFromMonthChange(event:React.SyntheticEvent):void {

		var value = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state) as PFilterTransactionsDialogState;
		state.fromMonth = value;
		state.selectedTimeFrame = RegisterFilterTimeFrame.Custom;
		this.setState(state);
	}

	private onFromYearChange(event:React.SyntheticEvent):void {

		var value = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state);
		state.fromYear = value;
		state.selectedTimeFrame = RegisterFilterTimeFrame.Custom;
		this.setState(state);
	}

	private onToMonthChange(event:React.SyntheticEvent):void {

		var value = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state) as PFilterTransactionsDialogState;
		state.toMonth = value;
		state.selectedTimeFrame = RegisterFilterTimeFrame.Custom;
		this.setState(state);
	}

	private onToYearChange(event:React.SyntheticEvent):void {

		var value = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state);
		state.toYear = value;
		state.selectedTimeFrame = RegisterFilterTimeFrame.Custom;
		this.setState(state);
	}

	private onOkClick():void { 

		var fromMonth = parseInt(this.state.fromMonth) + 1;
		var toMonth = parseInt(this.state.toMonth) + 1;
		// Take the values from the local state and pass them back to the register
		var startDate = DateWithoutTime.createFromISOString(`${this.state.fromYear}-01-01`).setMonth(fromMonth);
		var endDate = DateWithoutTime.createFromISOString(`${this.state.toYear}-01-01`).setMonth(toMonth);
		this.props.updateFilterTransactionSettings(
			this.state.selectedTimeFrame,
			startDate,
			endDate,
			this.state.showReconciledTransactions,
			this.state.showScheduledTransactions
		);

		// Hide the dialog
		this.hide();
	}

	private onCancelClick():void { 
		// Hide the dialog
		this.hide();
	}

	public isShowing():boolean {
		return this.state.show;
	}

	public show(registerState:IRegisterState, target:HTMLElement, placement:string = "bottom"):void {

		var state = Object.assign({}, this.state) as PFilterTransactionsDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		// Copy the values from the passed register state object into the local state
		state.selectedTimeFrame = registerState.filterSelectedTimeFrame;
		state.fromMonth = registerState.filterStartDate.getMonth().toString()
		state.fromYear = registerState.filterStartDate.getYear().toString()
		state.toMonth = registerState.filterEndDate.getMonth().toString()
		state.toYear = registerState.filterEndDate.getYear().toString()
		state.showReconciledTransactions = registerState.filterShowReconciledTransactions;
		state.showScheduledTransactions = registerState.filterShowScheduledTransactions;
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PFilterTransactionsDialogState;
		state.show = false;
		this.setState(state);
	}

	public render() {

		if(this.state.show) {

			var yearOptions:Array<JSX.Element> = [];
			var minYear = this.props.minMonth.getYear() - 1;
			var maxYear = this.props.maxMonth.getYear() + 1;
			for(var i = minYear; i <= maxYear; i++) {
				var option = <option key={i} value={i}>{i.toString()}</option>;
				yearOptions.push(option);
			}

			return (
				<Overlay key="overlay" rootClose={true} show={this.state.show} placement={this.state.placement} 
					onHide={this.hide} target={ ()=> ReactDOM.findDOMNode(this.state.target) }>
					<Popover id="filterTransactions" style={PopoverStyle}>
						<div style={TitleStyle}>Filter Transactions</div>
						<hr style={Separator1Style} />
						<div style={SectionContainerStyle}>
							<button className={this.state.selectedTimeFrame == RegisterFilterTimeFrame.ThisMonth ? "filterdialog-preset-button-selected" : "filterdialog-preset-button"} onClick={this.setPresetTimeFrame.bind(this, RegisterFilterTimeFrame.ThisMonth)}>This Month</button>
							<button className={this.state.selectedTimeFrame == RegisterFilterTimeFrame.LatestThreeMonths ? "filterdialog-preset-button-selected" : "filterdialog-preset-button"} onClick={this.setPresetTimeFrame.bind(this, RegisterFilterTimeFrame.LatestThreeMonths)}>Latest 3 Months</button>
							<button className={this.state.selectedTimeFrame == RegisterFilterTimeFrame.ThisYear ? "filterdialog-preset-button-selected" : "filterdialog-preset-button"} onClick={this.setPresetTimeFrame.bind(this, RegisterFilterTimeFrame.ThisYear)}>This Year</button>
							<button className={this.state.selectedTimeFrame == RegisterFilterTimeFrame.LastYear ? "filterdialog-preset-button-selected" : "filterdialog-preset-button"} onClick={this.setPresetTimeFrame.bind(this, RegisterFilterTimeFrame.LastYear)}>Last Year</button>
							<button className={this.state.selectedTimeFrame == RegisterFilterTimeFrame.AllDates ? "filterdialog-preset-button-selected" : "filterdialog-preset-button"} onClick={this.setPresetTimeFrame.bind(this, RegisterFilterTimeFrame.AllDates)}>All Dates</button>
						</div> 
						<hr style={Separator2Style} />
						<div style={SectionContainerStyle}>
							<ControlLabel>From:&nbsp;</ControlLabel>
							<FormControl type="text" componentClass="select" style={MonthSelectionFormControlStyle} 
								value={this.state.fromMonth} onChange={this.onFromMonthChange}>
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
								value={this.state.fromYear} onChange={this.onFromYearChange}>
								{yearOptions}
							</FormControl>
							<ControlLabel>To:&nbsp;</ControlLabel>
							<FormControl type="text" componentClass="select" style={MonthSelectionFormControlStyle} 
								value={this.state.toMonth} onChange={this.onToMonthChange}>
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
								value={this.state.toYear} onChange={this.onToYearChange}>
								{yearOptions}
							</FormControl>
						</div> 
						<hr style={Separator2Style} />
						<div style={SectionContainerStyle}>
							<ControlLabel style={{marginBottom:"0px"}}>Show:&nbsp;</ControlLabel>
							<Checkbox style={CheckBoxTextStyle} inline={true} 
								checked={this.state.showReconciledTransactions}
								onChange={this.onShowReconciledTransactionsSelectionChange}>
								Reconciled Transactions
							</Checkbox>
							<Checkbox style={CheckBoxTextStyle} inline={true} 
								checked={this.state.showScheduledTransactions}
								onChange={this.onShowScheduledTransactionsSelectionChange}>
								Scheduled Transactions
							</Checkbox>
						</div> 
						<hr style={Separator2Style} />
						<div className="buttons-container">
							<div className="spacer" />
							<Button className="dialog-secondary-button" onClick={this.onCancelClick}> 
								Cancel&nbsp;<Glyphicon glyph="remove-circle"/>
							</Button>
							<Button className="dialog-primary-button" style={OkButtonStyle} onClick={this.onOkClick}> 
								OK&nbsp;<Glyphicon glyph="ok-circle"/>
							</Button>
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