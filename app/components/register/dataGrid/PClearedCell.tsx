/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { ITransaction } from '../../../interfaces/budgetEntities';
import { ClearedFlag, TransactionFlag } from '../../../constants';

export interface PClearedCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	transactions:Array<ITransaction>;
	updateClearedForTransaction:(transaction:ITransaction)=>void;
}

const CellStyle = {
	fontSize: "12px",
	paddingTop: "4px",
	paddingLeft: "4px"
}

const UnclearedColor = "#C3CBCE";
const ClearedColor = "#16A336";

export class PClearedCell extends React.Component<PClearedCellProps, {}> {
	
	constructor(props: any) {
        super(props);
		this.onClick = this.onClick.bind(this);
	}

	private onClick():void {

		var transaction = this.props.transactions[this.props.rowIndex];
		this.props.updateClearedForTransaction(transaction);
	}

	public render() {

		var glyphColor = UnclearedColor;
		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
			if(transaction.cleared != ClearedFlag.Uncleared)
				glyphColor = ClearedColor;
		}

		var cellStyle = _.assign({}, CellStyle, {color:glyphColor});
		return (
			<div style={cellStyle}>
				<span className="glyphicon glyphicon-copyright-mark" aria-hidden="true" 
					style={{cursor: 'pointer'}} onClick={this.onClick} />
			</div>
		);
  	}
}