/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { AccountsArray } from '../../../collections';
import { ITransaction } from '../../../interfaces/budgetEntities';
import { SimpleObjectMap } from '../../../utilities';

export interface PAccountCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	accounts:AccountsArray;
	transactions:Array<ITransaction>;
	selectedTransactionsMap:SimpleObjectMap<boolean>;

	editTransaction:(transactionId:string, focusOnField:string)=>void;
	selectTransaction:(transactionId:string, unselectAllOthers:boolean)=>void;
}

export class PAccountCell extends React.Component<PAccountCellProps, {}> {

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
		this.props.editTransaction(transaction.entityId, "account");
	}

	public render() {

		var accountName = "";
		var selected:boolean = false;
		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
			var account = this.props.accounts.getEntityById(transaction.accountId);
			accountName = account.accountName;
			// Check whether this transaction is currently selected
			var selectedValue = this.props.selectedTransactionsMap[transaction.entityId];
			if(selectedValue && selectedValue == true)
				selected = true;
		}

		var className = selected ? "register-transaction-cell-selected" : "register-transaction-cell";
		return (
			<div className={className} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>{accountName}</div>
		);
  	}
}