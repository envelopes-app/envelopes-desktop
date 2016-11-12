/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';

import { InternalCategories } from '../../../constants'; 
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PMessageProps {
	subCategory:budgetEntities.ISubCategory,
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget
}

const MessageContainerStyle:React.CSSProperties = {
	paddingTop: "10px",
	paddingLeft: "10px",
	paddingRight: "10px",
}

const MessageStyle:React.CSSProperties = {
	color: "#003440",
	borderRadius: "4px",
	padding: "10px",
	fontSize: "14px"
}

const ErrorMessageStyle:React.CSSProperties = Object.assign({}, MessageStyle, {
	backgroundColor: "#F8E1DF"
});

const WarningMessageStyle:React.CSSProperties = Object.assign({}, MessageStyle, {
	backgroundColor: "#FBEED8"
});

export class PMessage extends React.Component<PMessageProps, {}> {

	// The overspending message could be an error (red colored) message if the overspending is by cash.
	// It would be a warning message if the overspending is by credit only.
	// Note that the error message wording is slightly different for uncategorized transactions, and other categories.
	// The warning message wording is the same for all of them.
	public render() {

		var element:JSX.Element = <div />;
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
								Uncategorized cash transactions still affect your budget! Assign them to categories or <span style={{fontWeight:'bold'}}>{-cashOverspending}</span> will be deducted from the amount you have available to budget next month.
							</div>
						</div>
					);
				}
				else {
					element = (
						<div style={MessageContainerStyle}>
							<div style={ErrorMessageStyle}>
								You've overspent this category by <span style={{fontWeight:'bold'}}>{-cashOverspending}</span>. Cover the overspending from other categories or you can’t trust your budget balances!
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
							You've overspent this category by <span style={{fontWeight:'bold'}}>{monthlySubCategoryBudget.balance}</span> with credit. Cover the overspending from other categories to prevent creating debt!
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
			
			if(upcomingTransactionsCount) {
				// We have some upcoming transactions. Make sure that our current balance can cover them
				var balanceAfterUpcoming = monthlySubCategoryBudget.balance + upcomingTransactions; 
				if(balanceAfterUpcoming < 0) {
					// Warn the user he needs to budget more in order to cover these upcoming transactions

					// TODO: Once we have Scheduled Transaction creation, complete this.
				}
			}
		}

		return element;
	}
}