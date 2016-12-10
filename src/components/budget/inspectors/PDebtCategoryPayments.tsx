/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ProgressBar } from 'react-bootstrap';

import { DataFormatter, DateWithoutTime } from '../../../utilities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PDebtCategoryPaymentsProps {
	dataFormatter:DataFormatter;
	account:budgetEntities.IAccount;
	subCategory:budgetEntities.ISubCategory;
	monthlySubCategoryBudget:budgetEntities.IMonthlySubCategoryBudget;
}

export interface PDebtCategoryPaymentsState { }

const OrangeColor = "#E59100";
const GreenColor = "#16A336";

const PaymentsContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap",
	justifyContent: "flex-start",
	width: "100%",
	paddingTop: "10px",
	paddingLeft: "10px",
	paddingRight: "10px"
}

const NothingToPayMessageStyle:React.CSSProperties = {
	fontSize: "20px",
	color: "#003440",
	width: "100%",
	textAlign: "center",
	marginTop: "10px",
	marginBottom: "10px"
}

const PaymentMessageContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap",
	paddingLeft: "10px",
	paddingRight: "10px"
}

const PaymentMessageStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#003440",
	width: "100%",
	textAlign: "left",
	marginTop: "10px",
	marginBottom: "10px"
}

const ProgressBarStyle:React.CSSProperties = {
	height: "10px",
	marginBottom: "0px",
	backgroundColor: "#FFFFFF"
}

const ProgressBarMessageStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal",
	fontStyle: "italic",
	color: "#003440",
	width: "100%",
	textAlign: "left",
	marginTop: "5px",
	marginBottom: "5px"
}

export class PDebtCategoryPayments extends React.Component<PDebtCategoryPaymentsProps, PDebtCategoryPaymentsState> {

	constructor(props:PDebtCategoryPaymentsProps) {
        super(props);
	}

	private getContentForNothingToPay():JSX.Element {

		return (
			<label style={NothingToPayMessageStyle}>NOTHING TO PAY.</label>
		);
	}

	private getContentForPaymentMessage(payment:number, accountBalanceAfterPayment:number, changeInDebt:number):JSX.Element {

		var dataFormatter = this.props.dataFormatter;
		var creditSpendingsSinceLastPaymentPercentage = `${this.getCreditSpendingSinceLastPaymentPercentage()}%`;
		var availableForPaymentPercentage = `${this.getAvailableForPaymentPercentage()}%`;

		var paymentMessage:JSX.Element;
		if(changeInDebt == 0) {
			paymentMessage = (
				<label style={PaymentMessageStyle}>If you pay <strong>{dataFormatter.formatCurrency(payment)}</strong>, your account balance will be <strong>{dataFormatter.formatCurrency(accountBalanceAfterPayment)}</strong>.</label>
			);
		}
		else if(changeInDebt > 0) {
			paymentMessage = (
				<label style={PaymentMessageStyle}>If you pay <strong>{dataFormatter.formatCurrency(payment)}</strong>, your account balance will be <strong>{dataFormatter.formatCurrency(accountBalanceAfterPayment)}</strong> and you will decrease your debt by <strong>{dataFormatter.formatCurrency(changeInDebt)}</strong>.</label>
			);
		}
		else {
			paymentMessage = (
				<label style={PaymentMessageStyle}>If you pay <strong>{dataFormatter.formatCurrency(payment)}</strong>, your account balance will be <strong>{dataFormatter.formatCurrency(accountBalanceAfterPayment)}</strong> and you will increase your debt by <strong>{dataFormatter.formatCurrency(changeInDebt)}</strong>.</label>
			);
		}

		return (
			<div style={PaymentMessageContainer}>
				{paymentMessage}
				<hr className="inspector-horizontal-rule" />
				<div className="progress" style={ProgressBarStyle}>
					<div className="progress-bar" role="progressbar" style={{width: creditSpendingsSinceLastPaymentPercentage, backgroundColor: OrangeColor}} />
				</div>
				<label style={ProgressBarMessageStyle}><strong>{dataFormatter.formatCurrency(this.props.monthlySubCategoryBudget.allSpendingSinceLastPayment)}</strong> credit spending since last payment</label>
				<div className="progress" style={ProgressBarStyle}>
					<div className="progress-bar" role="progressbar" style={{width: availableForPaymentPercentage, backgroundColor: GreenColor}} />
				</div>
				<label style={ProgressBarMessageStyle}><strong>{dataFormatter.formatCurrency(this.props.monthlySubCategoryBudget.balance)}</strong> available for payment</label>
			</div>
		);
	}

	private getCappedPercentageValue(numerator:number, denominator:number):number {

		if (numerator >= denominator) 
			return 100;
		else if (denominator <= 0) 
			return 0;
		else
			return (numerator / denominator) * 100;
	}

	public getCreditSpendingSinceLastPaymentPercentage():number {

		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var allSpendingSinceLastPayment = monthlySubCategoryBudget.allSpendingSinceLastPayment;
		if(allSpendingSinceLastPayment >= 0)
			return 0;

		var balance = monthlySubCategoryBudget.balance;
		if(balance <= 0)
			return 100;

		return this.getCappedPercentageValue(Math.abs(allSpendingSinceLastPayment), balance);
	}

	public getAvailableForPaymentPercentage():number {

		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var allSpendingSinceLastPayment = monthlySubCategoryBudget.allSpendingSinceLastPayment;
		var balance = monthlySubCategoryBudget.balance;

		if(balance <= 0)
			return 0;

		return this.getCappedPercentageValue(balance, allSpendingSinceLastPayment);
	}

	public render() {

		var debtAccount = this.props.account;
		var debtSubCategory = this.props.subCategory;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudget;
		var sectionContents:JSX.Element = null;

		var accountBalance = debtAccount.clearedBalance + debtAccount.unclearedBalance;
		var subCategoryBalance = monthlySubCategoryBudget.balance;
		var balanceAfterPayment = accountBalance + subCategoryBalance;
		var allSpendingSinceLastPayment = monthlySubCategoryBudget.allSpendingSinceLastPayment;
		// If subCategoryBalance is negative, cap it to zero as we can't recomment paying negative amounts
		if(subCategoryBalance < 0)
			subCategoryBalance = 0;

		if(accountBalance >= 0) {
			sectionContents = this.getContentForNothingToPay();
		}
		else if(balanceAfterPayment > 0) {
			// Available payment will take the account balance positive and remove the debt
			sectionContents = this.getContentForPaymentMessage(subCategoryBalance, balanceAfterPayment, 0);
		}
		else {

			var changeInDebt = allSpendingSinceLastPayment + subCategoryBalance;
			sectionContents = this.getContentForPaymentMessage(subCategoryBalance, balanceAfterPayment, changeInDebt);
		}

		return (
			<div style={PaymentsContainerStyle}>
				<div className="inspector-section-header">
					PAYMENTS
				</div>
				{sectionContents}
			</div>
		);
	}
}