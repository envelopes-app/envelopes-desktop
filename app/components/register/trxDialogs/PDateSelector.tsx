/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as moment from 'moment';
import { Form, FormControl, FormGroup, Col, ControlLabel, Glyphicon, Overlay, Popover } from 'react-bootstrap';

var DatePicker:any = require('react-datepicker');

import { DateWithoutTime } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PDateSelectorProps { 
	selectedDate:DateWithoutTime;
	setSelectedDate:(date:DateWithoutTime)=>void;
	handleTabPressed:(shiftPressed:boolean)=>void;
}

export interface PDateSelectorState {
	showPopover:boolean;
}

const DateSelectorStyle = {
	borderColor: '#009CC2',
	borderTopWidth: '2px',
	borderBottomWidth: '2px',
	borderLeftWidth: '2px',
	borderRightWidth: '2px',
}

const PopoverStyle = {
	maxWidth: 'none'
}

export class PDateSelector extends React.Component<PDateSelectorProps, PDateSelectorState> {

	private dateInput:FormControl;

	constructor(props: any) {
        super(props);
		this.onBlur = this.onBlur.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onDateSelectionChange = this.onDateSelectionChange.bind(this);
		this.state = {showPopover:false};	
	}

	private onDateSelectionChange(date:moment.Moment):void {
		var newDate = DateWithoutTime.createFromMoment(date);
		this.props.setSelectedDate(newDate);
	}

	public showPopover():void {
		// If the popover is already showing then we dont need to do anything
		if(this.state.showPopover == false) {
			this.setState({showPopover:true});		
		}

		// Set the focus on the input control
		(ReactDOM.findDOMNode(this.dateInput) as any).focus();
	}

	public hidePopover():void {
		// If the popover is already hidden then we dont need to do anything
		if(this.state.showPopover == true) {
			this.setState({showPopover:false});		
		}
	}

	private onFocus() {
		// If the popover is not already showing, then show it.
		this.showPopover();
	}

	private onBlur() {
		// If the popover is showing, hide it.
		this.hidePopover();
	}

	private onChange() { }

	private onKeyDown(event:KeyboardEvent):void {

		if(this.state.showPopover == true && (event.keyCode >= 37 && event.keyCode <= 40)) {

			// Get the currently selected date
			var currentDate = this.props.selectedDate.clone();

			// Left Arrow Key
			if(event.keyCode == 37) {
				// Decrement the date by 1 day
				currentDate.subtractDays(1);
			}
			// Up Arrow Key
			if(event.keyCode == 38) {
				// Decrement the date by 7 days
				currentDate.subtractDays(7);
			}
			// Right Arrow Key
			if(event.keyCode == 39) {
				// Increment the date by 1 day
				currentDate.addDays(1);
			}
			// Down Arrow Key
			else if(event.keyCode == 40) {
				// Increment the date by 7 days
				currentDate.addDays(7);
			}

			// Update the selectedDate to be this new date
			this.props.setSelectedDate(currentDate);
		}
		// Tab Key
		else if(event.keyCode == 9) {
			// Prevent the default action from happening as we are manually handling it
			event.preventDefault();
			// Let the parent dialog know that tab was pressed
			this.props.handleTabPressed(event.shiftKey);
		}
	}

	public render() {
		return (
			<FormGroup onKeyDown={this.onKeyDown}>
				<Col componentClass={ControlLabel} sm={3}>
					Date
				</Col>
				<Col sm={9}>
					<FormControl ref={(n) => this.dateInput = n } type="text" componentClass="input" style={DateSelectorStyle} 
						onFocus={this.onFocus} onBlur={this.onBlur} onChange={this.onChange} contentEditable={false} 
						value={this.props.selectedDate.toISOString()} />
					<Overlay show={this.state.showPopover} placement="right" target={ ()=> ReactDOM.findDOMNode(this.dateInput) }>
						<Popover id="selectDatePopover" style={PopoverStyle}>
							<DatePicker inline onChange={this.onDateSelectionChange} selected={this.props.selectedDate.toUTCMoment()} />
						</Popover>
					</Overlay>
				</Col>
			</FormGroup>
		);
	}
}
