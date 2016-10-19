/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';

import { RegisterTransactionObject, SimpleObjectMap } from '../../../utilities';
import { RegisterTransactionObjectsArray } from '../../../collections';

export interface PSelectionCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	registerTransactionObjects:RegisterTransactionObjectsArray;
	selectedTransactionsMap:SimpleObjectMap<boolean>;

	editTransaction:(registerTransactionObject:RegisterTransactionObject, focusOnField:string)=>void;
	selectTransaction:(registerTransactionObject:RegisterTransactionObject, unselectAllOthers:boolean)=>void;
	unselectTransaction:(registerTransactionObject:RegisterTransactionObject)=>void;
}

export class PSelectionCell extends React.Component<PSelectionCellProps, {}> {
	
	constructor(props: any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
		this.onSelectionChange = this.onSelectionChange.bind(this);
	}

	private onClick(event:MouseEvent):void {

		if((event.target as HTMLElement).localName == "div") {
			var registerTransactionObject = this.props.registerTransactionObjects[this.props.rowIndex];
			this.props.selectTransaction(registerTransactionObject, true);
		}
	}	

	private onDoubleClick(event:MouseEvent):void {

		var registerTransactionObject = this.props.registerTransactionObjects[this.props.rowIndex];
		this.props.editTransaction(registerTransactionObject, "date");
	}

	private onSelectionChange(event:React.SyntheticEvent):void {
		
		var element = event.target as HTMLInputElement;
		var registerTransactionObject = this.props.registerTransactionObjects[this.props.rowIndex];
		if(element.checked)
			this.props.selectTransaction(registerTransactionObject, false);
		else
			this.props.unselectTransaction(registerTransactionObject);
	}

	public render() {

		if(!this.props.registerTransactionObjects)
			return <div />;

		// Get the transaction for the current row
		var registerTransactionObject = this.props.registerTransactionObjects[this.props.rowIndex];
		var className:string = registerTransactionObject.getCSSClassName(this.props.selectedTransactionsMap);
		// Check whether this is currently selected or not
		var selected:boolean = registerTransactionObject.isSelected(this.props.selectedTransactionsMap);

		// We are only going to show the selection checkbox if this is a transaction or a scheduled 
		// transaction. For subTransaction and scheduledSubTransaction, it would be empty.
		if(registerTransactionObject.entityType == "transaction" || registerTransactionObject.entityType == "scheduledTransaction") {
			return (
				<div className={className} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>
					<input style={{marginTop:"0px"}} type="checkbox" checked={selected} onChange={this.onSelectionChange} />
				</div>
			);
		}
		else {
			return (
				<div className={className} onClick={this.onClick} onDoubleClick={this.onDoubleClick} />
			);
		}
  	}
}