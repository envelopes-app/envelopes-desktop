/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { TransactionsArray } from '../../../collections';
import { DateWithoutTime } from '../../../utilities';

export interface PDateCellProps {
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

export class PDateCell extends React.Component<PDateCellProps, {}> {
	
	public render() {

		var dateString = "";
		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
			var date = DateWithoutTime.createFromUTCTime(transaction.date);
			dateString = date.toISOString();
		}

		return (
			<div style={CellStyle}>{dateString}</div>
		);
  	}
}