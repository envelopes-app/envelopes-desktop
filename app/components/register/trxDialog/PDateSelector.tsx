/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as moment from 'moment';
import { FormControl, FormGroup, Col, ControlLabel, Overlay, Popover } from 'react-bootstrap';

var DatePicker:any = require('react-datepicker');

import { DateWithoutTime } from '../../../utilities';
import { TransactionFrequency } from '../../../constants';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PDateSelectorProps { 
	activeField:string;
	selectedDate:DateWithoutTime;
	selectedFrequency:string;
	setActiveField?:(activeField:string)=>void;
	setSelectedDate:(date:DateWithoutTime)=>void;
	setSelectedFrequency:(frequency:string)=>void;
	handleTabPressed:(shiftPressed:boolean)=>void;
}

const DateSelectorStyle = {
	borderColor: '#2FA2B5',
	borderTopWidth: '2px',
	borderBottomWidth: '2px',
	borderLeftWidth: '2px',
	borderRightWidth: '2px',
}

const PopoverStyle = {
	maxWidth: 'none'
}

const RepeatDivStyle = {
	paddingTop:"5px"
}

const RepeatLabelStyle = {
	fontSize:"12px", 
	fontWeight:"bold"
}

const RepeatSelectStyle = {
	fontSize:"12px", 
	fontWeight:"normal",
	height:"28px"
}

export class PDateSelector extends React.Component<PDateSelectorProps, {}> {

	private dateInput:FormControl;
	private frequencySelection:FormControl;

	private minDate = new DateWithoutTime(2000, 0, 1);
	private maxDate = DateWithoutTime.createForCurrentMonth().addYears(5);

	constructor(props: any) {
        super(props);
		this.onFocus = this.onFocus.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onDateSelectionChange = this.onDateSelectionChange.bind(this);
		this.onFrequencyChange = this.onFrequencyChange.bind(this);
	}

	private onDateSelectionChange(date:moment.Moment):void {
		var newDate = DateWithoutTime.createFromMoment(date);
		this.props.setSelectedDate(newDate);
		this.setFocus();
	}

	private onFrequencyChange(event:React.SyntheticEvent):void {
		var frequencySelectionNode = (ReactDOM.findDOMNode(this.frequencySelection) as HTMLSelectElement);
		this.props.setSelectedFrequency(frequencySelectionNode.value);
		this.setFocus();
	}

	private onFocus():void {
		if(this.props.activeField != "date" && this.props.setActiveField)
			this.props.setActiveField("date");
	}

	public setFocus():void {
		// Set the focus on the input control
		var domNode = ReactDOM.findDOMNode(this.dateInput) as any;
		domNode.focus();
		domNode.select();
	}

	private onChange() {
		// Since the date field is not editable, this is here just to get rid of the react warning that 
		// an onChage handler needs to be provided, or the field should be set to read-only.
	}

	private onKeyDown(event:KeyboardEvent):void {

		if(this.props.activeField == "date" && (event.keyCode >= 37 && event.keyCode <= 40)) {

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
						onFocus={this.onFocus} onChange={this.onChange} contentEditable={false} 
						value={this.props.selectedDate.toISOString()} />
					<Overlay show={this.props.activeField == "date"} placement="right" target={ ()=> ReactDOM.findDOMNode(this.dateInput) }>
						<Popover id="selectDatePopover" style={PopoverStyle}>
							<DatePicker inline onChange={this.onDateSelectionChange} selected={this.props.selectedDate.toUTCMoment()} 
								minDate={this.minDate.toUTCMoment()} maxDate={this.maxDate.toUTCMoment()}/>
							<div style={RepeatDivStyle}>
								<label style={RepeatLabelStyle}>Repeat:</label>
								<FormControl ref={(n) => this.frequencySelection = n } style={RepeatSelectStyle} 
										componentClass="select" value={this.props.selectedFrequency} 
										onChange={this.onFrequencyChange}>
									<option>{TransactionFrequency.Never}</option>
									<option>{TransactionFrequency.Once}</option>
									<option>{TransactionFrequency.Daily}</option>
									<option>{TransactionFrequency.Weekly}</option>
									<option>{TransactionFrequency.EveryOtherWeek}</option>
									<option>{TransactionFrequency.TwiceAMonth}</option>
									<option>{TransactionFrequency.Every4Weeks}</option>
									<option>{TransactionFrequency.Monthly}</option>
									<option>{TransactionFrequency.EveryOtherMonth}</option>
									<option>{TransactionFrequency.Every3Months}</option>
									<option>{TransactionFrequency.Every4Months}</option>
									<option>{TransactionFrequency.TwiceAYear}</option>
									<option>{TransactionFrequency.Yearly}</option>
								</FormControl>
							</div>
						</Popover>
					</Overlay>
				</Col>
			</FormGroup>
		);
	}
}
