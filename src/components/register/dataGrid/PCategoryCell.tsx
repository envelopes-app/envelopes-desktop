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

const WarningBadgeStyle:React.CSSProperties = {
	color: "#E59100",
	backgroundColor: "#FFEAC7",
	fontSize: "14px",
	fontWeight: "normal",
	fontStyle: "italic"
}

export class PCategoryCell extends React.Component<PCategoryCellProps, {}> {

	constructor(props:PCategoryCellProps) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
	}

	private onClick(event:React.MouseEvent<any>):void {

		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
		this.props.selectTransaction(registerTransactionObject, true);
	}	

	private onDoubleClick(event:React.MouseEvent<any>):void {

		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
		this.props.editTransaction(registerTransactionObject, "category");
	}

	public render() {

		if(!this.props.registerTransactionObjects)
			return <div />;

		// Get the transaction for the current row
		var registerTransactionObject = this.props.registerTransactionObjects.getItemAt(this.props.rowIndex);
		var refAccount = registerTransactionObject.refAccount;
		var className:string = registerTransactionObject.getCSSClassName(this.props.selectedTransactionsMap);
		var categoryName:string = registerTransactionObject.refSubCategory ? registerTransactionObject.categoryName : "";
		var showNeedsCategoryMessage:boolean = false;
		var categoryNotRequired:boolean = false;

		// If this transaction belongs to a tracking account, then we wont show the category. Just show the 
		// category not required message.
		if(refAccount.onBudget == 0) {
			categoryNotRequired = true;
		}

		// The "needs category" message only needs to be shown for transactions if they are missing a category.
		// Also, it is not shown if the transaction is a transfer from an on-budget to on-budget account
		else if(!registerTransactionObject.refSubCategory && 
			(registerTransactionObject.entityType == "transaction" || registerTransactionObject.entityType == "subTransaction")) {

			if(!registerTransactionObject.refTransferAccount) {
				// This is not a transfer, so show the warning message
				showNeedsCategoryMessage = true;
			}
			else {
				if(registerTransactionObject.refAccount.onBudget != 1 || registerTransactionObject.refTransferAccount.onBudget != 1) {
					// This is not an on-budget to on-budget transfer, so show the warning message
					showNeedsCategoryMessage = true;
				}
			}
		}

		if(categoryNotRequired == true) {
			return (
				<div className={className} style={{width:this.props.width}} onClick={this.onClick} />
			);
		}
		else if(showNeedsCategoryMessage == true) {
			return (
				<div className={className} style={{width:this.props.width}} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>
					<Badge style={WarningBadgeStyle}>This needs a category</Badge>
				</div>
			);
		}
		else {
			var truncatedDivStyle:React.CSSProperties = {
				width: this.props.width,
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis"
			};
		
			return (
				<div className={className} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>
					<div style={truncatedDivStyle} title={categoryName}>
						{categoryName}
					</div>
				</div>
			);
		}
  	}
}