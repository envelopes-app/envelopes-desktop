/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import { Cell } from 'fixed-data-table';
import { ITransaction } from '../../../interfaces/budgetEntities';
import { MasterCategoriesArray, SubCategoriesArray } from '../../../collections';

export interface PCategoryCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	subCategories:SubCategoriesArray;
	masterCategories:MasterCategoriesArray;
	transactions:Array<ITransaction>;
}

const CellStyle = {
	fontSize: "12px",
	paddingTop: "4px",
	paddingLeft: "4px"
}

export class PCategoryCell extends React.Component<PCategoryCellProps, {}> {
	
	public render() {

		var categoryName = "";
		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
			if(transaction.subCategoryId) {
				var subCategory = this.props.subCategories.getEntityById(transaction.subCategoryId);
				var masterCategory = this.props.masterCategories.getEntityById(subCategory.masterCategoryId);
				categoryName = `${masterCategory.name}: ${subCategory.name}`;
			}
		}

		return (
			<div style={CellStyle}>{categoryName}</div>
		);
  	}
}