/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

const PBudgetStyle = {
	display: "flex",
	height: "100%"
}

const PBudgetItemStyle = {
	flex: "1 0 auto"
}

export interface PBudgetProps {}

export class PBudget extends React.Component<PBudgetProps, {}> {
  
	public render() {
    	return (
			<div style={PBudgetStyle}>
				<div style={PBudgetItemStyle}>Budget</div>
			</div>
		);
  	}
}