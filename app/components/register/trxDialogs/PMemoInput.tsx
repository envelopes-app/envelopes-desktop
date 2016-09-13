/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormControl, FormGroup, Col, ControlLabel } from 'react-bootstrap';

export interface PMemoInputProps { 
	memo:string;
	setMemo:(memo:string)=>void;
	handleTabPressed:(shiftPressed:boolean)=>void;
}

const MemoInputStyle = {
	borderColor: '#2FA2B5',
	borderTopWidth: '2px',
	borderBottomWidth: '2px',
	borderLeftWidth: '2px',
	borderRightWidth: '2px',
}

export class PMemoInput extends React.Component<PMemoInputProps, {}> {

	private memoInput:FormControl;

	constructor(props: any) {
        super(props);
		this.onChange = this.onChange.bind(this);
	}

	private onChange() { }

	public setFocus():void {
		// Set the focus on the input control
		(ReactDOM.findDOMNode(this.memoInput) as any).focus();
	}

	public render() {

		return (
			<FormGroup>
				<Col componentClass={ControlLabel} sm={3}>
					Memo
				</Col>
				<Col sm={9}>
					<FormControl ref={(n) => this.memoInput = n } type="text" componentClass="input" style={MemoInputStyle} 
						onChange={this.onChange} value={this.props.memo} />
				</Col>
			</FormGroup>
		);
	}
}
