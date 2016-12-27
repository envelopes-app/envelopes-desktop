/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PHeaderAccountName } from './PHeaderAccountName';
import { PHeaderValue } from './PHeaderValue';

import { DataFormatter } from '../../../utilities';

export interface PRegisterHeaderProps {
	accountName:string;
	clearedBalance:number;
	unclearedBalance:number;
	workingBalance:number;
	selectedTotal:number;
	selectedCount:number;
	showReconcileButton:boolean;

	dataFormatter:DataFormatter;
	showReconcileAccountDialog:(element:HTMLElement)=>void;
}

const RegisterHeaderContainerStyle:React.CSSProperties = {
	flex: '0 0 auto',
	height: '70px',
	width: '100%',
	backgroundColor: '#003540',
	paddingLeft: '0px',
	paddingRight: '5px'
}

const RegisterHeaderStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '100%',
	width: '100%',
	paddingRight: '5px'
}

const SymbolStyle:React.CSSProperties = {
	color: '#588697',
	padding: '10px',
	fontSize: '16px',
	fontWeight: 'bold'
}

const ReconcileAccountButtonStyle:React.CSSProperties = {
	width: '100px',
	color: '#009CC2',
	borderColor: '#009CC2',
	borderStyle: 'solid',
	backgroundColor: '#005164',
	borderWidth: '1px',
	borderRadius: '3px',
	marginLeft: '10px',
	outline: "none"
}

export class PRegisterHeader extends React.Component<PRegisterHeaderProps, {}> {
  
	private reconcileButton:HTMLButtonElement;

  	constructor(props:PRegisterHeaderProps) {
        super(props);
		this.onReconcileAccountClick = this.onReconcileAccountClick.bind(this);
    }

	private onReconcileAccountClick():void {
		this.props.showReconcileAccountDialog(this.reconcileButton);
	}

	private getHeaderContents():Array<JSX.Element> {

		var dataFormatter = this.props.dataFormatter;
		var headerContents = [
			<PHeaderAccountName key="account_name" text={this.props.accountName} />,
			<PHeaderValue key="cleared_balance" label="Cleared Balance" value={this.props.clearedBalance} formattedValue={dataFormatter.formatCurrency(this.props.clearedBalance)} />,
			<text key="plus_symbol" style={SymbolStyle}>+</text>,
			<PHeaderValue key="uncleared_balance" label="Uncleared Balance" value={this.props.unclearedBalance} formattedValue={dataFormatter.formatCurrency(this.props.unclearedBalance)} />,
			<text key="equal_symbol" style={SymbolStyle}>=</text>,
			<PHeaderValue key="working_balance" label="Working Balance" value={this.props.workingBalance} formattedValue={dataFormatter.formatCurrency(this.props.workingBalance)} />
		];

		headerContents.push(<div key="spacer" className="spacer" />);

		if(this.props.selectedCount > 1) {
			var label = `Selected Total (${this.props.selectedCount})`;
			headerContents.push(<PHeaderValue key="selected_total" label={label} value={this.props.selectedTotal} formattedValue={dataFormatter.formatCurrency(this.props.selectedTotal)} />);
		}
			
		if(this.props.showReconcileButton == true) {
			headerContents.push(
				<button key="reconcile_button" style={ReconcileAccountButtonStyle} 
					ref={(b)=> this.reconcileButton = b }
					onClick={this.onReconcileAccountClick}>
					Reconcile Account
				</button>
			);
		}

		return headerContents;
	}

	public render() {

		var headerContents = this.getHeaderContents();
		return (
			<div style={RegisterHeaderContainerStyle}>
				<div style={RegisterHeaderStyle}>
					{headerContents}
				</div>
			</div>
		);
  	}
}