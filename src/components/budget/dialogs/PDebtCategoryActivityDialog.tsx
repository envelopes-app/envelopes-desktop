/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon, Overlay, Popover } from 'react-bootstrap';

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
	spending:string;
	returns:string;
	payments:string;
	totalSpending:string;
	budgetedSpending:string;
	paymentsAndReturns:string;
	totalActivity:string;
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

const SummariesContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	width: "100%",
	borderColor: "#E7EAEB",
	borderWidth: "1px",
	borderStyle: "solid",
	borderTopLeftRadius: "4px",
	borderTopRightRadius: "4px",
}

const VerticalSeparator:React.CSSProperties = {
	flex: "0 0 auto",
	backgroundColor: "#FFFFFF",
	width: "1px",
	height: "100%"
}

const LeftSummaryContainer:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	width: "50%",
	flexFlow: "column nowrap",
	backgroundColor: "#E7EAEB",
	borderTopLeftRadius: "4px",
	paddingTop: "5px",
	paddingBottom: "5px",
	paddingLeft: "10px",
	paddingRight: "10px",
}

const RightSummaryContainer:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	width: "50%",
	flexFlow: "column nowrap",
	backgroundColor: "#E7EAEB",
	borderTopRightRadius: "4px",
	paddingTop: "5px",
	paddingBottom: "5px",
	paddingLeft: "10px",
	paddingRight: "10px",
}

const SummaryRow:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: "space-between"
}

const NormalLabel:React.CSSProperties = {
	flex: "0 0 auto",
	fontSize: "14px",
	fontWeight: "normal"
}

const BoldLabel:React.CSSProperties = {
	flex: "0 0 auto",
	fontSize: "14px",
	fontWeight: "bold"
}

const BoldValue:React.CSSProperties = {
	flex: "1 1 auto",
	fontSize: "14px",
	fontWeight: "bold",
	textAlign: "right"
}

const HorizontalSeparator:React.CSSProperties = {
	width: "100%",
	marginTop: "0px",
	marginBottom: "5px",
	borderTop: "1px dashed #000000"
}
export class PDebtCategoryActivityDialog extends React.Component<PDebtCategoryActivityDialogProps, PDebtCategoryActivityDialogState> {

	constructor(props:PDebtCategoryActivityDialogProps) {
        super(props);
		this.hide = this.hide.bind(this);
		this.onCloseClick = this.onCloseClick.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"left",
			subCategoryName:null,
			transactions:null,
			spending:"",
			returns:"",
			payments:"",
			totalSpending:"",
			budgetedSpending:"",
			paymentsAndReturns:"",
			totalActivity:""
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
			this.buildTransactionObjects(account.entityId, month, state);
			this.setState(state);
		}
	}

	private buildTransactionObjects(accountId:string, month:DateWithoutTime, state:PDebtCategoryActivityDialogState):void {

		var entitiesCollection = this.props.entitiesCollection;
		var dataFormatter = this.props.dataFormatter;
		var startingBalancePayeeId = entitiesCollection.payees.getStartingBalancePayee().entityId;
		// Get all the transactions for the specified month
		var transactions = entitiesCollection.transactions.getTransactionsByMonth(month);
		var subCategory = entitiesCollection.subCategories.getDebtSubCategoryForAccount(accountId);
		var monthlySubCategoryBudget = entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(subCategory.entityId, month.toISOString());

		var transactionObjects:Array<ITransactionObject> = [];
		var spending:number = 0;
		var returns:number = 0;
		var payments:number = 0;
		var totalSpending = 0;
		var budgetedSpending = 0;
		var totalActivity = 0;

		_.forEach(transactions, (transaction)=>{
			if(transaction.accountId == accountId && transaction.isTombstone == 0 
				&& transaction.payeeId != startingBalancePayeeId && transaction.source != TransactionSources.Matched) {

				var payee = transaction.payeeId ? entitiesCollection.payees.getEntityById(transaction.payeeId) : null;
				var payeeName = payee ? payee.name : "";
				var subCategory = transaction.subCategoryId ? entitiesCollection.subCategories.getEntityById(transaction.subCategoryId) : null;
				var masterCategory = subCategory ? entitiesCollection.masterCategories.getEntityById(subCategory.masterCategoryId) : null;
				var subCategoryName = subCategory && masterCategory ? masterCategory.name + ": " + subCategory.name : "";
				
				if(!payee && transaction.amount < 0)
					spending += transaction.amount;
				else if(!payee && transaction.amount > 0)
					returns += transaction.amount;
				else if(payee && transaction.amount > 0)
					payments += transaction.amount;
					
				var transactionObject:ITransactionObject = {
					entityId: transaction.entityId,
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
		// Set the calculated values in the passed state object
		state.transactions = transactionObjects;
		state.spending = dataFormatter.formatCurrency(spending);
		state.returns = dataFormatter.formatCurrency(returns);
		state.payments = dataFormatter.formatCurrency(payments);
		state.totalSpending = dataFormatter.formatCurrency(spending + returns);
		state.budgetedSpending = dataFormatter.formatCurrency(monthlySubCategoryBudget.positiveCashOutflows);
		state.paymentsAndReturns = "-" + dataFormatter.formatCurrency(payments + returns);
		state.totalActivity = dataFormatter.formatCurrency(monthlySubCategoryBudget.positiveCashOutflows - payments - returns);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PDebtCategoryActivityDialogState;
		state.show = false;
		this.setState(state);
	}

	public render() {

		if(this.state.show) {
			return (
				<Overlay show={this.state.show} placement={this.state.placement} 
					rootClose={true} onHide={this.onCloseClick} target={()=> ReactDOM.findDOMNode(this.state.target)}>
					<Popover id="debtCategoryActivityDialog" style={PopoverStyle}>
						<div style={TitleStyle}>{this.state.subCategoryName}</div>
						<div style={SummariesContainer}>
							<div style={LeftSummaryContainer}>
								<div style={SummaryRow}>
									<label style={NormalLabel} title="This card's total spending for the month.">Spending</label>
									<label style={BoldValue} title={this.state.spending}>{this.state.spending}</label>
								</div>
								<div style={SummaryRow}>
									<label style={NormalLabel} title="This card's total returns for the month. This does not include payments.">Returns</label>
									<label style={BoldValue} title={this.state.returns}>{this.state.returns}</label>
								</div>
								<hr style={HorizontalSeparator} />
								<div style={SummaryRow}>
									<label style={BoldLabel} title="This card's total spending and returns this month.">Total Spending</label>
									<label style={BoldValue} title={this.state.totalSpending}>{this.state.totalSpending}</label>
								</div>
							</div>
							<div style={VerticalSeparator} />
							<div style={RightSummaryContainer}>
								<div style={SummaryRow}>
									<label style={NormalLabel} title="The budgeted cash moved here for payment, to cover this card's spending.">Budgeted Spending</label>
									<label style={BoldValue} title={this.state.budgetedSpending}>{this.state.budgetedSpending}</label>
								</div>
								<div style={SummaryRow}>
									<label style={NormalLabel} title="The cash removed from this category because of returns or payments.">Payments &amp; Returns</label>
									<label style={BoldValue} title={"Payments:-" + this.state.payments + ", Returns:-" + this.state.returns}>{this.state.paymentsAndReturns}</label>
								</div>
								<hr style={HorizontalSeparator} />
								<div style={SummaryRow}>
									<label style={BoldLabel} title="The total cash added and removed from this card's payment category.">Total Activity</label>
									<label style={BoldValue} title={this.state.totalActivity}>{this.state.totalActivity}</label>
								</div>
							</div>
						</div>
						<PTransactionsList 
							dataFormatter={this.props.dataFormatter}
							showAccountColumn={false}
							showCategoryColumn={true}
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
