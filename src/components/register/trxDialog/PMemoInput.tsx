/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormControl, FormGroup, Col, ControlLabel } from 'react-bootstrap';

export interface PMemoInputProps { 
	activeField:string;
	memo:string;
	setActiveField?:(activeField:string)=>void;
	setMemo:(memo:string)=>void;
	handleTabPressed:(shiftPressed:boolean)=>void;
}

const MemoInputStyle:React.CSSProperties = {
	borderColor: '#2FA2B5',
	borderTopWidth: '2px',
	borderBottomWidth: '2px',
	borderLeftWidth: '2px',
	borderRightWidth: '2px',
}

export class PMemoInput extends React.Component<PMemoInputProps, {}> {

	private memoInput:FormControl;

	constructor(props:PMemoInputProps) {
        super(props);
		this.onFocus = this.onFocus.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
	}

	private onChange() { 
		// Get the memo value from the control and send it to the parent dialog
		var memo = (ReactDOM.findDOMNode(this.memoInput) as any).value;
		this.props.setMemo(memo);
	}

	private onFocus():void {
		if(this.props.activeField != "memo" && this.props.setActiveField)
			this.props.setActiveField("memo");
	}

	public setFocus():void {
		// Set the focus on the input control
		var domNode = ReactDOM.findDOMNode(this.memoInput) as any;
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
					Memo
				</Col>
				<Col sm={9}>
					<FormControl ref={(n) => this.memoInput = n } type="text" componentClass="input" style={MemoInputStyle} 
						onFocus={this.onFocus} onChange={this.onChange} value={this.props.memo} />
				</Col>
			</FormGroup>
		);
	}
}
