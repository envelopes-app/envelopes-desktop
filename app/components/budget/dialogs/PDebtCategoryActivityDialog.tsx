/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { PTransactionsList } from './PTransactionsList';
import { TransactionSources } from '../../../constants';
import { DataFormatter, DateWithoutTime } from '../../../utilities/';
import { ITransactionObject } from '../../../interfaces/objects';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PDebtCategoryActivityDialogProps {
	dataFormatter:DataFormatter;
	entitiesCollection:IEntitiesCollection
}

export interface PDebtCategoryActivityDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	subCategoryName:string;
	transactions:Array<ITransactionObject>;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'520px'
}

const TitleStyle:React.CSSProperties = {
	width: "100%",
	color: "#4D717A",
	fontSize: "24px",
}

export class PDebtCategoryActivityDialog extends React.Component<PDebtCategoryActivityDialogProps, PDebtCategoryActivityDialogState> {

	constructor(props: any) {
        super(props);
		this.hide = this.hide.bind(this);
		this.onCloseClick = this.onCloseClick.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"left",
			subCategoryName:null,
			transactions:null
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}

	private onCloseClick():void { 
		// Hide the dialog
		this.hide();
	}
	
	public show(subCategoryId:string, month:DateWithoutTime, target:HTMLElement, placement:string = "bottom"):void {

		// Get the subCategory for the passed subCategoryId
		var subCategory = this.props.entitiesCollection.subCategories.getEntityById(subCategoryId);
		// Get the liability account corresponding to this category
		var account = this.props.entitiesCollection.accounts.getEntityById(subCategory.accountId);
		
		if(subCategory && account) {

			var state = Object.assign({}, this.state) as PDebtCategoryActivityDialogState;
			state.show = true;
			state.target = target;
			state.placement = placement;
			state.subCategoryName = subCategory.name;
			state.transactions = this.buildTransactionObjects(account.entityId, month);
			this.setState(state);
		}
	}

	private buildTransactionObjects(accountId:string, month:DateWithoutTime):Array<ITransactionObject> {

		var entitiesCollection = this.props.entitiesCollection;
		// Get all the transactions for the specified month
		var transactions = entitiesCollection.transactions.getTransactionsByMonth(month);
		var transactionObjects:Array<ITransactionObject> = [];
		_.forEach(transactions, (transaction)=>{
			if(transaction.accountId == accountId && transaction.isTombstone == 0 && transaction.source != TransactionSources.Matched) {

				var payee = transaction.payeeId ? entitiesCollection.payees.getEntityById(transaction.payeeId) : null;
				var payeeName = payee ? payee.name : "";
				var subCategory = transaction.subCategoryId ? entitiesCollection.subCategories.getEntityById(transaction.subCategoryId) : null;
				var subCategoryName = subCategory ? subCategory.name : "";
				
				var transactionObject:ITransactionObject = {
					entityId: transaction.entityId,
					isTransaction: true,
					account: null, // We can set this to null, as we are not displaying this 
					date: transaction.date,
					payee: payeeName,
					category: subCategoryName,
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

	public hide():void {
		var state = Object.assign({}, this.state) as PDebtCategoryActivityDialogState;
		state.show = false;
		this.setState(state);
	}

	public render() {

		return (
			<Overlay show={this.state.show} placement={this.state.placement} 
				rootClose={true} onHide={this.onCloseClick} target={()=> ReactDOM.findDOMNode(this.state.target)}>
				<Popover id="debtCategoryActivityDialog" style={PopoverStyle}>
					<div style={TitleStyle}>{this.state.subCategoryName}</div>
					<PTransactionsList 
						dataFormatter={this.props.dataFormatter}
						showAccountColumn={false}
						showCategoryColumn={true}
						transactions={this.state.transactions}
					/>
					<div className="buttons-container" style={{paddingTop:"10px"}}>
						<div className="spacer" />
						<Button className="dialog-primary-button" onClick={this.onCloseClick}>
							Close&nbsp;<Glyphicon glyph="ok-circle"/>
						</Button>
					</div>
				</Popover>
			</Overlay>
		);
	}
}
