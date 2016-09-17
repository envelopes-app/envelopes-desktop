/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { TransactionsArray } from '../../../collections';

export interface PInflowCellProps {
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

export class PInflowCell extends React.Component<PInflowCellProps, {}> {
	
	public render() {

		var inflowString = "";
		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
			var inflow = transaction.amount > 0 ? transaction.amount : 0;
			inflowString = inflow > 0 ? inflow.toString() : ""; 
		}

		return (
			<div style={CellStyle}>{inflowString}</div>
		);
  	}
}