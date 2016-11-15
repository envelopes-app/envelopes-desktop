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

export interface PMasterCategoryActivityDialogProps {
	dataFormatter:DataFormatter;
	entitiesCollection:IEntitiesCollection
}

export interface PMasterCategoryActivityDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	masterCategoryName:string;
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

export class PMasterCategoryActivityDialog extends React.Component<PMasterCategoryActivityDialogProps, PMasterCategoryActivityDialogState> {

	constructor(props: any) {
        super(props);
		this.hide = this.hide.bind(this);
		this.onCloseClick = this.onCloseClick.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"left",
			masterCategoryName:null,
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
	
	public show(masterCategoryId:string, month:DateWithoutTime, target:HTMLElement, placement:string = "bottom"):void {

		// Get the masterCategory for the passed masterCategoryId
		var masterCategory = this.props.entitiesCollection.masterCategories.getEntityById(masterCategoryId);
		if(masterCategory) {

			var state = Object.assign({}, this.state) as PMasterCategoryActivityDialogState;
			state.show = true;
			state.target = target;
			state.placement = placement;
			state.masterCategoryName = masterCategory.name;
			state.transactions = this.buildTransactionObjects(masterCategoryId, month);
			this.setState(state);
		}
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PMasterCategoryActivityDialogState;
		state.show = false;
		this.setState(state);
	}

	private buildTransactionObjects(masterCategoryId:string, month:DateWithoutTime):Array<ITransactionObject> {

		var entitiesCollection = this.props.entitiesCollection;
		// Get all the transactions for the specified month
		var transactions = entitiesCollection.transactions.getTransactionsByMonth(month);
		var transactionObjects:Array<ITransactionObject> = [];
		_.forEach(transactions, (transaction)=>{
			if(transaction.isTombstone == 0 && transaction.source != TransactionSources.Matched) {

				var subCategory = transaction.subCategoryId ? entitiesCollection.subCategories.getEntityById(transaction.subCategoryId) : null;
				if(subCategory && subCategory.masterCategoryId == masterCategoryId) {

					var account = entitiesCollection.accounts.getEntityById(transaction.accountId);
					var accountName = account ? account.accountName : "";
					var payee = transaction.payeeId ? entitiesCollection.payees.getEntityById(transaction.payeeId) : null;
					var payeeName = payee ? payee.name : "";
					var subCategoryName = subCategory ? subCategory.name : "";
					
					var transactionObject:ITransactionObject = {
						entityId: transaction.entityId,
						isTransaction: true,
						account: accountName,
						date: transaction.date,
						payee: payeeName,
						category: subCategoryName,
						memo: transaction.memo,
						amount: transaction.amount
					} 

					transactionObjects.push(transactionObject);
				}
			}
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
						<div style={TitleStyle}>{this.state.masterCategoryName}</div>
						<PTransactionsList 
							dataFormatter={this.props.dataFormatter}
							showAccountColumn={true}
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
		else {
			return <div />;
		}
	}
}
