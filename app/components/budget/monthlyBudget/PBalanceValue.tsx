/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Badge } from 'react-bootstrap';

import { DataFormatter } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PBalanceValueProps {
	dataFormatter:DataFormatter;
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
	onClick?:(event:React.MouseEvent<any>)=>void;
}

export class PBalanceValue extends React.Component<PBalanceValueProps, {}> {

	public render() {

		var dataFormatter = this.props.dataFormatter;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var fromPreviousMonth = monthlySubCategoryBudget && monthlySubCategoryBudget.balancePreviousMonth ? monthlySubCategoryBudget.balancePreviousMonth : 0;
		var budgeted = monthlySubCategoryBudget ? monthlySubCategoryBudget.budgeted : 0;
		var cashOutflows = monthlySubCategoryBudget ? monthlySubCategoryBudget.cashOutflows : 0;
		var creditOutflows = monthlySubCategoryBudget ? monthlySubCategoryBudget.creditOutflows : 0;
		var balance = monthlySubCategoryBudget ? monthlySubCategoryBudget.balance : 0;
		var upcomingTransactions = (monthlySubCategoryBudget && monthlySubCategoryBudget.upcomingTransactions) ? monthlySubCategoryBudget.upcomingTransactions : 0;
		var balanceAfterUpcoming = balance - upcomingTransactions;
		var balanceBeforeOutflows = fromPreviousMonth + budgeted;

		var className;
		if(balance < 0) {
			// if we have overspent with cash, then this would be red. If we have overspent
			// just by credit, this would be orange.
			if(balanceBeforeOutflows + cashOutflows < 0) 
				className = "budget-row-balance-red";
			else
				className = "budget-row-balance-orange";
		}
		else {
			// Balance is 0 or greater
			if(upcomingTransactions == 0) {
				// There are no upcoming transactions. We can decide based on just the balance
				if(balance == 0)
					className = "budget-row-balance-grey";
				else // balance > 0
					className = "budget-row-balance-green";
			}
			else {
				// There are upcomingTransactions. We have to decide based on balanceAfterUpcoming
				if(balanceAfterUpcoming < 0)
					className = "budget-row-balance-orange";
				else // balanceAfterUpcoming >= 0
					className = "budget-row-balance-green";
			}
		}

		if(!this.props.onClick) {
			return (
				<Badge className={className} style={{cursor:"default"}} onClick={this.props.onClick}>{dataFormatter.formatCurrency(balance)}</Badge>
			);
		}
		else {
			return (
				<Badge className={className} onClick={this.props.onClick}>{dataFormatter.formatCurrency(balance)}</Badge>
			);
		}
  	}
}