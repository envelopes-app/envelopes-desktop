/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { Badge } from 'react-bootstrap';

import { InternalCategories } from '../../../constants';
import { ITransaction } from '../../../interfaces/budgetEntities';
import { MasterCategoriesArray, SubCategoriesArray } from '../../../collections';
import { RegisterTransactionObject, SimpleObjectMap } from '../../../utilities';
import { RegisterTransactionObjectsArray } from '../../../collections';

export interface PCategoryCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	registerTransactionObjects:RegisterTransactionObjectsArray;
	selectedTransactionsMap:SimpleObjectMap<boolean>;

	editTransaction:(registerTransactionObject:RegisterTransactionObject, focusOnField:string)=>void;
	selectTransaction:(registerTransactionObject:RegisterTransactionObject, unselectAllOthers:boolean)=>void;
}

const WarningBadgeStyle = {
	color: "#E59100",
	backgroundColor: "#FFEAC7",
	fontSize: "14px",
	fontWeight: "normal",
	fontStyle: "italic"
}

export class PCategoryCell extends React.Component<PCategoryCellProps, {}> {

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
		this.props.editTransaction(registerTransactionObject, "category");
	}

	public render() {

		// Get the transaction for the current row
		var registerTransactionObject = this.props.registerTransactionObjects[this.props.rowIndex];
		var className:string = registerTransactionObject.getCSSClassName(this.props.selectedTransactionsMap);

		if(registerTransactionObject.refSubCategory) {
			return (
				<div className={className} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>{registerTransactionObject.categoryName}</div>
			);
		}
		else {
			return (
				<div className={className} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>
					<Badge style={WarningBadgeStyle}>This needs a category</Badge>
				</div>
			);
		}
  	}
}