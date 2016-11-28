/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Checkbox, ControlLabel, FormControl, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { DataFormatter } from '../../../utilities';
import { IRegisterState } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PReconcileAccountDialogProps {
	dataFormatter:DataFormatter;
	reconcileAccount:(account:budgetEntities.IAccount, actualCurrentBalance:number)=>void;
}

export interface PReconcileAccountDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	currentStep:number;
	enteredBalanceString:string;
	enteredBalanceNumber:number;
	// Account that we are currently reconciling
	account:budgetEntities.IAccount;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'300px',
	paddingBottom:"10px"
}

const ControlsContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap",
	justifyContent: "center",
	textAlign: "center"
}

const InternalContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: "center",
	textAlign: "center"
}

const FormControlStyle:React.CSSProperties = {
	borderColor: "#88979d",
	backgroundColor: "f8f8f8",
	borderWidth: "2px",
	borderRadius: "3px",
	marginRight: "5px",
	marginBottom: "10px",
	height: "30px"
}

const YesButtonStyle:React.CSSProperties = {
	width: "90px"
}

const NoButtonStyle:React.CSSProperties = {
	width: "90px",
	marginLeft: "5px"
}

const PositiveValueColor = "#57B66D";
const NegativeValueColor = "#CA6D64";

export class PReconcileAccountDialog extends React.Component<PReconcileAccountDialogProps, PReconcileAccountDialogState> {

	constructor(props:PReconcileAccountDialogProps) {
        super(props);
		this.hide = this.hide.bind(this);
		this.onStep1YesClick = this.onStep1YesClick.bind(this);
		this.onStep1NoClick = this.onStep1NoClick.bind(this);
		this.onStep2BalanceChange = this.onStep2BalanceChange.bind(this);
		this.onStep2OkClick = this.onStep2OkClick.bind(this);
		this.onStep3CreateAdjustmentAndFinishClick = this.onStep3CreateAdjustmentAndFinishClick.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"bottom",
			currentStep: 0,		
			enteredBalanceString: "",	
			enteredBalanceNumber: 0,	
			account: null
		};
	}

	private onStep1YesClick():void { 

		var account = this.state.account;
		// The account balance is correct. We can proceed to reconciling the account.
		this.props.reconcileAccount(account, account.clearedBalance);
		// Show the success message.
		var state = Object.assign({}, this.state);
		state.currentStep = 4;
		this.setState(state);
	}

	private onStep1NoClick():void { 

		// The account balance is not correct. Proceed to step 2 get the current account balance.
		var state = Object.assign({}, this.state);
		state.currentStep = 2;
		this.setState(state);
	}

	private onStep2BalanceChange(event:React.FormEvent<any>):void {
		// Update the value in the state
		var value = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state);
		state.enteredBalanceString = value;
		this.setState(state);
	}

	private onStep2OkClick():void {

		var numericValue = parseFloat(this.state.enteredBalanceString);
		if(!isNaN(numericValue)) {

			var account = this.state.account;
			var accountBalance = account.clearedBalance;
			// If the entered number is different then the current account balance, then 
			// go to step 3 to ask the user, if we can create an adjustment transaction.
			if(accountBalance != numericValue) {

				let state = Object.assign({}, this.state);
				state.enteredBalanceNumber = numericValue;
				state.currentStep = 3;
				this.setState(state);
			}
			else {
				// The account balance is correct. We can proceed to reconciling the account.
				this.props.reconcileAccount(account, accountBalance);
				// Show the success message.
				let state = Object.assign({}, this.state);
				state.currentStep = 4;
				this.setState(state);
			}
		}
	}

	private onStep3CreateAdjustmentAndFinishClick():void {

		// Proceed to reconciling the account with the balance entered by the user.
		var account = this.state.account;
		this.props.reconcileAccount(account, this.state.enteredBalanceNumber);
		// Show the success message.
		let state = Object.assign({}, this.state);
		state.currentStep = 4;
		this.setState(state);
	}

	public isShowing():boolean {
		return this.state.show;
	}

	public show(account:budgetEntities.IAccount, target:HTMLElement, placement:string = "left"):void {

		var state = Object.assign({}, this.state) as PReconcileAccountDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		// Copy the values from the passed register state object into the local state
		state.account = account;
		state.currentStep = 1;
		state.enteredBalanceString = "";
		state.enteredBalanceNumber = 0;
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PReconcileAccountDialogState;
		state.show = false;
		this.setState(state);
	}

	private getStep1Contents():Array<JSX.Element> {

		var account = this.state.account;
		var currentBalance = account.clearedBalance;
		var dataFormatter = this.props.dataFormatter;
		var balanceStyle:React.CSSProperties = {
			fontSize: "32px",
			fontWeight: "normal",
			color: currentBalance < 0 ? NegativeValueColor : PositiveValueColor
		};

		return [
			<div key="step1-controls" style={ControlsContainerStyle}>
				<div style={InternalContainerStyle}>
					<label style={{fontSize: "16px", fontWeight: "normal"}}>Is your</label>
					<label style={{fontSize: "16px", fontWeight: "bold"}}>&nbsp;current&nbsp;</label>
					<label style={{fontSize: "16px", fontWeight: "normal"}}>account balance</label>
				</div>
				<div style={InternalContainerStyle}>
					<label style={balanceStyle}>{dataFormatter.formatCurrency(currentBalance)}</label>
					<div style={{width: "3px"}} />
					<label style={{fontSize: "32px", fontWeight: "normal"}}>?</label>
				</div>
			</div>,
			<div key="step1-buttons" className="buttons-container" style={{justifyContent:"center"}}>
				<button className="dialog-primary-button" style={YesButtonStyle} onClick={this.onStep1YesClick}> 
					YES&nbsp;<Glyphicon glyph="ok-circle"/>
				</button>
				<div style={{width:"8px"}} />
				<button className="dialog-primary-button" style={NoButtonStyle} onClick={this.onStep1NoClick}> 
					NO&nbsp;<Glyphicon glyph="remove-circle"/>
				</button>
			</div>
		];
	}

	private getStep2Contents():Array<JSX.Element> {

		return [
			<div key="step2-controls" style={ControlsContainerStyle}>
				<div style={InternalContainerStyle}>
					<label style={{fontSize: "16px", fontWeight: "normal"}}>Enter your</label>
					<label style={{fontSize: "16px", fontWeight: "bold"}}>&nbsp;current&nbsp;</label>
					<label style={{fontSize: "16px", fontWeight: "normal"}}>balance:</label>
				</div>
				<FormControl style={FormControlStyle} componentClass="input" onChange={this.onStep2BalanceChange} />
			</div>,
			<div key="step2-buttons" className="buttons-container" style={{justifyContent:"center"}}>
				<button className="dialog-primary-button" style={YesButtonStyle} onClick={this.onStep2OkClick}> 
					OK&nbsp;<Glyphicon glyph="ok-circle"/>
				</button>
			</div>
		];
	}

	private getStep3Contents():Array<JSX.Element> {

		var message:string;
		var accountBalance = this.state.account.clearedBalance;
		var userEnteredBalance = this.state.enteredBalanceNumber;
		var dataFormatter = this.props.dataFormatter;

		if(accountBalance < userEnteredBalance) {
			message = `This account's cleared balance in ENAB is ${dataFormatter.formatCurrency(userEnteredBalance - accountBalance)} lower than your actual account.`;
		}
		else {
			message = `This account's cleared balance in ENAB is ${dataFormatter.formatCurrency(accountBalance - userEnteredBalance)} higher than your actual account.`;
		}
		
		return [
			<div key="step3-controls" style={ControlsContainerStyle}>
				<div style={InternalContainerStyle}>
					<label style={{fontSize: "16px", fontWeight: "normal"}}>{message}</label>
				</div>
			</div>,
			<div key="step3-buttons" className="buttons-container" style={{justifyContent:"center"}}>
				<button className="dialog-primary-button" onClick={this.onStep3CreateAdjustmentAndFinishClick}> 
					Create Adjustment &amp; Finish
				</button>
			</div>
		];
	}

	private getStep4Contents():Array<JSX.Element> {

		return [
			<div key="step4-controls" style={ControlsContainerStyle}>
				<Glyphicon glyph="ok-circle" style={{fontSize:"60px", color:"#57B66D"}}/>
				<div style={InternalContainerStyle}>
					<label style={{fontSize: "26px", fontWeight: "normal"}}>Account Reconciled!</label>
				</div>
			</div>
		];
	}

	public render() {

		if(this.state.show) {

			var dialogContents;
			if(this.state.currentStep == 1)
				dialogContents = this.getStep1Contents();
			else if(this.state.currentStep == 2)
				dialogContents = this.getStep2Contents();
			else if(this.state.currentStep == 3)
				dialogContents = this.getStep3Contents();
			else if(this.state.currentStep == 4)
				dialogContents = this.getStep4Contents();

			return (
				<Overlay key="overlay" rootClose={true} show={this.state.show} placement={this.state.placement} 
					onHide={this.hide} target={ ()=> ReactDOM.findDOMNode(this.state.target) }>
					<Popover id="filterTransactions" style={PopoverStyle}>
						<div style={{paddingBottom: "10px"}}>
							{dialogContents}
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