/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Checkbox, ControlLabel, FormControl, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { DateWithoutTime } from '../../../utilities';

export interface PFilterTransactionsDialogProps {
}

export interface PFilterTransactionsDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;

	fromMonth?:string;
	fromYear?:string;
	toMonth?:string;
	toYear?:string;
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
		this.onOkClick = this.onOkClick.bind(this);
		this.onCancelClick = this.onCancelClick.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"bottom"
		};
	}

	private onOkClick():void { 
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

	public show(target:HTMLElement, placement:string = "bottom"):void {

		var state = Object.assign({}, this.state) as PFilterTransactionsDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
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
			var currentMonth = DateWithoutTime.createForCurrentMonth();
			for(var i = currentMonth.getYear(), j = 0; j < 20; i++,j++) {
				var option = <option key={j} value={i}>{i.toString()}</option>;
				yearOptions.push(option);
			}

			return (
				<Overlay key="overlay" rootClose={true} show={this.state.show} placement={this.state.placement} 
					onHide={this.hide} target={ ()=> ReactDOM.findDOMNode(this.state.target) }>
					<Popover id="filterTransactions" style={PopoverStyle}>
						<div style={TitleStyle}>Filter Transactions</div>
						<hr style={Separator1Style} />
						<div style={SectionContainerStyle}>
							<button className="filterdialog-preset-button">This Month</button>
							<button className="filterdialog-preset-button">Latest 3 Months</button>
							<button className="filterdialog-preset-button">This Year</button>
							<button className="filterdialog-preset-button">Last Year</button>
							<button className="filterdialog-preset-button">All Dates</button>
						</div> 
						<hr style={Separator2Style} />
						<div style={SectionContainerStyle}>
							<ControlLabel>From:&nbsp;</ControlLabel>
							<FormControl type="text" componentClass="select" style={MonthSelectionFormControlStyle} 
								value={this.state.fromMonth} onChange={null}>
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
								value={this.state.fromYear} onChange={null}>
								{yearOptions}
							</FormControl>
							<ControlLabel>To:&nbsp;</ControlLabel>
							<FormControl type="text" componentClass="select" style={MonthSelectionFormControlStyle} 
								value={this.state.toMonth} onChange={null}>
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
								value={this.state.toYear} onChange={null}>
								{yearOptions}
							</FormControl>
						</div> 
						<hr style={Separator2Style} />
						<div style={SectionContainerStyle}>
							<ControlLabel style={{marginBottom:"0px"}}>Show:&nbsp;</ControlLabel>
							<Checkbox style={CheckBoxTextStyle} inline>Reconciled Transactions</Checkbox>
							<Checkbox style={CheckBoxTextStyle} inline>Scheduled Transactions</Checkbox>
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