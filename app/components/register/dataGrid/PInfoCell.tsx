/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { ITransaction } from '../../../interfaces/budgetEntities';
import { SimpleObjectMap } from '../../../utilities';

export interface PInfoCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	transactions:Array<ITransaction>;
	selectedTransactionsMap:SimpleObjectMap<boolean>;

	editTransaction:(transactionId:string, focusOnField:string)=>void;
	selectTransaction:(transactionId:string, unselectAllOthers:boolean)=>void;
}

const InfoColor = "#34ADBD";
const WarningColor = "#E59100";

export class PInfoCell extends React.Component<PInfoCellProps, {}> {
	
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
		if(transaction.accepted == 0) {
			// Show the Approve/Reject dialog
		}
		else if(!transaction.subCategoryId) {
			// This trasaction does not have a category. Edit with initial focus set on the category field.
			this.props.editTransaction(transaction.entityId, "category");
		}
	}

	private onGlyphClick(event:MouseEvent):void {

		var transaction = this.props.transactions[this.props.rowIndex];
		// this.props.updateClearedForTransaction(transaction);
		event.preventDefault();
	}

	public render() {

		var glyphColor = InfoColor;
		var showGlyph = false;
		var selected:boolean = false;
		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
			if(transaction.accepted == 0) {
				showGlyph = true;
				glyphColor = InfoColor;
			}
			else if(!transaction.subCategoryId) {
				showGlyph = true;
				glyphColor = WarningColor;
			}

			// Check whether this transaction is currently selected
			var selectedValue = this.props.selectedTransactionsMap[transaction.entityId];
			if(selectedValue && selectedValue == true)
				selected = true;
		}

		var cellStyle = {color:glyphColor};
		var className = selected ? "register-transaction-cell-selected" : "register-transaction-cell";

		if(showGlyph) {
			return (
				<div className={className} style={cellStyle} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>
					<span className="glyphicon glyphicon-info-sign" aria-hidden="true" 
						style={{cursor: 'pointer'}} onClick={this.onGlyphClick} />
				</div>
			);
		}
		else {
			return (
				<div className={className} style={cellStyle} onClick={this.onClick} onDoubleClick={this.onDoubleClick} />
			);
		}
  	}
}