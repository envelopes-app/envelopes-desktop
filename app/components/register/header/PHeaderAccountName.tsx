/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PHeaderAccountNameProps {
	text:string
}

const AccountNameContainerStyle = {
	flex: '0 0 auto',
	display: 'flex',
	alignItems: 'center',
	backgroundColor: '#16A336',
	height: '100%',
	borderTopRightRadius: '20px',
	borderBottomRightRadius: '20px',
	paddingLeft: '10px',
	paddingRight: '10px',
	marginRight: '20px'
}

const AccountNameInnerStyle = {
	fontSize: '24px',
	fontWeight: 'normal',
	color: '#ffffff',
	backgroundColor: '#16A336',
	paddingTop: '4px',
	paddingBottom: '4px',
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