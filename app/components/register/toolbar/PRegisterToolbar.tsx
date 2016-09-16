/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PToolbarButton } from '../../common/PToolbarButton';

export interface PRegisterToolbarProps {
	onAddTransactionSelected:()=>void;
}

const RegisterToolbarContainerStyle = {
	flex: '0 0 auto',
	height: '35px',
	width: '100%',
	backgroundColor: '#ffffff',
	paddingLeft: '10px',
	paddingRight: '10px'
}

const RegisterToolbarStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '100%',
	width: '100%'
}

export class PRegisterToolbar extends React.Component<PRegisterToolbarProps, {}> {
  
	public render() {
    	return (
			<div style={RegisterToolbarContainerStyle}>
				<div style={RegisterToolbarStyle}>
					<PToolbarButton text="Add a transaction" glyphName="glyphicon-plus-sign" clickHandler={this.props.onAddTransactionSelected} />
					<PToolbarButton text="Edit" glyphName="glyphicon-edit" />
				</div>
			</div>
		);
  	}
}