/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { TransactionsArray } from '../../../collections';

export interface PMemoCellProps {
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

export class PMemoCell extends React.Component<PMemoCellProps, {}> {
	
	public render() {

		var memo = "";
		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
			memo = transaction.memo;
		}

		return (
			<div style={CellStyle}>{memo}</div>
		);
  	}
}