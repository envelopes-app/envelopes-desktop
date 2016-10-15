/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { ITransaction } from '../../../interfaces/budgetEntities';
import { SimpleObjectMap } from '../../../utilities';

export interface PMemoCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	transactions:Array<ITransaction>;
	selectedTransactionsMap:SimpleObjectMap<boolean>;

	editTransaction:(transactionId:string, focusOnField:string)=>void;
	selectTransaction:(transactionId:string, unselectAllOthers:boolean)=>void;
}

export class PMemoCell extends React.Component<PMemoCellProps, {}> {
	
	constructor(props: any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
	}

	private onClick(event:MouseEvent):void {

		var transaction = this.props.transactions[this.props.rowIndex];
		this.props.selectTransaction(transaction.entityId, true);
	}	

	private onDoubleClick(event:MouseEvent):void {

		var transaction = this.props.transactions[this.props.rowIndex];
		this.props.editTransaction(transaction.entityId, "memo");
	}

	public render() {

		var memo = "";
		var selected:boolean = false;
		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
			memo = transaction.memo;
			// Check whether this transaction is currently selected
			var selectedValue = this.props.selectedTransactionsMap[transaction.entityId];
			if(selectedValue && selectedValue == true)
				selected = true;
		}

		var className = selected ? "register-transaction-cell-selected" : "register-transaction-cell";
		return (
			<div className={className} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>{memo}</div>
		);
  	}
}