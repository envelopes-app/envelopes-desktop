/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { AccountsArray } from '../../../collections';
import { ITransaction } from '../../../interfaces/budgetEntities';

export interface PAccountCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	accounts:AccountsArray;
	transactions:Array<ITransaction>;
}

const CellStyle = {
	fontSize: "12px",
	paddingTop: "4px",
	paddingLeft: "4px"
}

export class PAccountCell extends React.Component<PAccountCellProps, {}> {
	
	public render() {

		var accountName = "";
		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
			var account = this.props.accounts.getEntityById(transaction.accountId);
			accountName = account.accountName;
		}

		return (
			<div style={CellStyle}>{accountName}</div>
		);
  	}
}