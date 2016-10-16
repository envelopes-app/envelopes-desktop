/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { Badge } from 'react-bootstrap';

import { InternalCategories } from '../../../constants';
import { ITransaction } from '../../../interfaces/budgetEntities';
import { MasterCategoriesArray, SubCategoriesArray } from '../../../collections';
import { SimpleObjectMap } from '../../../utilities';

export interface PCategoryCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	subCategories:SubCategoriesArray;
	masterCategories:MasterCategoriesArray;
	transactions:Array<ITransaction>;
	selectedTransactionsMap:SimpleObjectMap<boolean>;

	editTransaction:(transactionId:string, focusOnField:string)=>void;
	selectTransaction:(transactionId:string, unselectAllOthers:boolean)=>void;
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

		var transaction = this.props.transactions[this.props.rowIndex];
		this.props.selectTransaction(transaction.entityId, true);
	}	

	private onDoubleClick(event:MouseEvent):void {

		var transaction = this.props.transactions[this.props.rowIndex];
		this.props.editTransaction(transaction.entityId, "category");
	}

	public render() {

		var categoryName = "";
		var selected:boolean = false;
		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
			if(transaction.subCategoryId) {
				var subCategory = this.props.subCategories.getEntityById(transaction.subCategoryId);
				if(subCategory.internalName == InternalCategories.ImmediateIncomeSubCategory)
					categoryName = "Inflow: To be Budgeted";
				else {
					var masterCategory = this.props.masterCategories.getEntityById(subCategory.masterCategoryId);
					categoryName = `${masterCategory.name}: ${subCategory.name}`;
				}
			}

			// Check whether this transaction is currently selected
			var selectedValue = this.props.selectedTransactionsMap[transaction.entityId];
			if(selectedValue && selectedValue == true)
				selected = true;
		}

		var className = selected ? "register-transaction-cell-selected" : "register-transaction-cell";

		if(transaction.subCategoryId) {
			return (
				<div className={className} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>{categoryName}</div>
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