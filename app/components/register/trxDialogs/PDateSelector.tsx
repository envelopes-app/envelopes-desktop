/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as moment from 'moment';
import { Form, FormControl, FormGroup, Glyphicon, Overlay, Popover } from 'react-bootstrap';

var DatePicker:any = require('react-datepicker');

import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PDateSelectorProps { 
	width: number;
	selectedDate?:Date;
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
	maxWidth: 'none', 
//	width:'250px'
}

export class PDateSelector extends React.Component<PDateSelectorProps, {showPopover:boolean, selectedDate:Date}> {

	private dateInput:FormControl;

	constructor(props: any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.setSelectedDate = this.setSelectedDate.bind(this);
		this.state = {showPopover:false, selectedDate:this.props.selectedDate};	
	}

	private onClick() {
		var state:any = _.assign({}, this.state);
		state.showPopover = true;
		this.setState(state);
	}

	private onChange(date?:any):void {
		debugger;
	}

	private setSelectedDate(date:Date) {
		var state:any = _.assign({}, this.state);
		state.selectedDate = date;
		this.setState(state);
	}

	public render() {
		return (
			<div>
				<FormGroup width={this.props.width}>
					<FormControl ref={(n) => this.dateInput = n } type="text" componentClass="input" style={DateSelectorStyle} 
						onClick={this.onClick} contentEditable={false} 
						defaultValue={this.state.selectedDate ? this.state.selectedDate : ""} />
				</FormGroup>
				<Overlay show={this.state.showPopover} placement="bottom" target={ ()=> ReactDOM.findDOMNode(this.dateInput) }>
					<Popover id="selectDatePopover" style={PopoverStyle}>
						<DatePicker inline onChange={this.onChange}  />
					</Popover>
				</Overlay>
			</div>
		);
	}
}
