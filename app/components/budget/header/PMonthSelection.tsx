/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Glyphicon } from 'react-bootstrap';

import { PMonthSelectionDialog } from '../dialogs/PMonthSelectionDialog';
import { DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PMonthSelectionProps {
	currentMonth:DateWithoutTime;
	minMonth:DateWithoutTime;
	maxMonth:DateWithoutTime;
	setSelectedMonth:(month:DateWithoutTime)=>void;
}

export interface PMonthSelectionState {
	hoverState:boolean;
}

const MonthSelectionContainerStyle = {
	flex: '0 0 auto',
	backgroundColor: 'transparent',
	paddingLeft: '5px',
	paddingRight: '5px'
}

const MonthSelectionStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'center',
	alignItems: 'center',
	paddingRight: '5px'
}

const MonthNavigationButtonStyle = {
	color: "#23B2CE",
	borderColor: "transparent",
	backgroundColor: "transparent",
	fontSize: "26px",
	paddingLeft: "6px",
	paddingRight: "6px",
	outline: "none"
}

const MonthNavigationButtonDisabledStyle = {
	color: "#598797",
	borderColor: "transparent",
	backgroundColor: "transparent",
	fontSize: "26px",
	paddingLeft: "6px",
	paddingRight: "6px",
	outline: "none",
	cursor: "default"
}

const MonthNavigationMonthNameStyle = {
	color: "#FFFFFF",
	borderColor: "transparent",
	backgroundColor: "transparent",
	fontSize: "26px",
	paddingLeft: "6px",
	paddingRight: "6px",
	outline: "none"
}

const MonthNavigationDropDownGlyphStyle = {
	color: "#23B2CE",
	backgroundColor: "transparent",
	fontSize: "16px"
}

const BlankSpaceStyle = {
	flex: '1 1 auto'
}

export class PMonthSelection extends React.Component<PMonthSelectionProps, PMonthSelectionState> {

	private monthNameButton:HTMLButtonElement;
	private monthSelectionDialog:PMonthSelectionDialog;

	constructor(props: any) {
        super(props);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.handleNavigateBack = this.handleNavigateBack.bind(this);
		this.handleNavigateForward = this.handleNavigateForward.bind(this);
		this.handleShowMonthSelectionDropDown = this.handleShowMonthSelectionDropDown.bind(this);
		this.state = {hoverState:false};
	}
  
	private handleMouseEnter() {

		var state:any = _.assign({}, this.state);
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {

		var state:any = _.assign({}, this.state);
		state.hoverState = false;
		this.setState(state);
	}

	private handleNavigateBack():void {
		var month = this.props.currentMonth.clone().subtractMonths(1);
		this.props.setSelectedMonth(month);
	}

	private handleNavigateForward():void {
		var month = this.props.currentMonth.clone().addMonths(1);
		this.props.setSelectedMonth(month);
	}

	private handleShowMonthSelectionDropDown():void {
		this.monthSelectionDialog.show(this.monthNameButton);
	}
	
	public render() {

		var currentMonthName = this.props.currentMonth.format("MMM YYYY");

		var monthNavigationButtonStyle = Object.assign({}, MonthNavigationButtonStyle);
		var monthNavigationDropDownGlyphStyle = Object.assign({}, MonthNavigationDropDownGlyphStyle);

		// Update the colors if we are hovering over the control
		if(this.state.hoverState) {
			monthNavigationButtonStyle["color"] = "#22D4FF";
			monthNavigationDropDownGlyphStyle["color"] = "#22D4FF";
		}

		var backButton = <button style={monthNavigationButtonStyle} onClick={this.handleNavigateBack}><Glyphicon glyph="circle-arrow-left" /></button>;
		var forwardButton = <button style={monthNavigationButtonStyle} onClick={this.handleNavigateForward}><Glyphicon glyph="circle-arrow-right" /></button>;

		// If we are at the min/max months, then we need to set the corresponding navigation buttons
		// to a disabled state. 
		if(this.props.currentMonth.equalsByMonth(this.props.minMonth)) {
			// Disable the back button
			backButton = <button style={MonthNavigationButtonDisabledStyle}><Glyphicon glyph="circle-arrow-left" /></button>;
		}

		if(this.props.currentMonth.equalsByMonth(this.props.maxMonth)) {
			// Disable the forward button
			forwardButton = <button style={MonthNavigationButtonDisabledStyle}><Glyphicon glyph="circle-arrow-right" /></button>;
		}

    	return (
			<div style={MonthSelectionContainerStyle} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<div style={MonthSelectionStyle}>
					{backButton}
					<button style={MonthNavigationMonthNameStyle} ref={(b)=> this.monthNameButton = b} onClick={this.handleShowMonthSelectionDropDown} >
						{currentMonthName}&nbsp;
						<Glyphicon glyph="triangle-bottom" style={monthNavigationDropDownGlyphStyle} />
					</button>
					{forwardButton}
				</div>

				<PMonthSelectionDialog ref={(d)=> this.monthSelectionDialog = d} 
					currentMonth={this.props.currentMonth}
					minMonth={this.props.minMonth}
					maxMonth={this.props.maxMonth}
					setSelectedMonth={this.props.setSelectedMonth}
				/>
			</div>
		);
  	}
}