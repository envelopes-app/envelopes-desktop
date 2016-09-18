/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { TransactionFlag } from '../../../constants';
import { ITransaction } from '../../../interfaces/budgetEntities';

export interface PFlagCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	transactions:Array<ITransaction>;
}

const CellStyle = {
	fontSize: "14px",
	paddingTop: "4px",
	paddingLeft: "4px"
}

export class PFlagCell extends React.Component<PFlagCellProps, {}> {
	
	public render() {

		var flagColor = TransactionFlag.getFlagColor(TransactionFlag.None);
		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
			flagColor = TransactionFlag.getFlagColor(transaction.flag);
		}

		var cellStyle = _.assign({}, CellStyle, {color:flagColor});
		return (
			<div style={cellStyle}>
				<span className="glyphicon glyphicon-flag" aria-hidden="true"/>
			</div>
		);
  	}
}