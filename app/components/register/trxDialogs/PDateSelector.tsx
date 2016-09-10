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
	selectedDate?:DateWithoutTime;
	selectionChanged?:(date:Date)=>void;
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

export class PDateSelector extends React.Component<PDateSelectorProps, {showPopover:boolean, selectedDate:DateWithoutTime}> {

	private dateInput:FormControl;

	constructor(props: any) {
        super(props);
		this.onBlur = this.onBlur.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.setSelectedDate = this.setSelectedDate.bind(this);
		this.state = {showPopover:false, selectedDate:this.props.selectedDate};	
	}

	private onChange(date?:any):void {
		debugger;
	}

	private setSelectedDate(date:Date) {
		var state:any = _.assign({}, this.state);
		state.selectedDate = date;
		this.setState(state);
	}

	public showPopover():void {
		// If the popover is already showing then we dont need to do anything
		if(this.state.showPopover == false) {
			var state:any = _.assign({}, this.state);
			state.showPopover = true;
			this.setState(state);
		}

		// Set the focus on the input control
		(ReactDOM.findDOMNode(this.dateInput) as any).focus();
	}

	public hidePopover():void {
		// If the popover is already hidden then we dont need to do anything
		if(this.state.showPopover == true) {
			var state:any = _.assign({}, this.state);
			state.showPopover = false;
			this.setState(state);
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

	public render() {
		return (
			<FormGroup>
				<Col componentClass={ControlLabel} sm={3}>
					Date
				</Col>
				<Col sm={9}>
					<FormControl ref={(n) => this.dateInput = n } type="text" componentClass="input" style={DateSelectorStyle} 
						onFocus={this.onFocus} onBlur={this.onBlur} contentEditable={false} 
						defaultValue={this.state.selectedDate ? this.state.selectedDate : ""} />
					<Overlay show={this.state.showPopover} placement="right" target={ ()=> ReactDOM.findDOMNode(this.dateInput) }>
						<Popover id="selectDatePopover" style={PopoverStyle}>
							<DatePicker inline onChange={this.onChange}  />
						</Popover>
					</Overlay>
				</Col>
			</FormGroup>
		);
	}
}
