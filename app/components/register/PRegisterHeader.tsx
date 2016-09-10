/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Tooltip } from 'react-bootstrap';

import { PHeaderAccountName } from './PHeaderAccountName';
import { PHeaderValue } from './PHeaderValue';

export interface PRegisterHeaderProps {
	accountName:string;
	clearedBalance:number;
	unclearedBalance:number;
	workingBalance:number;
}

const RegisterHeaderContainerStyle = {
	flex: '0 0 auto',
	height: '60px',
	width: '100%',
	backgroundColor: '#003540',
	paddingLeft: '5px',
	paddingRight: '5px'
}

const RegisterHeaderStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '100%',
	width: '100%'
}

const SymbolStyle = {
	color: '#588697',
	padding: '10px',
	fontSize: '16px',
	fontWeight: 'bold'
}
const BlankSpaceStyle = {
	flex: '1 1 auto'
}

export class PRegisterHeader extends React.Component<PRegisterHeaderProps, {}> {
  
	public render() {
    	return (
			<div style={RegisterHeaderContainerStyle}>
				<div style={RegisterHeaderStyle}>
					<PHeaderAccountName text={this.props.accountName} />
					<PHeaderValue label="Cleared Balance" value={this.props.clearedBalance} />
					<text style={SymbolStyle}>+</text>
					<PHeaderValue label="Uncleared Balance" value={this.props.unclearedBalance} />
					<text style={SymbolStyle}>=</text>
					<PHeaderValue label="Working Balance" value={this.props.workingBalance} />
				</div>
			</div>
		);
  	}
}