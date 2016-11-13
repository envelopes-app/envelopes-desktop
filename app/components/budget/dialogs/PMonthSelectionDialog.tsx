/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, FormGroup, FormControl, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { DateWithoutTime } from '../../../utilities/';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PMonthSelectionDialogProps {
	currentMonth:DateWithoutTime;
	minMonth:DateWithoutTime;
	maxMonth:DateWithoutTime;
	setSelectedMonth:(month:DateWithoutTime)=>void;
}

export interface PMonthSelectionDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	showingYear:number;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'233px'
}

const NavigationButtonsContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",	
	width: "100%",
	justifyContent: "space-between",
	alignItems: "center"
}

const YearNameLabelStyle:React.CSSProperties = {
	flex: "0 0 auto",
	fontSize: "18px",
}

const HRStyle:React.CSSProperties = {
	width: "100%",
	marginTop: "0px",
	marginBottom: "10px",
}

const MonthButtonsContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row wrap",	
	width: "100%"
}

export class PMonthSelectionDialog extends React.Component<PMonthSelectionDialogProps, PMonthSelectionDialogState> {

	constructor(props: any) {
        super(props);
		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
		this.handleNavigateBack = this.handleNavigateBack.bind(this);
		this.handleNavigateForward = this.handleNavigateForward.bind(this);
		this.handleMonthSelection = this.handleMonthSelection.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"left",
			showingYear: 0 
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}

	public show(target:HTMLElement, placement:string = "bottom"):void {

		var state = Object.assign({}, this.state) as PMonthSelectionDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		state.showingYear = this.props.currentMonth.getYear();
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PMonthSelectionDialogState;
		state.show = false;
		this.setState(state);
	}

	private getClassNameForMonthButton(month:number):string {

		// Get the currently showing year from state
		var year = this.state.showingYear;
		var date = DateWithoutTime.createFromISOString(`${year}-${month}-01`);
		if(date.equalsByMonth(this.props.currentMonth))
			return "month-button-selected";
		else if(date.isBefore(this.props.minMonth) || date.isAfter(this.props.maxMonth))
			return "month-button-disabled";
		else
			return "month-button";
	}

	private handleNavigateBack():void {
		var state = Object.assign({}, this.state);
		state.showingYear--;
		this.setState(state);
	}

	private handleNavigateForward():void {
		var state = Object.assign({}, this.state);
		state.showingYear++;
		this.setState(state);
	}

	public handleMonthSelection(month:number):void {

		// Get the currently showing year from state
		var year = this.state.showingYear;
		var date = DateWithoutTime.createFromISOString(`${year}-${month}-01`);
		if(date.equalsByMonth(this.props.currentMonth) == false && 
			date.isBefore(this.props.minMonth) == false &&
			date.isAfter(this.props.maxMonth) == false) {

				this.props.setSelectedMonth(date);
				this.hide();
		}
	}

	public render() {

		if(this.state.show) {
			return (
				<Overlay show={this.state.show} onHide={this.hide} placement={this.state.placement} 
					rootClose={true} target={()=> ReactDOM.findDOMNode(this.state.target)}>
					<Popover id="monthSelectionDialog" style={PopoverStyle}>
						<div style={NavigationButtonsContainerStyle}>
							<button className="month-navigation-button" onClick={this.handleNavigateBack}>
								<Glyphicon glyph="circle-arrow-left"/>
							</button>
							<label style={YearNameLabelStyle}>{this.state.showingYear}</label>
							<button className="month-navigation-button" onClick={this.handleNavigateForward}>
								<Glyphicon glyph="circle-arrow-right"/>
							</button>
						</div>
						<hr style={HRStyle}/>
						<div style={MonthButtonsContainerStyle}>
							<button className={this.getClassNameForMonthButton(1)} onClick={this.handleMonthSelection.bind(this, 1)}>Jan</button>
							<button className={this.getClassNameForMonthButton(2)} onClick={this.handleMonthSelection.bind(this, 2)}>Feb</button>
							<button className={this.getClassNameForMonthButton(3)} onClick={this.handleMonthSelection.bind(this, 3)}>Mar</button>
							<button className={this.getClassNameForMonthButton(4)} onClick={this.handleMonthSelection.bind(this, 4)}>Apr</button>
							<button className={this.getClassNameForMonthButton(5)} onClick={this.handleMonthSelection.bind(this, 5)}>May</button>
							<button className={this.getClassNameForMonthButton(6)} onClick={this.handleMonthSelection.bind(this, 6)}>Jun</button>
							<button className={this.getClassNameForMonthButton(7)} onClick={this.handleMonthSelection.bind(this, 7)}>Jul</button>
							<button className={this.getClassNameForMonthButton(8)} onClick={this.handleMonthSelection.bind(this, 8)}>Aug</button>
							<button className={this.getClassNameForMonthButton(9)} onClick={this.handleMonthSelection.bind(this, 9)}>Sep</button>
							<button className={this.getClassNameForMonthButton(10)} onClick={this.handleMonthSelection.bind(this, 10)}>Oct</button>
							<button className={this.getClassNameForMonthButton(11)} onClick={this.handleMonthSelection.bind(this, 11)}>Nov</button>
							<button className={this.getClassNameForMonthButton(12)} onClick={this.handleMonthSelection.bind(this, 12)}>Dec</button>
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
