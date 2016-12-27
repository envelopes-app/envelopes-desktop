/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormGroup, FormControl } from 'react-bootstrap';

export interface PFormControlProps {
	value:string;
	errorMessage:string;
	onChange:(event:React.FormEvent<any>)=>void;
}

const FormGroupStyle:React.CSSProperties = {
	flex: "1 1 auto",
	marginBottom: "0px"
}

const FormControlStyle:React.CSSProperties = {
	borderColor: '#2FA2B5',
	borderTopWidth: '2px',
	borderBottomWidth: '2px',
	borderLeftWidth: '2px',
	borderRightWidth: '2px',
}

const FormControlErrorStyle:React.CSSProperties = Object.assign({}, FormControlStyle, {
	borderBottomLeftRadius: "0px",
	borderBottomRightRadius: "0px"
});

const ErrorMessageStyle:React.CSSProperties = {
	width: "100%",
	color: "#FFFFFF",
	backgroundColor: "#D33C2D",
	fontSize: "12px",
	fontWeight: "normal",
	borderTopLeftRadius: "0px",
	borderTopRightRadius: "0px",
	borderBottomLeftRadius: "3px",
	borderBottomRightRadius: "3px",
	paddingLeft: "8px",
	paddingRight: "8px",
	paddingTop: "3px",
	paddingBottom: "3px"
}

export class PFormControl extends React.Component<PFormControlProps, {}> {

	constructor(props:PFormControlProps) {
		super(props);
	}

	public render() {

		var formControlValue = this.props.value ? this.props.value : "";

		if(this.props.errorMessage) {
			return (
				<FormGroup style={FormGroupStyle}>
					<FormControl style={FormControlErrorStyle} type="text" value={formControlValue} onChange={this.props.onChange} />
					<label style={ErrorMessageStyle}>{this.props.errorMessage}</label>
				</FormGroup>
			);
		}
		else {
			return (
				<FormGroup style={FormGroupStyle}>
					<FormControl style={FormControlStyle} type="text" value={formControlValue} onChange={this.props.onChange} />
				</FormGroup>
			);
		}
	}
}
