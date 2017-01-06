/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { PTransactionsList } from '../../common/PTransactionsList';
import { DataFormatter } from '../../../utilities';
import { ITransactionObject } from '../../../interfaces/objects';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PSpendingActivityDialogProps {
	dataFormatter:DataFormatter;
	entitiesCollection:IEntitiesCollection
}

export interface PSpendingActivityDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	itemName:string;
	transactions:Array<ITransactionObject>;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'610px'
}

const TitleStyle:React.CSSProperties = {
	width: "100%",
	color: "#4D717A",
	fontSize: "24px",
}

export class PSpendingActivityDialog extends React.Component<PSpendingActivityDialogProps, PSpendingActivityDialogState> {

	constructor(props:PSpendingActivityDialogProps) {
        super(props);
		this.hide = this.hide.bind(this);
		this.onCloseClick = this.onCloseClick.bind(this);
		this.state = {
			show: false, 
			target: null, 
			placement: "left",
			itemName: null,
			transactions: null
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}

	private onCloseClick():void { 
		// Hide the dialog
		this.hide();
	}
	
	public show(itemName:string, transactions:Array<budgetEntities.ITransaction>, target:HTMLElement, placement:string = "left"):void {

		var state = Object.assign({}, this.state) as PSpendingActivityDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		state.itemName = itemName;
		state.transactions = this.buildTransactionObjects(transactions);
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PSpendingActivityDialogState;
		state.show = false;
		this.setState(state);
	}

	private buildTransactionObjects(transactions:Array<budgetEntities.ITransaction>):Array<ITransactionObject> {

		var transactionObjects:Array<ITransactionObject> = [];
		var entitiesCollection = this.props.entitiesCollection;

		_.forEach(transactions, (transaction)=>{

			var subCategory = transaction.subCategoryId ? entitiesCollection.subCategories.getEntityById(transaction.subCategoryId) : null;
			var account = entitiesCollection.accounts.getEntityById(transaction.accountId);
			var accountName = account ? account.accountName : "";
			var payee = transaction.payeeId ? entitiesCollection.payees.getEntityById(transaction.payeeId) : null;
			var payeeName = payee ? payee.name : "";
			var subCategoryName = subCategory ? subCategory.name : "";
			
			var transactionObject:ITransactionObject = {
				entityId: transaction.entityId,
				account: accountName,
				date: transaction.date,
				payee: payeeName,
				category: subCategoryName,
				memo: transaction.memo,
				amount: transaction.amount
			} 

			transactionObjects.push(transactionObject);
		});

		// Sort the transactions by descending date
		transactionObjects = _.orderBy(transactionObjects, ["date"], ["desc"]);
		return transactionObjects;
	}

	public render() {

		if(this.state.show) {
			return (
				<Overlay show={this.state.show} placement={this.state.placement} 
					rootClose={true} onHide={this.onCloseClick} target={()=> ReactDOM.findDOMNode(this.state.target)}>
					<Popover id="masterCategoryActivityDialog" style={PopoverStyle}>
						<div style={TitleStyle}>{this.state.itemName}</div>
						<PTransactionsList 
							dataFormatter={this.props.dataFormatter}
							showAccountColumn={true}
							showCategoryColumn={true}
							showPayeeColumn={true}
							transactions={this.state.transactions}
						/>
						<div className="buttons-container" style={{paddingTop:"10px"}}>
							<div className="spacer" />
							<button className="dialog-primary-button" onClick={this.onCloseClick}>
								Close&nbsp;<Glyphicon glyph="ok-circle"/>
							</button>
						</div>
					</Popover>
				</Overlay>
			);
		}
		else {
			return <div />;
		}
	}
}
