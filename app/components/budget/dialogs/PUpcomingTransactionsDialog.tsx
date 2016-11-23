/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { PTransactionsList } from './PTransactionsList';
import { DateWithoutTime, DataFormatter, SerializationUtilities, KeyGenerator } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { ITransactionObject } from '../../../interfaces/objects';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PUpcomingTransactionsDialogProps {
	dataFormatter:DataFormatter;
	entitiesCollection:IEntitiesCollection;
}

export interface PUpcomingTransactionsDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	subCategory:budgetEntities.ISubCategory;
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
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

export class PUpcomingTransactionsDialog extends React.Component<PUpcomingTransactionsDialogProps, PUpcomingTransactionsDialogState> {

	constructor(props:PUpcomingTransactionsDialogProps) {
        super(props);
		this.hide = this.hide.bind(this);
		this.onCloseClick = this.onCloseClick.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"bottom", 
			subCategory:null,
			monthlySubCategoryBudget:null, 
			transactions: null
		};
	}

	private onCloseClick():void { 
		// Hide the dialog
		this.hide();
	}

	public isShowing():boolean {
		return this.state.show;
	}

	public show(monthlySubCategoryBudgetId:string, target:HTMLElement, placement:string = "bottom"):void {

		var entitiesCollection = this.props.entitiesCollection;
		// Get the monthlySubCategoryBudget and subCategory for the passed id
		var monthlySubCategoryBudget = entitiesCollection.monthlySubCategoryBudgets.getEntityById(monthlySubCategoryBudgetId);
		var subCategory = monthlySubCategoryBudget ? entitiesCollection.subCategories.getEntityById(monthlySubCategoryBudget.subCategoryId) : null;
		if(monthlySubCategoryBudget && subCategory) {

			var month = DateWithoutTime.createFromISOString(monthlySubCategoryBudget.month);
			var state = Object.assign({}, this.state) as PUpcomingTransactionsDialogState;
			state.show = true;
			state.target = target;
			state.placement = placement;
			state.subCategory = subCategory;
			state.monthlySubCategoryBudget = monthlySubCategoryBudget;
			state.transactions = this.buildTransactionObjects(subCategory.entityId, month);
			this.setState(state);
		}
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PUpcomingTransactionsDialogState;
		state.show = false;
		state.subCategory = null;
		state.monthlySubCategoryBudget = null;
		state.transactions = null;
		this.setState(state);
	}

	private buildTransactionObjects(subCategoryId:string, month:DateWithoutTime):Array<ITransactionObject> {

		var entitiesCollection = this.props.entitiesCollection;
		var uncatgorizedSubCategoryId = entitiesCollection.subCategories.getUncategorizedSubCategory().entityId;
		// Get all the scheduled transactions 
		var scheduledTransactions = entitiesCollection.scheduledTransactions.getAllItems();
		var transactionObjects:Array<ITransactionObject> = [];
		_.forEach(scheduledTransactions, (scheduledTransaction)=>{
			if(scheduledTransaction.isTombstone == 0 && scheduledTransaction.upcomingInstances != null && scheduledTransaction.subCategoryId == subCategoryId) {

				if(subCategoryId == uncatgorizedSubCategoryId && scheduledTransaction.subCategoryId == null || subCategoryId == scheduledTransaction.subCategoryId) {

					var account = entitiesCollection.accounts.getEntityById(scheduledTransaction.accountId);
					var accountName = account ? account.accountName : "";
					var payee = scheduledTransaction.payeeId ? entitiesCollection.payees.getEntityById(scheduledTransaction.payeeId) : null;
					var payeeName = payee ? payee.name : "";

					// Get the array of dates by parsing the upcomingInstances string
					var upcomingInstanceDates = SerializationUtilities.deserializeDateArray(scheduledTransaction.upcomingInstances);
					// Iterate through all the upcoming instance dates, and if any of these falls within the passed month, then add a
					// transaction object for it into the transactionObjects array
					_.forEach(upcomingInstanceDates, (upcomingInstanceDate)=>{

						if(upcomingInstanceDate.equalsByMonth(month)) {
							var transactionObject:ITransactionObject = {
								entityId: KeyGenerator.getScheduledTransactionTransactionId(scheduledTransaction, upcomingInstanceDate),
								isTransaction: true,
								account: accountName,
								date: upcomingInstanceDate.getUTCTime(),
								payee: payeeName,
								category: "",
								memo: scheduledTransaction.memo,
								amount: scheduledTransaction.amount
							} 

							transactionObjects.push(transactionObject);
						}
					});
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
						<div style={TitleStyle}>{this.state.subCategory.name}</div>
						<PTransactionsList 
							dataFormatter={this.props.dataFormatter}
							showAccountColumn={true}
							showCategoryColumn={false}
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