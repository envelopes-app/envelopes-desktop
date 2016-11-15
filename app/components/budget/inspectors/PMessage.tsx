/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';

import { DataFormatter } from '../../../utilities';
import { InternalCategories } from '../../../constants'; 
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PMessageProps {
	dataFormatter:DataFormatter;
	subCategory:budgetEntities.ISubCategory,
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
	showUpcomingTransactionsDialog:(monthlySubCategoryBudgetId:string, element:HTMLElement, placement?:string)=>void;
}

const MessageContainerStyle:React.CSSProperties = {
	paddingTop: "10px",
	paddingLeft: "10px",
	paddingRight: "10px",
	width: "100%",
}

const MessageStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap",
	color: "#003440",
	borderRadius: "8px",
	padding: "10px",
	fontSize: "14px"
}

const MessageRowStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	width: "100%",
	justifyContent: "space-between"
}

const ErrorMessageStyle:React.CSSProperties = Object.assign({}, MessageStyle, {
	backgroundColor: "#F8E1DF"
});

const WarningMessageStyle:React.CSSProperties = Object.assign({}, MessageStyle, {
	backgroundColor: "#FBEED8"
});

const SuccessMessageStyle:React.CSSProperties = Object.assign({}, MessageStyle, {
	backgroundColor: "#DCF1E0"
});

const UpcomingTransactionsCountStyle:React.CSSProperties = {
	textDecoration: "underline",
	cursor: "pointer"
}

export class PMessage extends React.Component<PMessageProps, {}> {

	private upcomingTransactionsRow:HTMLDivElement;

	constructor(props:PMessageProps) {
        super(props);
		this.showUpcomingTransactions = this.showUpcomingTransactions.bind(this);
	}

	private showUpcomingTransactions(event:React.FormEvent<any>):void {
		this.props.showUpcomingTransactionsDialog(this.props.monthlySubCategoryBudget.entityId, this.upcomingTransactionsRow);
	}

	// The overspending message could be an error (red colored) message if the overspending is by cash.
	// It would be a warning message if the overspending is by credit only.
	// Note that the error message wording is slightly different for uncategorized transactions, and other categories.
	// The warning message wording is the same for all of them.
	public render() {

		var element:JSX.Element = <div />;
		var dataFormatter = this.props.dataFormatter;
		var subCategory = this.props.subCategory;
		var isUncategorized = (subCategory.internalName == InternalCategories.UncategorizedSubCategory); 

		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var fromPreviousMonth = monthlySubCategoryBudget.balancePreviousMonth ? monthlySubCategoryBudget.balancePreviousMonth : 0;
		var budgetedThisMonth = monthlySubCategoryBudget.budgeted ? monthlySubCategoryBudget.budgeted : 0;
		var cashOutflows = monthlySubCategoryBudget.cashOutflows ? monthlySubCategoryBudget.cashOutflows : 0;
		var creditOutflows = monthlySubCategoryBudget.creditOutflows ? monthlySubCategoryBudget.creditOutflows : 0;

		var isOverspent = monthlySubCategoryBudget.balance < 0;
		var isCashOverspent = isOverspent && (fromPreviousMonth + budgetedThisMonth + cashOutflows) < 0;
		var cashOverspending = isCashOverspent ? (fromPreviousMonth + budgetedThisMonth + cashOutflows) : 0;

		if(isOverspent) {

			if(isCashOverspent) {
				// For cash overspending, we have slightly different message wordings for 
				// uncategorized transactions and other categories
				if(isUncategorized) {
					element = (
						<div style={MessageContainerStyle}>
							<div style={ErrorMessageStyle}>
								<span>Uncategorized cash transactions still affect your budget! Assign them to categories or <span style={{fontWeight:'bold'}}>{dataFormatter.formatCurrency(-cashOverspending)}</span> will be deducted from the amount you have available to budget next month.</span>
							</div>
						</div>
					);
				}
				else {
					element = (
						<div style={MessageContainerStyle}>
							<div style={ErrorMessageStyle}>
								<span>You've overspent this category by <span style={{fontWeight:'bold'}}>{dataFormatter.formatCurrency(-cashOverspending)}</span>. Cover the overspending from other categories or you can’t trust your budget balances!</span>
							</div>
						</div>
					);
				}
			}
			else {
				// For credit overspending, the message wordings are the same for all
				// We get here only when there is no cash overspending. Hence all the overspending
				// is credit overspending (and that is the balance of the category.)
				element = (
					<div style={MessageContainerStyle}>
						<div style={WarningMessageStyle}>
							<span>You've overspent this category by <span style={{fontWeight:'bold'}}>{dataFormatter.formatCurrency(monthlySubCategoryBudget.balance)}</span> with credit. Cover the overspending from other categories to prevent creating debt!</span>
						</div>
					</div>
				);
			}
		}
		else {
			// We don't have any overspending, meaning we have a positive (or zero) balance. 
			// Lets check the upcoming transactions to make sure we are covered on that front.
			var upcomingTransactions = monthlySubCategoryBudget.upcomingTransactions ? monthlySubCategoryBudget.upcomingTransactions : 0;
			var upcomingTransactionsCount = monthlySubCategoryBudget.upcomingTransactionsCount ? monthlySubCategoryBudget.upcomingTransactionsCount : 0;
			var upcomingTransactionsValue = monthlySubCategoryBudget.upcomingTransactions ? monthlySubCategoryBudget.upcomingTransactions : 0;
			
			if(upcomingTransactionsCount != 0) {
				// We have some upcoming transactions. Make sure that our current balance can cover them
				var balanceAfterUpcoming = monthlySubCategoryBudget.balance + upcomingTransactions; 
				var messageStyle = SuccessMessageStyle;
				if(balanceAfterUpcoming < 0)
					messageStyle = WarningMessageStyle;

				let upcomingTransactionsCountString = upcomingTransactionsCount == 1 ? "1 Upcoming Transaction" : `${upcomingTransactionsCount} Upcoming Transactions`;
				var upcomingTransactionsValueString = dataFormatter.formatCurrency(upcomingTransactionsValue);

				element = (
					<div style={MessageContainerStyle}>
						<div style={messageStyle}>
							<div ref={(d)=> this.upcomingTransactionsRow = d} style={MessageRowStyle}>
								<div style={UpcomingTransactionsCountStyle} onClick={this.showUpcomingTransactions}>{upcomingTransactionsCountString}</div> 
								<div>{upcomingTransactionsValueString}</div> 
							</div>
							<div style={MessageRowStyle}>
								<div>Available After Upcoming</div> 
								<div>{dataFormatter.formatCurrency(balanceAfterUpcoming)}</div> 
							</div>
						</div>
					</div>
				);
			}
		}

		return element;
	}
}