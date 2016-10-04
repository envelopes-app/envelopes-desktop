/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Badge } from 'react-bootstrap';

import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PBalanceValueProps {
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
	onClick:(event:React.MouseEvent)=>void;
}

const BalanceValueStyle = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#FFFFFF",
	cursor: 'pointer',
}

const BalanceValueGreyStyle = Object.assign({}, BalanceValueStyle, {
	backgroundColor: "#CFD5D8"
});

const BalanceValueGreenStyle = Object.assign({}, BalanceValueStyle, {
	backgroundColor: "#138B2E"
});

const BalanceValueOrangeStyle = Object.assign({}, BalanceValueStyle, {
	backgroundColor: "#C37B00"
});

const BalanceValueRedStyle = Object.assign({}, BalanceValueStyle, {
	backgroundColor: "#B43326"
});

export class PBalanceValue extends React.Component<PBalanceValueProps, {}> {

	public render() {

		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var cashOutflows = monthlySubCategoryBudget ? monthlySubCategoryBudget.cashOutflows : 0;
		var creditOutflows = monthlySubCategoryBudget ? monthlySubCategoryBudget.creditOutflows : 0;
		var balance = monthlySubCategoryBudget ? monthlySubCategoryBudget.balance : 0;
		var upcomingTransactions = monthlySubCategoryBudget ? monthlySubCategoryBudget.upcomingTransactions : 0;
		var balanceAfterUpcoming = balance - upcomingTransactions;

		var absBalance = Math.abs(balance);
		var absCashOutflow = Math.abs(cashOutflows);

		var balanceValueStyle;
		if(balance < 0) {
			// if we have overspent with cash, then this would be red. If we have overspent
			// just by credit, this would be orange.
			if(balance + absCashOutflow >= 0) 
				balanceValueStyle = BalanceValueOrangeStyle;
			else
				balanceValueStyle = BalanceValueRedStyle;
		}
		else {
			// Balance is 0 or greater
			if(upcomingTransactions == 0) {
				// There are no upcoming transactions. We can decide based on just the balance
				if(balance == 0)
					balanceValueStyle = BalanceValueGreyStyle;
				else // balance > 0
					balanceValueStyle = BalanceValueGreenStyle;
			}
			else {
				// There are upcomingTransactions. We have to decide based on balanceAfterUpcoming
				if(balanceAfterUpcoming < 0)
					balanceValueStyle = BalanceValueOrangeStyle;
				else // balanceAfterUpcoming >= 0
					balanceValueStyle = BalanceValueGreenStyle;
			}
		}

    	return (
			<Badge style={balanceValueStyle} onClick={this.props.onClick}>{balance}</Badge>
		);
  	}
}