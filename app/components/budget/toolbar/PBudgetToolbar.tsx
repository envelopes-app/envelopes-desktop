/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PToolbarButton } from '../../common/PToolbarButton';

export interface PBudgetToolbarProps {
	onAddTransactionSelected:()=>void;
	onAddCategoryGroupSelected:()=>void;
}

const BudgetToolbarContainerStyle = {
	flex: '0 0 auto',
	height: '35px',
	width: '100%',
	backgroundColor: '#ffffff',
	paddingLeft: '10px',
	paddingRight: '10px'
}

const BudgetToolbarStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '100%',
	width: '100%'
}

export class PBudgetToolbar extends React.Component<PBudgetToolbarProps, {}> {
  
	public render() {
    	return (
			<div style={BudgetToolbarContainerStyle}>
				<div style={BudgetToolbarStyle}>
					<PToolbarButton text="Add Transaction" glyphName="glyphicon-plus-sign" clickHandler={this.props.onAddTransactionSelected} />
					<PToolbarButton text="Add Category Group" glyphName="glyphicon-plus-sign" clickHandler={this.props.onAddCategoryGroupSelected} />
				</div>
			</div>
		);
  	}
}