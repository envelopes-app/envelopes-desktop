/// <reference path="../../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PPayeeTransactionsDialog } from './PPayeeTransactionsDialog';
import { TransactionSources } from '../../../../constants';
import * as budgetEntities from '../../../../interfaces/budgetEntities';
import { ITransactionObject } from '../../../../interfaces/objects';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../../interfaces/state';
import { DataFormatter } from '../../../../utilities';

export interface PSinglePayeeEditorProps {
	dataFormatter: DataFormatter;
	payee:budgetEntities.IPayee;
	transactionsCount:number;
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PSinglePayeeEditorState {
	isEditing:boolean;
	showTransactions:boolean;
	transactionObjects:Array<ITransactionObject>;
}

const PayeeEditorContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: "column nowrap",
	justifyContent: "flex-start",
	alignItems: "center",
	padding: "10px",
	width: "100%"
}

const NameEditorContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: "space-between",
	alignItems: "center",
	width: "100%"
}

const NameLabelStyle:React.CSSProperties = {
	fontSize: "20px",
	fontWeight: "normal",
	marginBottom: "0px"
}

const EnablePayeeContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: "flex-start",
	marginBottom: "5px",
	width: "100%"
}

const EnableLabelStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: "row nowrap",
	fontSize: "14px",
	fontWeight: "normal",
	paddingLeft: "5px",
	marginBottom: "0px",
	width: "100%"
}

const EnableCountStyle:React.CSSProperties = {
	fontSize: "14px",
	color: "#009cc2",
	fontWeight: "bold",
	marginBottom: "0px",
	cursor: "pointer"
}

const SeparatorStyle:React.CSSProperties = {
	width: "100%",
	marginTop: "5px",
	marginBottom: "10px",
	borderTop: "1px solid #588697"
}

export class PSinglePayeeEditor extends React.Component<PSinglePayeeEditorProps, PSinglePayeeEditorState> {

	private transactionsCount:HTMLDivElement;
	private transactionsDialog:PPayeeTransactionsDialog;

	constructor(props:PSinglePayeeEditorProps) {
        super(props);
		this.onPayeeEnabledChange = this.onPayeeEnabledChange.bind(this);
		this.onTransactionsCountClick = this.onTransactionsCountClick.bind(this);
		this.state = {
			isEditing: false,
			showTransactions: false,
			transactionObjects: null
		}
	}

	private onPayeeEnabledChange(event:React.FormEvent<any>):void {

		var payeeClone = Object.assign({}, this.props.payee, {
			enabled: this.props.payee.enabled == 0 ? 1 : 0
		});

		this.props.updateEntities({
			payees: [payeeClone]
		});
	}

	private onTransactionsCountClick(event:React.MouseEvent<any>):void {

		if(!this.transactionsDialog.isShowing()) {

			var transactionObjects = this.getTransactionObjects();
			this.transactionsDialog.show(transactionObjects, this.transactionsCount);
		}
	}

	private getTransactionObjects():Array<ITransactionObject> {

		var entitiesCollection = this.props.entitiesCollection;
		var transactions = entitiesCollection.transactions.getAllItems();
		var transactionObjects:Array<ITransactionObject> = [];
		var payeeId = this.props.payee.entityId;

		_.forEach(transactions, (transaction)=>{
			if(transaction.isTombstone == 0 && transaction.payeeId == payeeId && transaction.source != TransactionSources.Matched) {

				var account = entitiesCollection.accounts.getEntityById(transaction.accountId);
				var accountName = account ? account.accountName : "";
				var payeeName = "";
				var subCategory = transaction.subCategoryId ? entitiesCollection.subCategories.getEntityById(transaction.subCategoryId) : null;
				var masterCategory = subCategory ? entitiesCollection.masterCategories.getEntityById(subCategory.masterCategoryId) : null;
				var categoryName = subCategory ? `${masterCategory.name}: ${subCategory.name}` : "";
				
				var transactionObject:ITransactionObject = {
					entityId: transaction.entityId,
					account: accountName,
					date: transaction.date,
					payee: payeeName,
					category: categoryName,
					memo: transaction.memo,
					amount: transaction.amount
				} 

				transactionObjects.push(transactionObject);
			}
		});

		// Sort the transactions by descending date
		transactionObjects = _.orderBy(transactionObjects, ["date"], ["desc"]);
		return transactionObjects;
	}

	public render() {
		
		return (
			<div style={PayeeEditorContainerStyle}>
				<div style={NameEditorContainerStyle}>
					<label style={NameLabelStyle}>{this.props.payee.name}</label>
					<button className="dialog-secondary-button" style={{fontSize: "14px"}}>Rename</button>
				</div>

				<hr style={SeparatorStyle} />
				<div style={EnablePayeeContainerStyle}>
					<input type="checkbox" checked={this.props.payee.enabled == 1} onChange={this.onPayeeEnabledChange} />
					<div style={EnableLabelStyle}>
						Enable this payee (used in 
						<div ref={(d)=> this.transactionsCount = d } style={EnableCountStyle} onClick={this.onTransactionsCountClick}>&nbsp;{this.props.transactionsCount}&nbsp;</div> 
						transactions)
					</div>
				</div>

				<hr style={SeparatorStyle} />

				<PPayeeTransactionsDialog 
					ref={(d)=> this.transactionsDialog = d}
					dataFormatter={this.props.dataFormatter}
					entitiesCollection={this.props.entitiesCollection}
				/>
			</div>
		);
	}
}