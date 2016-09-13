/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormControl, FormGroup, Col, ControlLabel } from 'react-bootstrap';

export interface PAmountInputProps { 
	amount:number;
	setAmount:(amount:number)=>void;
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
		this.onInflowChange = this.onInflowChange.bind(this);
		this.onOutflowChange = this.onOutflowChange.bind(this);
	}

	private onInflowChange() { }
	private onOutflowChange() { }

	public setFocusOnInflow():void {
		// Set the focus on the inflow input control
		(ReactDOM.findDOMNode(this.inflowInput) as any).focus();
	}

	public setFocusOnOutflow():void {
		// Set the focus on the outflow input control
		(ReactDOM.findDOMNode(this.outflowInput) as any).focus();
	}

	public render() {

		return (
			<FormGroup>
				<Col componentClass={ControlLabel} sm={3}>
					Outflow
				</Col>
				<Col sm={9} style={{display:"flex", flexFlow: 'row nowrap', alignItems: 'baseline'}}>
					<FormControl ref={(n) => this.outflowInput = n } type="text" componentClass="input" style={AmountInputStyle} 
						onChange={this.onOutflowChange} value={this.props.amount < 0 ? -(this.props.amount) : 0} />
					<label className="control-label" style={{paddingLeft: 15, paddingRight: 15}}>
						Inflow
					</label>
					<FormControl ref={(n) => this.inflowInput = n } type="text" componentClass="input" style={AmountInputStyle} 
						onChange={this.onInflowChange} value={this.props.amount > 0 ? this.props.amount : 0} />
				</Col>
			</FormGroup>
		);
	}
}
