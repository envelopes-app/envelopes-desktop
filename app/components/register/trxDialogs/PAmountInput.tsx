/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormControl, FormGroup, Col, ControlLabel } from 'react-bootstrap';

export interface PAmountInputProps { 
	inflowAmount:number;
	outflowAmount:number;
	setAmount:(inflowAmount:number, outflowAmount:number)=>void;
	handleTabPressed:(shiftPressed:boolean)=>void;
}

const AmountInputStyle = {
	borderColor: '#2FA2B5',
	borderTopWidth: '2px',
	borderBottomWidth: '2px',
	borderLeftWidth: '2px',
	borderRightWidth: '2px',
}

export class PAmountInput extends React.Component<PAmountInputProps, {}> {

	private inflowInput:FormControl;
	private outflowInput:FormControl;

	constructor(props: any) {
        super(props);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onInflowChange = this.onInflowChange.bind(this);
		this.onOutflowChange = this.onOutflowChange.bind(this);
	}

	private onInflowChange() { 
		// Get the value from inflow control and send it to the parent dialog
		var inflowAmount = (ReactDOM.findDOMNode(this.inflowInput) as any).value;
		this.props.setAmount(inflowAmount, 0);
	}

	private onOutflowChange() { 
		// Get the value from outflow control and send it to the parent dialog
		var outflowAmount = (ReactDOM.findDOMNode(this.outflowInput) as any).value;
		this.props.setAmount(0, outflowAmount);
	}

	private onKeyDown(event:KeyboardEvent):void {

		// Tab Key
		if(event.keyCode == 9) {
			
			// Prevent the default action from happening as we are manually handling it
			event.preventDefault();

			var inflowDomNode = ReactDOM.findDOMNode(this.inflowInput) as any;
			var outflowDomNode = ReactDOM.findDOMNode(this.outflowInput) as any;

			if(document.activeElement == outflowDomNode) {
				if(event.shiftKey) {
					// Let the parent dialog know that tab was pressed
					this.props.handleTabPressed(event.shiftKey);
				}
				else {
					// Move the focus on to the inflow control
					this.setFocusOnInflow();
				}
			}
			else if(document.activeElement == inflowDomNode) {
				if(event.shiftKey) {
					// Move the focus back to the outflow control
					this.setFocusOnOutflow();
				}
				else {
					// Let the parent dialog know that tab was pressed
					this.props.handleTabPressed(event.shiftKey);
				}
			}
		}
		else if(_.indexOf(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "."], event.key) == -1) {
			// Ignore any key press other then the numeric keys
			event.preventDefault();
		}
	}

	public setFocusOnInflow():void {
		// Set the focus on the inflow input control
		var domNode = ReactDOM.findDOMNode(this.inflowInput) as any;
		domNode.focus();
		domNode.select();
	}

	public setFocusOnOutflow():void {
		// Set the focus on the outflow input control
		var domNode = ReactDOM.findDOMNode(this.outflowInput) as any;
		domNode.focus();
		domNode.select();
	}

	public render() {

		return (
			<FormGroup onKeyDown={this.onKeyDown}>
				<Col componentClass={ControlLabel} sm={3}>
					Outflow
				</Col>
				<Col sm={9} style={{display:"flex", flexFlow: 'row nowrap', alignItems: 'baseline'}}>
					<FormControl ref={(n) => this.outflowInput = n } type="text" componentClass="input" style={AmountInputStyle} 
						onChange={this.onOutflowChange} value={this.props.outflowAmount} />
					<label className="control-label" style={{paddingLeft: 15, paddingRight: 15}}>
						Inflow
					</label>
					<FormControl ref={(n) => this.inflowInput = n } type="text" componentClass="input" style={AmountInputStyle} 
						onChange={this.onInflowChange} value={this.props.inflowAmount} />
				</Col>
			</FormGroup>
		);
	}
}
