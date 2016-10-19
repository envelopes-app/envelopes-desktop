/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';

import { DateWithoutTime, RegisterTransactionObject, SimpleObjectMap } from '../../../utilities';
import { RegisterTransactionObjectsArray } from '../../../collections';

export interface PDateCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	registerTransactionObjects:RegisterTransactionObjectsArray;
	selectedTransactionsMap:SimpleObjectMap<boolean>;

	editTransaction:(registerTransactionObject:RegisterTransactionObject, focusOnField:string)=>void;
	selectTransaction:(registerTransactionObject:RegisterTransactionObject, unselectAllOthers:boolean)=>void;
}

export class PDateCell extends React.Component<PDateCellProps, {}> {
	
	constructor(props: any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
	}

	private onClick(event:MouseEvent):void {

		var registerTransactionObject = this.props.registerTransactionObjects[this.props.rowIndex];
		this.props.selectTransaction(registerTransactionObject, true);
	}	

	private onDoubleClick(event:MouseEvent):void {

		var registerTransactionObject = this.props.registerTransactionObjects[this.props.rowIndex];
		this.props.editTransaction(registerTransactionObject, "date");
	}

	public render() {

		if(!this.props.registerTransactionObjects)
			return <div />;

		// Get the transaction for the current row
		var registerTransactionObject = this.props.registerTransactionObjects[this.props.rowIndex];
		var className:string = registerTransactionObject.getCSSClassName(this.props.selectedTransactionsMap);

		// We are only going to show the date if this is a transaction or a scheduled 
		// transaction. For subTransaction and scheduledSubTransaction, it would be empty.
		if(registerTransactionObject.entityType == "transaction" || registerTransactionObject.entityType == "scheduledTransaction") {
			return (
				<div className={className} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>{registerTransactionObject.date}</div>
			);
		}
		else {
			return (
				<div className={className} onClick={this.onClick} onDoubleClick={this.onDoubleClick} />
			);
		}
  	}
}