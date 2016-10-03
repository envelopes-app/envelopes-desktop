/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Badge } from 'react-bootstrap';

export interface PBalanceValueProps {
	balance:number;
	upcomingTransactions:number;
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

		var balance = this.props.balance ? this.props.balance : 0;
		var upcomingTransactions = this.props.upcomingTransactions ? this.props.upcomingTransactions : 0;

		var balanceValueStyle;
		if(balance < 0)
			balanceValueStyle = BalanceValueRedStyle;
		else if(balance - upcomingTransactions < 0)
			balanceValueStyle = BalanceValueOrangeStyle;
		else if(balance == 0 && upcomingTransactions == 0)
			balanceValueStyle = BalanceValueGreyStyle;
		else // if(balance - upcomingTransactions > 0)
			balanceValueStyle = BalanceValueGreenStyle;

    	return (
			<Badge style={balanceValueStyle} onClick={this.props.onClick}>{balance}</Badge>
		);
  	}
}