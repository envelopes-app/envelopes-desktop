/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { ITransaction } from '../../../interfaces/budgetEntities';
import { ClearedFlag } from '../../../constants';
import { SimpleObjectMap } from '../../../utilities';

export interface PClearedCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	transactions:Array<ITransaction>;
	selectedTransactionsMap:SimpleObjectMap<boolean>;

	editTransaction:(transactionId:string, focusOnField:string)=>void;
	selectTransaction:(transactionId:string, unselectAllOthers:boolean)=>void;
	updateClearedForTransaction:(transaction:ITransaction)=>void;
}

const UnclearedColor = "#C3CBCE";
const ClearedColor = "#16A336";

export class PClearedCell extends React.Component<PClearedCellProps, {}> {
	
	constructor(props: any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
		this.onGlyphClick = this.onGlyphClick.bind(this);
	}

	private onClick(event:MouseEvent):void {

		if((event.target as any).localName == "div") {
			var transaction = this.props.transactions[this.props.rowIndex];
			this.props.selectTransaction(transaction.entityId, true);
		}
	}	

	private onDoubleClick(event:MouseEvent):void {

		var transaction = this.props.transactions[this.props.rowIndex];
		this.props.editTransaction(transaction.entityId, null);
	}

	private onGlyphClick(event:MouseEvent):void {

		var transaction = this.props.transactions[this.props.rowIndex];
		this.props.updateClearedForTransaction(transaction);
		event.preventDefault();
	}

	public render() {

		var glyphColor = UnclearedColor;
		var selected:boolean = false;
		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
			if(transaction.cleared != ClearedFlag.Uncleared)
				glyphColor = ClearedColor;

			// Check whether this transaction is currently selected
			var selectedValue = this.props.selectedTransactionsMap[transaction.entityId];
			if(selectedValue && selectedValue == true)
				selected = true;
		}

		var cellStyle = {color:glyphColor};
		var className = selected ? "register-transaction-cell-selected" : "register-transaction-cell";

		return (
			<div className={className} style={cellStyle} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>
				<span className="glyphicon glyphicon-copyright-mark" aria-hidden="true" 
					style={{cursor: 'pointer'}} onClick={this.onGlyphClick} />
			</div>
		);
  	}
}