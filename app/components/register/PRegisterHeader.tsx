/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Tooltip } from 'react-bootstrap';

import { PHeaderAccountName } from './PHeaderAccountName';
import { PHeaderValue } from './PHeaderValue';

import * as budgetEntities from '../../interfaces/budgetEntities';
import { IRegisterState } from '../../interfaces/state';

export interface PRegisterHeaderProps {
	accounts:Array<budgetEntities.IAccount>
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
					<PHeaderAccountName text="All Accounts" />
					<PHeaderValue label="Cleared Balance" value={12345} />
					<text style={SymbolStyle}>+</text>
					<PHeaderValue label="Uncleared Balance" value={12345} />
					<text style={SymbolStyle}>=</text>
					<PHeaderValue label="Working Balance" value={12345} />
				</div>
			</div>
		);
  	}
}