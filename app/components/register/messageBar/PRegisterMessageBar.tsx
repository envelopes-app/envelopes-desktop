/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon } from 'react-bootstrap';

import { IEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PRegisterMessageBarProps {
	accountId:string;
	isAllAccounts:boolean;
	entitiesCollection:IEntitiesCollection;
}

const RegisterMessageBarContainerStyle = {
	flex: '0 0 auto',
	width: "100%",
}

const RegisterMessageBarStyle = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "center",
	color: "#FFFFFF",
	padding: "8px",
	fontSize: "20px"
}

const RegisterMessageBarInfoStyle = Object.assign({}, RegisterMessageBarStyle, {
	backgroundColor: "#34ADBD"
});

const RegisterMessageBarWarningStyle = Object.assign({}, RegisterMessageBarStyle, {
	backgroundColor: "#E59100"
});

export class PRegisterMessageBar extends React.Component<PRegisterMessageBarProps, {}> {

	private getInfoAndWarningCounts():{infoCount:number, warningCount:number, message:string} {

		var retVal = {infoCount: 0, warningCount: 0, message: ""};
		var accountId = this.props.accountId;
		var accounts = this.props.entitiesCollection.accounts;

		if(!accounts || accounts.length == 0)
			return retVal;

		if(this.props.isAllAccounts) {

			// Iterate through all the accounts and sum up the info/warning counts
			_.forEach(accounts, (account)=>{

				if(account.isTombstone == 0) {

					// InfoCounts will be included from both budget and tracking accounts
					retVal.infoCount += account.infoCount;
					// WarningCounts are only taken from onBudget accounts
					if(account.onBudget == 1) 
						retVal.warningCount += account.warningCount;
				}
			});
		}
		else {

			var account = accounts.getEntityById(accountId);
			retVal.infoCount += account.infoCount;
			if(account.onBudget == 1) 
				retVal.warningCount += account.warningCount;
		}

		var infoMessage, warningMessage, fullMessage:string;
		if(retVal.infoCount > 0) {
			if(retVal.infoCount == 1)
				infoMessage = "1 transaction needs approval";
			else 
				infoMessage = `${retVal.infoCount} transactions need approval`;
		}

		if(retVal.warningCount > 0) {
			if(retVal.warningCount == 1)
				warningMessage = "1 transaction needs a category";
			else 
				warningMessage = `${retVal.infoCount} transactions need a category`;
		}

		if(retVal.infoCount == 0 && retVal.warningCount == 0)
			fullMessage = "";
		else if(retVal.infoCount > 0 && retVal.warningCount == 0)
			fullMessage = infoMessage;
		else if(retVal.infoCount == 0 && retVal.warningCount > 0)
			fullMessage = warningMessage;
		else 
			fullMessage = `${infoMessage} and ${warningMessage}`;
		
		retVal.message = fullMessage;
		return retVal;
	}

	public render() {

		debugger;
		var infoAndWarningCounts = this.getInfoAndWarningCounts();
		
		if(infoAndWarningCounts.infoCount == 0 && infoAndWarningCounts.warningCount == 0) {
			return (
				<div style={RegisterMessageBarContainerStyle} />
			);
		}
		else if(infoAndWarningCounts.infoCount != 0 && infoAndWarningCounts.warningCount == 0) {
			return (
				<div style={RegisterMessageBarContainerStyle}>
					<div style={RegisterMessageBarInfoStyle}>
						<Glyphicon glyph="info-sign" />&nbsp;{infoAndWarningCounts.message}
					</div>
				</div>
			);
		}
		else if(infoAndWarningCounts.infoCount == 0 && infoAndWarningCounts.warningCount != 0) {
			return (
				<div style={RegisterMessageBarContainerStyle}>
					<div style={RegisterMessageBarWarningStyle}>
						<Glyphicon glyph="info-sign" />&nbsp;{infoAndWarningCounts.message}
					</div>
				</div>
			);
		}
		else {
			return (
				<div style={RegisterMessageBarContainerStyle}>
					<div style={RegisterMessageBarInfoStyle}>
						<Glyphicon glyph="info-sign" />&nbsp;{infoAndWarningCounts.message}
					</div>
				</div>
			);
		}
	}
}