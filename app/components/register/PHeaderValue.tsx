/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PHeaderValueProps {
	label:string,
	value:number
}

const HeaderValueContainerStyle = {
	flex: '0 0 auto'
}

const HeaderValueStyle = {
	display: 'flex',
	flexFlow: 'column nowrap',
	alignItems: 'center',
}

const LabelStyle = {
	color: '#ffffff',
	fontStyle: 'italic',
	fontWeight: 'normal',
	fontSize: '13px'
}

const PositiveValueStyle = {
	color: '#57B66D',
	fontWeight: 'bold',
	fontSize: '18px'
}

const NegativeValueStyle = {
	color: '#CA6D64',
	fontWeight: 'bold',
	fontSize: '18px'
}

export class PHeaderValue extends React.Component<PHeaderValueProps, {}> {
  
	public render() {
    	return (
			<div style={HeaderValueContainerStyle}>
				<div style={HeaderValueStyle}>
					<text style={LabelStyle}>{this.props.label}</text>
					<text style={PositiveValueStyle}>{this.props.value}</text>
				</div>		
			</div>		
		);
  	}
}