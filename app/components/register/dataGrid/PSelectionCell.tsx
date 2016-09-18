/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { ITransaction } from '../../../interfaces/budgetEntities';

export interface PSelectionCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	transactions:Array<ITransaction>;
	selectTransaction:(transactionId:string, unselectAllOthers:boolean)=>void;
	unselectTransaction:(transactionId:string)=>void;
}

const CellStyle = {
	fontSize: "12px",
	paddingTop: "4px",
	paddingLeft: "4px"
}

export class PSelectionCell extends React.Component<PSelectionCellProps, {}> {
	
	constructor(props: any) {
        super(props);
		this.onChange = this.onChange.bind(this);
	}

	private onChange(event:React.SyntheticEvent):void {
		
		var element = event.target as HTMLInputElement;
		var transaction = this.props.transactions[this.props.rowIndex];
		if(element.checked)
			this.props.selectTransaction(transaction.entityId, false);
		else
			this.props.unselectTransaction(transaction.entityId);
	}

	public render() {

		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
		}

		return (
			<div style={CellStyle}>
				<input type="checkbox" onChange={this.onChange} />
			</div>
		);
  	}
}