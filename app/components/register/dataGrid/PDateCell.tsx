/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { DateWithoutTime } from '../../../utilities';
import { ITransaction } from '../../../interfaces/budgetEntities';

export interface PDateCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	transactions:Array<ITransaction>;
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