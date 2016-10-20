/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import { Cell } from 'fixed-data-table';

import { ITransaction } from '../../../interfaces/budgetEntities';
import { ClearedFlag } from '../../../constants';
import { RegisterTransactionObject, SimpleObjectMap } from '../../../utilities';
import { RegisterTransactionObjectsArray } from '../../../collections';

export interface PClearedCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	registerTransactionObjects:RegisterTransactionObjectsArray;
	selectedTransactionsMap:SimpleObjectMap<boolean>;

	editTransaction:(registerTransactionObject:RegisterTransactionObject, focusOnField:string)=>void;
	selectTransaction:(registerTransactionObject:RegisterTransactionObject, unselectAllOthers:boolean)=>void;
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
			var registerTransactionObject = this.props.registerTransactionObjects[this.props.rowIndex];
			this.props.selectTransaction(registerTransactionObject, true);
		}
	}	

	private onDoubleClick(event:MouseEvent):void {

		var registerTransactionObject = this.props.registerTransactionObjects[this.props.rowIndex];
		this.props.editTransaction(registerTransactionObject, "date");
	}

	private onGlyphClick(event:MouseEvent):void {

		var registerTransactionObject = this.props.registerTransactionObjects[this.props.rowIndex];
		if(registerTransactionObject.entityType == "transaction") {
			this.props.updateClearedForTransaction(registerTransactionObject.refTransaction);
			event.preventDefault();
		}
	}

	public render() {

		if(!this.props.registerTransactionObjects)
			return <div />;

		// Get the transaction for the current row
		var registerTransactionObject = this.props.registerTransactionObjects[this.props.rowIndex];
		var className:string = registerTransactionObject.getCSSClassName(this.props.selectedTransactionsMap);

		// The cleared glyph is only to be shown for transactions or scheduledTransactions, and not for subTransactions and scheduledSubTransactions 
		if(registerTransactionObject.entityType == "transaction" || registerTransactionObject.entityType == "scheduledTransaction") {

			var glyphColor = UnclearedColor;
			if(registerTransactionObject.entityType == "transaction" && registerTransactionObject.refTransaction.cleared != ClearedFlag.Uncleared)
				glyphColor = ClearedColor;

			var glyphClassName = "glyphicon glyphicon-copyright-mark";
			if(registerTransactionObject.entityType == "transaction" && registerTransactionObject.refTransaction.cleared == ClearedFlag.Reconciled)
				glyphClassName = "glyphicon glyphicon-registration-mark";

			var cellStyle = {color:glyphColor};
			return (
				<div className={className} style={cellStyle} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>
					<span className={glyphClassName} aria-hidden="true" style={{cursor: 'pointer'}} onClick={this.onGlyphClick} />
				</div>
			);
		}
		else {
			// For subTransaction and scheduledSubTransactions, we just need to render an empty box in selected/un-selected state
			return (
				<div className={className} onClick={this.onClick} onDoubleClick={this.onDoubleClick} />
			);
		} 
  	}
}