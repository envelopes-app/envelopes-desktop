/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import { Cell } from 'fixed-data-table';

import { ITransaction } from '../../../interfaces/budgetEntities';
import { RegisterTransactionObject, SimpleObjectMap } from '../../../utilities';
import { RegisterTransactionObjectsArray } from '../../../collections';

export interface PInfoCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	registerTransactionObjects:RegisterTransactionObjectsArray;
	selectedTransactionsMap:SimpleObjectMap<boolean>;

	editTransaction:(registerTransactionObject:RegisterTransactionObject, focusOnField:string)=>void;
	selectTransaction:(registerTransactionObject:RegisterTransactionObject, unselectAllOthers:boolean)=>void;
	showApproveRejectDialog:(transaction:ITransaction, element:HTMLElement)=>void;
}

const InfoColor = "#34ADBD";
const WarningColor = "#E59100";

export class PInfoCell extends React.Component<PInfoCellProps, {}> {
	
	private infoContainer:HTMLDivElement;

	constructor(props: any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
		this.onGlyphClick = this.onGlyphClick.bind(this);
	}

	private onClick(event:React.MouseEvent<any>):void {

		if((event.target as any).localName == "div") {
		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
			this.props.selectTransaction(registerTransactionObject, true);
		}
	}	

	private onDoubleClick(event:React.MouseEvent<any>):void {

		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
		if(
			registerTransactionObject.entityType == "transaction" && // This is a transaction
			!registerTransactionObject.refTransaction.subCategoryId && // Doesn't have a category
			registerTransactionObject.accountOnBudget == true // Is in an onBudget account
		) {
			// We are showing the subcategory warning for this. Move directly to the subcategory
			// field when editing starts. 
			this.props.editTransaction(registerTransactionObject, "category");
		}
		else {
			this.props.editTransaction(registerTransactionObject, "date");
		}
	}

	private onGlyphClick(event:React.MouseEvent<any>):void {

		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
		// Show the approve/reject dialog if we were showing the info icon
		if(registerTransactionObject.entityType == "transaction" && registerTransactionObject.refTransaction.accepted == 0) {
			this.props.showApproveRejectDialog(registerTransactionObject.refTransaction, this.infoContainer);
			event.preventDefault();
		}
	}

	public render() {

		if(!this.props.registerTransactionObjects)
			return <div />;

		// Get the transaction for the current row
		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
		var className:string = registerTransactionObject.getCSSClassName(this.props.selectedTransactionsMap);

		var showGlyph = false;
		var glyphColor = InfoColor;
		// Check whether we need to show the info/warning glyph
		if(registerTransactionObject.entityType == "transaction") {

			var transaction = registerTransactionObject.refTransaction;
			if(transaction.accepted == 0) {
				showGlyph = true;
				glyphColor = InfoColor;
			}
			else if(!transaction.subCategoryId && registerTransactionObject.accountOnBudget == true) {

				// If this is not a transfer, or transfers to a tracking account
				if(!registerTransactionObject.refTransferAccount || registerTransactionObject.refTransferAccount.onBudget == 0) {
					showGlyph = true;
					glyphColor = WarningColor;
				}
			}
		}

		var cellStyle = {color:glyphColor};

		if(showGlyph) {
			return (
				<div className={className} style={cellStyle} onClick={this.onClick} onDoubleClick={this.onDoubleClick} ref={(d)=> this.infoContainer = d}>
					<span className="glyphicon glyphicon-info-sign" aria-hidden="true" 
						style={{cursor: 'pointer'}} onClick={this.onGlyphClick} />
				</div>
			);
		}
		else {
			return (
				<div className={className} style={cellStyle} onClick={this.onClick} onDoubleClick={this.onDoubleClick} ref={(d)=> this.infoContainer = d} />
			);
		}
  	}
}