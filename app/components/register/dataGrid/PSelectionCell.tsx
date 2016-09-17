/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { TransactionsArray } from '../../../collections';

export interface PSelectionCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	transactions:TransactionsArray;
}

const CellStyle = {
	fontSize: "12px",
	paddingTop: "4px",
	paddingLeft: "4px"
}

export class PSelectionCell extends React.Component<PSelectionCellProps, {}> {
	
	public render() {

		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
		}

		return (
			<div style={CellStyle}>
				<input type="checkbox" />
			</div>
		);
  	}
}