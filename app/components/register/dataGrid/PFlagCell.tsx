/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Cell } from 'fixed-data-table';
import { Glyphicon } from 'react-bootstrap';

import { TransactionFlag } from '../../../constants';
import { ITransaction } from '../../../interfaces/budgetEntities';
import { RegisterTransactionObject, SimpleObjectMap } from '../../../utilities';
import { RegisterTransactionObjectsArray } from '../../../collections';

export interface PFlagCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;

	registerTransactionObjects:RegisterTransactionObjectsArray;
	selectedTransactionsMap:SimpleObjectMap<boolean>;

	editTransaction:(registerTransactionObject:RegisterTransactionObject, focusOnField:string)=>void;
	selectTransaction:(registerTransactionObject:RegisterTransactionObject, unselectAllOthers:boolean)=>void;
	showFlagSelectionDialog:(registerTransactionObject:RegisterTransactionObject, element:HTMLElement)=>void;
}

export class PFlagCell extends React.Component<PFlagCellProps, {}> {

	private flagContainer:HTMLDivElement;
	private flagGlyph:Glyphicon;

	constructor(props: any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
		this.onGlyphClick = this.onGlyphClick.bind(this);
		this.state = {showPopover: false, transaction: null};
	}

	private onClick(event:MouseEvent):void {

		if((event.target as any).localName == "div") {
			var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
			this.props.selectTransaction(registerTransactionObject, true);
		}
	}	

	private onDoubleClick(event:MouseEvent):void {

		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
		this.props.editTransaction(registerTransactionObject, "date");
	}

	private onGlyphClick():void {

		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
		this.props.showFlagSelectionDialog(registerTransactionObject, this.flagContainer);
	}

	public render() {

		if(!this.props.registerTransactionObjects)
			return <div />;

		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
		var className:string = registerTransactionObject.getCSSClassName(this.props.selectedTransactionsMap);

		// The flag glyph is only to be shown for transactions or scheduledTransactions, and not for subTransactions and scheduledSubTransactions 
		if(registerTransactionObject.entityType == "transaction" || registerTransactionObject.entityType == "scheduledTransaction") {

			var flag = registerTransactionObject.flag;
			var flagColor = TransactionFlag.getFlagColor(flag);
			var cellStyle = {color:flagColor};

			return (
				<div className={className} style={cellStyle} onClick={this.onClick} onDoubleClick={this.onDoubleClick} ref={(d)=> this.flagContainer = d}>
					<Glyphicon key="glyph" glyph="flag" style={{cursor: 'pointer'}} 
						onClick={this.onGlyphClick} ref={(s)=> this.flagGlyph = s}
					/>
				</div>
			);
		}
		else {
			// For subTransaction and scheduledSubTransactions, we just need to render an empty box in selected/un-selected state
			return (
				<div className={className} onClick={this.onClick} onDoubleClick={this.onDoubleClick} ref={(d)=> this.flagContainer = d} />
			);
		} 
  	}
}