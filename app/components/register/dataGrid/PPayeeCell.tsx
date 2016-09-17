/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { PayeesArray, TransactionsArray } from '../../../collections';

export interface PPayeeCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	payees:PayeesArray;
	transactions:TransactionsArray;
}

const CellStyle = {
	fontSize: "12px",
	paddingTop: "4px",
	paddingLeft: "4px"
}

export class PPayeeCell extends React.Component<PPayeeCellProps, {}> {
	
	public render() {

		var payeeName = "";
		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
			if(transaction.payeeId) {
				var payee = this.props.payees.getEntityById(transaction.payeeId);
				payeeName = payee.name;
			}
		}

		return (
			<div style={CellStyle}>{payeeName}</div>
		);
  	}
}