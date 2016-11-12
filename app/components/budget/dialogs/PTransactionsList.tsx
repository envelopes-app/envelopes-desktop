/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon } from 'react-bootstrap';

import { ITransactionObject } from '../../../interfaces/objects';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PTransactionsListProps {
	showAccountColumn:boolean;
	showCategoryColumn:boolean;
	transactions:Array<ITransactionObject>;
}

const TransactionsListContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap",
	width: "100%"
}

const HeaderRow:React.CSSProperties = {
	flex: "0 0 auto",
	display: "flex",
	flexFlow: "row nowrap",
	borderColor: "#DFE4E9",
	borderWidth: "1px",
	borderTopStyle: "solid",
	borderBottomStyle: "solid",
}

const HeaderRowCell:React.CSSProperties = {
	flex: "1 0 auto",
	minWidth: "96px",
	paddingTop: "3px",
	paddingBottom: "3px",
	paddingLeft: "5px",
	borderColor: "#DFE4E9",
	borderWidth: "1px",
	borderRightStyle: "solid"
}

const HeaderRowDateCell:React.CSSProperties = Object.assign({}, HeaderRowCell, {
	fontWeight: "bold",
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "center"
});

const HeaderRowAmountCell:React.CSSProperties = Object.assign({}, HeaderRowCell, {
	textAlign: "right",
	borderRightStyle: "none"
});

const TransactionRow:React.CSSProperties = {
	flex: "0 0 auto",
	display: "flex",
	flexFlow: "row nowrap",
	borderColor: "#DFE4E9",
	borderWidth: "1px",
	borderBottomStyle: "solid",
}

const TransactionRowCell:React.CSSProperties = {
	flex: "1 0 auto",
	width: "96px",
	paddingTop: "5px",
	paddingBottom: "5px",
	paddingLeft: "5px",
	textAlign: "left",
	whiteSpace: "nowrap",
  	overflow: "hidden",
  	textOverflow: "ellipsis"
}

const TransactionRowAmountCell:React.CSSProperties = Object.assign({}, TransactionRowCell, {
	textAlign: "right"
});

export class PTransactionsList extends React.Component<PTransactionsListProps, {}> {

	private getHeaderRow():JSX.Element {

		var headerCells:Array<JSX.Element> = [];
		if(this.props.showAccountColumn)
			headerCells.push(<div key="header_account" style={HeaderRowCell}>ACCOUNT</div>);
		headerCells.push(
			<div key="header_date" style={HeaderRowDateCell}>
				<span>DATE</span>
				<div className="spacer" />
				<Glyphicon glyph="triangle-bottom" style={{fontSize:"10px", paddingRight:"5px"}} />
			</div>
		);
		headerCells.push(<div key="header_payee" style={HeaderRowCell}>PAYEE</div>);
		if(this.props.showCategoryColumn)
			headerCells.push(<div key="header_category" style={HeaderRowCell}>CATEGORY</div>);
		headerCells.push(<div key="header_memo" style={HeaderRowCell}>MEMO</div>);
		headerCells.push(<div key="header_amount" style={HeaderRowAmountCell}>AMOUNT</div>);

		return (
			<div key="headerrow" style={HeaderRow}>{headerCells}</div>
		);
	}

	private getTransactionRows(transactions:Array<ITransactionObject>):Array<JSX.Element> {

		var transactionRows:Array<JSX.Element> = [];
		
		_.forEach(transactions, (transaction)=>{

			var transactionCells:Array<JSX.Element> = [];
			if(this.props.showAccountColumn)
				transactionCells.push(<div key={transaction.entityId + '_1'} style={TransactionRowCell} title={transaction.account}>{transaction.account}</div>);
			transactionCells.push(<div key={transaction.entityId + '_2'} style={TransactionRowCell} title={transaction.date}>{transaction.date}</div>);
			transactionCells.push(<div key={transaction.entityId + '_3'} style={TransactionRowCell} title={transaction.payee}>{transaction.payee}</div>);
			if(this.props.showCategoryColumn)
				transactionCells.push(<div key={transaction.entityId + '_4'} style={TransactionRowCell} title={transaction.category}>{transaction.category}</div>);
			transactionCells.push(<div key={transaction.entityId + '_5'} style={TransactionRowCell} title={transaction.memo}>{transaction.memo}</div>);
			transactionCells.push(<div key={transaction.entityId + '_6'} style={TransactionRowAmountCell} title={transaction.amount.toString()}>{transaction.amount.toString()}</div>);
			transactionRows.push(
				<div key={transaction.entityId} style={TransactionRow}>{transactionCells}</div>
			);
		});

		return transactionRows;
	}

	public render() {

		var headerRow = this.getHeaderRow();
		var transactionRows = this.getTransactionRows(this.props.transactions);
		var allRows = [headerRow].concat(transactionRows);

		return (
			<div style={TransactionsListContainer}>
				{allRows}
			</div>
		);		
	}
}