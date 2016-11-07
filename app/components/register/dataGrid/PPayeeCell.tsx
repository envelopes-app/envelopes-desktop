/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';

import { RegisterTransactionObject, SimpleObjectMap } from '../../../utilities';
import { RegisterTransactionObjectsArray } from '../../../collections';

export interface PPayeeCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	registerTransactionObjects:RegisterTransactionObjectsArray;
	selectedTransactionsMap:SimpleObjectMap<boolean>;

	editTransaction:(registerTransactionObject:RegisterTransactionObject, focusOnField:string)=>void;
	selectTransaction:(registerTransactionObject:RegisterTransactionObject, unselectAllOthers:boolean)=>void;
}

export class PPayeeCell extends React.Component<PPayeeCellProps, {}> {
	
	constructor(props: any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
	}

	private onClick(event:MouseEvent):void {

		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
		this.props.selectTransaction(registerTransactionObject, true);
	}	

	private onDoubleClick(event:MouseEvent):void {

		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
		this.props.editTransaction(registerTransactionObject, "payee");
	}

	public render() {

		if(!this.props.registerTransactionObjects)
			return <div />;

		// Get the transaction for the current row
		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
		var className:string = registerTransactionObject.getCSSClassName(this.props.selectedTransactionsMap);
		var truncatedDivStyle = {
			width: this.props.width,
			whiteSpace: "nowrap",
			overflow: "hidden",
			textOverflow: "ellipsis"
		};

		return (
			<div className={className} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>
				<div style={truncatedDivStyle} title={registerTransactionObject.payeeName}>
					{registerTransactionObject.payeeName}
				</div>
			</div>
		);
  	}
}