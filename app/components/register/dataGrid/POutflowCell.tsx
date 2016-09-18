/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { ITransaction } from '../../../interfaces/budgetEntities';

export interface POutflowCellProps {
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

export class POutflowCell extends React.Component<POutflowCellProps, {}> {
	
	public render() {

		var outflowString = "";
		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
			var outflow = transaction.amount < 0 ? -transaction.amount : 0;
			outflowString = outflow > 0 ? outflow.toString() : ""; 
		}

		return (
			<div style={CellStyle}>{outflowString}</div>
		);
  	}
}