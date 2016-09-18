/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PBudgetHeaderProps {
}

const BudgetHeaderContainerStyle = {
	flex: '0 0 auto',
	height: '90px',
	width: '100%',
	backgroundColor: '#003540',
	paddingLeft: '5px',
	paddingRight: '5px'
}

const BudgetHeaderStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '100%',
	width: '100%',
	paddingRight: '5px'
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

export class PBudgetHeader extends React.Component<PBudgetHeaderProps, {}> {
  
	public render() {

    	return (
			<div style={BudgetHeaderContainerStyle}>
				<div style={BudgetHeaderStyle}>
					<div style={BlankSpaceStyle} />
				</div>
			</div>
		);
  	}
}