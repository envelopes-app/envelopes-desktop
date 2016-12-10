/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormControl, FormGroup, Col, ControlLabel } from 'react-bootstrap';

export interface PCheckNumberInputProps { 
	activeField:string;
	checkNumber:string;
	setActiveField?:(activeField:string)=>void;
	setCheckNumber:(checkNumber:string)=>void;
	handleTabPressed:(shiftPressed:boolean)=>void;
}

const CheckNumberInputStyle:React.CSSProperties = {
	borderColor: '#2FA2B5',
	borderTopWidth: '2px',
	borderBottomWidth: '2px',
	borderLeftWidth: '2px',
	borderRightWidth: '2px',
}

export class PCheckNumberInput extends React.Component<PCheckNumberInputProps, {}> {

	private checkNumberInput:FormControl;

	constructor(props:PCheckNumberInputProps) {
        super(props);
		this.onFocus = this.onFocus.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
	}

	private onChange(event:React.FormEvent<any>) { 
		// Get the check number value from the control and send it to the parent dialog
		var checkNumber = (ReactDOM.findDOMNode(this.checkNumberInput) as any).value;
		this.props.setCheckNumber(checkNumber);
	}

	private onFocus():void {
		if(this.props.activeField != "checknumber" && this.props.setActiveField)
			this.props.setActiveField("checknumber");
	}

	public setFocus():void {
		// Set the focus on the input control
		var domNode = ReactDOM.findDOMNode(this.checkNumberInput) as any;
		domNode.focus();
		domNode.select();
	}

	private onKeyDown(event:React.KeyboardEvent<any>):void {

		// Tab Key
		if(event.keyCode == 9) {
			
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
					Check #
				</Col>
				<Col sm={9}>
					<FormControl ref={(n) => this.checkNumberInput = n } type="text" componentClass="input" style={CheckNumberInputStyle} 
						onFocus={this.onFocus} onChange={this.onChange} value={this.props.checkNumber} />
				</Col>
			</FormGroup>
		);
	}
}
