/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PHeaderAccountNameProps {
	text:string
}

const AccountNameContainerStyle = {
	flex: '0 0 auto',
	paddingLeft: '10px',
	paddingRight: '10px'
}

const AccountNameInnerStyle = {
	fontSize: '20px',
	fontWeight: '200',
	color: '#ffffff',
	padding: '4px',
	borderRadius: '4px',
	backgroundColor: '#16A336',
	paddingLeft: '10px',
	paddingRight: '10px'
}

export class PHeaderAccountName extends React.Component<PHeaderAccountNameProps, {}> {
  
	public render() {
		return (
			<div style={AccountNameContainerStyle}>
				<div style={AccountNameInnerStyle}>{this.props.text}</div>
			</div>		
		);
  	}
}