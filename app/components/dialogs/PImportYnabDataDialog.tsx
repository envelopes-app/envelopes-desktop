/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Baby from 'babyparse';
import { Button, Modal, Form, FormGroup, FormControl, ControlLabel, Glyphicon } from 'react-bootstrap';

import { AccountTypes, AccountTypeNames } from '../../constants';
import { YNABDataImporter } from '../../persistence';
import { IEntitiesCollection } from '../../interfaces/state';
import { IImportedAccountObject } from '../../interfaces/objects';

export interface PImportYnabDataDialogProps { 
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	importYnabData:(budgetName:string, accountsList:Array<IImportedAccountObject>, budgetRows:Array<any>, registerRows:Array<any>)=>void;
}

export interface PImportYnabDataDialogState {

	showModal:boolean;
	currentStep:number;
	budgetName:string;
	budgetPath:string;
	budgetNameValidationState:string;
	budgetNameValidationMessage:string;
	budgetPathValidationState:string;
	budgetPathValidationMessage:string;
	registerPath:string;
	registerPathValidationState:string;
	registerPathValidationMessage:string;

	// These contain the parsed csv data
	budgetRows:Array<any>;
	registerRows:Array<any>;
	accountList:Array<IImportedAccountObject>
}

const LabelStyle = {
	textAlign: "right",
	paddingRight: "0px"
}

const FormControlsContainer = {
	display: "flex",
	flexFlow: "row nowrap",
	alignContent: "stretch"
}

const BudgetNameInputStyle = {
	flex: "1 1 auto",
	borderColor: '#2FA2B5',
	borderWidth: '2px',
}

const BudgetNameInputErrorStyle = Object.assign({}, BudgetNameInputStyle, {
	borderBottomLeftRadius: "0px",
	borderBottomRightRadius: "0px",
});

const FormInputStyle = {
	flex: "1 1 auto",
	borderColor: '#2FA2B5',
	borderWidth: '2px',
	borderRightWidth: '1px',
	borderTopRightRadius: "0px",
	borderBottomRightRadius: "0px",
}

const FormInputErrorStyle = Object.assign({}, FormInputStyle, {
	borderBottomLeftRadius: "0px",
});

const BrowseButtonStyle = {
	height: '34px',
	borderWidth: '2px',
	borderLeftWidth: '1px',
	borderTopLeftRadius: "0px",
	borderBottomLeftRadius: "0px",
}

const BrowseButtonErrorStyle = Object.assign({}, BrowseButtonStyle, {
	borderBottomRightRadius: "0px",
});

const ErrorMessageStyle = {
	width: "100%",
	color: "#FFFFFF",
	backgroundColor: "#D33C2D",
	fontSize: "12px",
	fontWeight: "normal",
	borderTopLeftRadius: "0px",
	borderTopRightRadius: "0px",
	borderBottomLeftRadius: "3px",
	borderBottomRightRadius: "3px",
	paddingLeft: "8px",
	paddingRight: "8px",
	paddingTop: "3px",
	paddingBottom: "3px"
}

const AccountsListContainerStyle = {
	display: "flex",
	flexFlow: "column nowrap"
}

const ListItemContainer = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "center"
}

const ListHeaderAccountNameLabelStyle = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#4D717A",
	marginBottom: "0px",
	width: "30%"
}

const ListHeaderAccountTypeLabelStyle = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#4D717A",
	marginBottom: "0px",
	width: "70%"
}

const ListStyle = {
	paddingLeft: "0px"	
}

const ListAccountNameStyle = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#4D717A",
	width: "30%"
}

const ListAccountTypeStyle = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#4D717A",
	width: "70%"
}

export class PImportYnabDataDialog extends React.Component<PImportYnabDataDialogProps, PImportYnabDataDialogState> {

	private ctrlBudgetName:FormControl;
	private ctrlBudgetCsvPath:FormControl;
	private ctrlRegisterCsvPath:FormControl;

	constructor(props: any) {
        super(props);
		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
		this.onBudgetNameChange = this.onBudgetNameChange.bind(this);
		this.browseForBudgetFile = this.browseForBudgetFile.bind(this);
		this.browseForRegisterFile = this.browseForRegisterFile.bind(this);
		this.validateStep1 = this.validateStep1.bind(this);
		this.validateStep2 = this.validateStep2.bind(this);
        this.state = { 
			showModal: false,
			currentStep: 0,
			budgetName: "",
			budgetPath: "",
			registerPath: "",
			budgetNameValidationState: null,
			budgetNameValidationMessage: null,
			budgetPathValidationState: null,
			budgetPathValidationMessage: null,
			registerPathValidationState: null,
			registerPathValidationMessage: null,
			budgetRows: null,
			registerRows: null,
			accountList: null
		};
    }

	private onBudgetNameChange(event:React.SyntheticEvent):void {

		var updatedBudgetName = (event.target as HTMLInputElement).value;
		var state = _.assign({}, this.state) as PImportYnabDataDialogState;
		state.budgetName = updatedBudgetName;
		this.setState(state);
	}

	private browseForBudgetFile():void {

		const {dialog} = require('electron').remote;
		var options:Electron.OpenDialogOptions = {
			filters: [{name: 'CSV Files', extensions: ['csv']}],
			properties: ['openFile']
		};
		dialog.showOpenDialog(null, options, (filePaths:Array<string>)=>{

			if(filePaths && filePaths.length > 0) {
				// Save the file path in the state and validate the file
				var state = Object.assign({}, this.state);
				state.budgetPath = filePaths[0];
				this.setState(state);
			}
		});
	}

	private browseForRegisterFile():void {

		const {dialog} = require('electron').remote;
		var options:Electron.OpenDialogOptions = {
			filters: [{name: 'CSV Files', extensions: ['csv']}],
			properties: ['openFile']
		};
		dialog.showOpenDialog(null, options, (filePaths:Array<string>)=>{

			if(filePaths && filePaths.length > 0) {
				// Save the file path in the state and validate the file
				var state = Object.assign({}, this.state);
				state.registerPath = filePaths[0];
				this.setState(state);
			}
		});
	}

	private validateStep1():void {

		var budgetNameValidated:boolean = true;
		var budgetName = this.state.budgetName;
		var state = Object.assign({}, this.state) as PImportYnabDataDialogState;

		// ****************************************************************
		// Validate Budget Name
		// ****************************************************************
		// Ensure that budget name is provided.
		if(budgetName == "") {
			budgetNameValidated = false;
			state.budgetNameValidationState = "error";
			state.budgetNameValidationMessage = "The budget name is required.";
		}
		else {

			// We want to make sure that the budget name is unique. 
			_.forEach(this.props.entitiesCollection.budgets.getAllItems(), (existingBudget)=>{
				if(existingBudget.budgetName == budgetName)
					budgetNameValidated = false;
			});

			if(budgetNameValidated == false) {
				state.budgetNameValidationState = "error";
				state.budgetNameValidationMessage = "This budget name already exists.";
			}
		}

		if(budgetNameValidated) {

			state.budgetNameValidationState = null;
			state.budgetNameValidationMessage = null;
		}

		// ****************************************************************
		// Validate Budget File Path
		// ****************************************************************
		var budgetPathValidated = true;
		if(this.state.budgetPath == "") {
			budgetPathValidated = false;
			state.budgetPathValidationState = 'error';
			state.budgetPathValidationMessage = "We need the 'Budget.csv' file for importing the data.";
		}
		else {
			var parsed = Baby.parseFiles(this.state.budgetPath);
			var budgetRows = parsed.data;
			// As part of validation, we are just going to check the header names to ensure that they are 
			// what we are expecting.
			var firstBudgetRow = budgetRows[0];
			if(
				firstBudgetRow[0].includes("Month") == false || 
				firstBudgetRow[1] != "Category Group/Category" ||
				firstBudgetRow[2] != "Category Group" ||
				firstBudgetRow[3] != "Category" ||
				firstBudgetRow[4] != "Budgeted" ||
				firstBudgetRow[5] != "Activity" ||
				firstBudgetRow[6] != "Available"
			) {
				// The format of the csv file does not match what we were expecting.
				budgetPathValidated = false;
				state.budgetPathValidationState = 'error';
				state.budgetPathValidationMessage = 'This file is not in the correct format. Are you sure you have selected the correct file?';
			}
			else {
				state.budgetRows = budgetRows;
			}
		}

		if(budgetPathValidated) {
			state.budgetPathValidationState = null;
			state.budgetPathValidationMessage = null;
		}

		// ****************************************************************
		// Validate Register File Path
		// ****************************************************************
		var registerPathValidated = true;
		if(this.state.registerPath == "") {
			registerPathValidated = false;
			state.registerPathValidationState = 'error';
			state.registerPathValidationMessage = "We need the 'Register.csv' file for importing the data.";
		}
		else {
			var parsed = Baby.parseFiles(this.state.registerPath);
			var registerRows = parsed.data;
			// As part of validation, we are just going to check the header names to ensure that they are 
			// what we are expecting.
			var firstRegisterRow = registerRows[0];
			if(
				firstRegisterRow[0].includes("Account") == false || 
				firstRegisterRow[1] != "Flag" ||
				firstRegisterRow[2] != "Date" ||
				firstRegisterRow[3] != "Payee" ||
				firstRegisterRow[4] != "Category Group/Category" ||
				firstRegisterRow[5] != "Category Group" ||
				firstRegisterRow[6] != "Category" ||
				firstRegisterRow[7] != "Memo" ||
				firstRegisterRow[8] != "Outflow" ||
				firstRegisterRow[9] != "Inflow" ||
				firstRegisterRow[10] != "Cleared"
			) {
				// The format of the csv file does not match what we were expecting.
				registerPathValidated = false;
				state.registerPathValidationState = 'error';
				state.registerPathValidationMessage = 'This file is not in the correct format. Are you sure you have selected the correct file?';
			}
			else {
				state.registerRows = budgetRows;
			}
		}

		if(registerPathValidated) {
			state.registerPathValidationState = null;
			state.registerPathValidationMessage = null;
		}

		var validationPassed = (budgetNameValidated && budgetPathValidated && registerPathValidated);
		if(validationPassed) {
			// Get the list of accounts present in the imported data
			var dataImporter = new YNABDataImporter();
			state.accountList = dataImporter.getAccountsList(budgetRows, registerRows);
			state.currentStep = 2;
		}
		else {
			state.accountList = null;
		}

		this.setState(state);
	}

	private onAccountTypeChange(accountObj:IImportedAccountObject, event:React.SyntheticEvent):void {
		// Update the accountObj with the selected option
		accountObj.accountType = (event.target as HTMLInputElement).value;
	}

	private validateStep2():void {

		var accountsList = this.state.accountList;
		// We want to ensure that account types have been assigned to all of the accounts
		var validated = true;
		_.forEach(accountsList, (accountObj)=>{
			if(accountObj.accountType == AccountTypes.None)
				validated = false;
		});

		if(validated == true) {

			var budgetName = this.state.budgetName;
			var budgetRows = this.state.budgetRows;
			var registerRows = this.state.registerRows;
			this.props.importYnabData(budgetName, accountsList, budgetRows, registerRows);
			this.hide();
		}
	}

	public isShowing():boolean {
		return this.state.showModal;
	}

	public show():void {

		this.setState({ 
			showModal: true,
			currentStep: 1,
			budgetName: "",
			budgetPath: "",
			registerPath: "",
			budgetNameValidationState: null,
			budgetNameValidationMessage: null,
			budgetPathValidationState: null,
			budgetPathValidationMessage: null,
			registerPathValidationState: null,
			registerPathValidationMessage: null,
			budgetRows: null,
			registerRows: null,
			accountList: null
		});
	};

	public hide():void {

		this.setState({ 
			showModal: false,
			currentStep: 0,
			budgetName: "",
			budgetPath: "",
			registerPath: "",
			budgetNameValidationState: null,
			budgetNameValidationMessage: null,
			budgetPathValidationState: null,
			budgetPathValidationMessage: null,
			registerPathValidationState: null,
			registerPathValidationMessage: null,
			budgetRows: null,
			registerRows: null,
			accountList: null
		});
	}

	private getBudgetNameControl():JSX.Element {

		var element:JSX.Element;
		if(this.state.budgetNameValidationState == "error") {
			element = (
				<FormGroup>
					<ControlLabel>
						Budget Name:
					</ControlLabel>
					<FormControl ref={(c)=> {this.ctrlBudgetName = c;}} type="text" style={BudgetNameInputErrorStyle} value={this.state.budgetName} onChange={this.onBudgetNameChange} />
					<label style={ErrorMessageStyle}>{this.state.budgetNameValidationMessage}</label>
				</FormGroup>
			);
		}
		else {
			element = (
				<FormGroup>
					<ControlLabel>
						Budget Name:
					</ControlLabel>
					<FormControl ref={(c)=> {this.ctrlBudgetName = c;}} type="text" style={BudgetNameInputStyle} value={this.state.budgetName} onChange={this.onBudgetNameChange} />
				</FormGroup>
			);
		}

		return element;
	}

	private getBudgetCsvPathControl():JSX.Element {

		var element:JSX.Element;
		if(this.state.budgetPathValidationState == "error") {
			element = (
				<FormGroup>
					<ControlLabel>
						'Budget.csv' Path:
					</ControlLabel>
					<div style={FormControlsContainer}>
						<FormControl ref={(c)=> {this.ctrlBudgetCsvPath = c;}} type="text" style={FormInputErrorStyle} value={this.state.budgetPath} readOnly={true} />
						<Button className="dialog-browse-button" style={BrowseButtonErrorStyle} onClick={this.browseForBudgetFile}>
							<Glyphicon glyph="folder-open" />
						</Button>
					</div>
					<label style={ErrorMessageStyle}>{this.state.budgetPathValidationMessage}</label>
				</FormGroup>
			);
		}
		else {
			element = (
				<FormGroup>
					<ControlLabel>
						'Budget.csv' Path:
					</ControlLabel>
					<div style={FormControlsContainer}>
						<FormControl ref={(c)=> {this.ctrlBudgetCsvPath = c;}} type="text" style={FormInputStyle} value={this.state.budgetPath} readOnly={true} />
						<Button className="dialog-browse-button" style={BrowseButtonStyle} onClick={this.browseForBudgetFile}>
							<Glyphicon glyph="folder-open" />
						</Button>
					</div>
				</FormGroup>
			);
		}

		return element;
	}

	private getRegisterCsvPathControl():JSX.Element {

		var element:JSX.Element;
		if(this.state.registerPathValidationState == "error") {
			element = (
				<FormGroup>
					<ControlLabel>
						'Register.csv' Path:
					</ControlLabel>
					<div style={FormControlsContainer}>
						<FormControl ref={(c)=> {this.ctrlRegisterCsvPath = c;}} type="text" style={FormInputErrorStyle} value={this.state.registerPath} readOnly={true} />
						<Button className="dialog-browse-button" style={BrowseButtonErrorStyle} onClick={this.browseForRegisterFile}>
							<Glyphicon glyph="folder-open" />
						</Button>
					</div>
					<label style={ErrorMessageStyle}>{this.state.registerPathValidationMessage}</label>
				</FormGroup>
			);
		}
		else {
			element = (
				<FormGroup>
					<ControlLabel>
						'Register.csv' Path:
					</ControlLabel>
					<div style={FormControlsContainer}>
						<FormControl ref={(c)=> {this.ctrlRegisterCsvPath = c;}} type="text" style={FormInputStyle} value={this.state.registerPath} readOnly={true} />
						<Button className="dialog-browse-button" style={BrowseButtonStyle} onClick={this.browseForRegisterFile}>
							<Glyphicon glyph="folder-open" />
						</Button>
					</div>
				</FormGroup>
			);
		}

		return element;
	}

	private getModalForStep1():JSX.Element {

		var budgetName = this.getBudgetNameControl();
		var budgetPath = this.getBudgetCsvPathControl();
		var registerPath = this.getRegisterCsvPathControl();

		return (
			<Modal show={this.state.showModal} animation={true} onHide={this.hide} backdrop="static" keyboard={false} dialogClassName="import-ynab-data-dialog">
				<Modal.Header bsClass="modal-header">
					<Modal.Title>Import YNAB Data</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						{budgetName}
						{budgetPath}
						{registerPath}
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button className="dialog-secondary-button" onClick={this.hide}>
						Cancel&nbsp;<Glyphicon glyph="remove-sign" />
					</Button>
					<Button className="dialog-primary-button" onClick={this.validateStep1}>
						Next&nbsp;<Glyphicon glyph="ok-sign" />
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}

	private getAccountItemControls():Array<JSX.Element> {

		var accountItems:Array<JSX.Element> = [];
		var accountsList = this.state.accountList;

		_.forEach(accountsList, (accountObj)=>{

			if(accountObj.isLiabilityAccount) {
				accountItems.push(
					<div key={accountObj.accountName} style={ListItemContainer}>
						<label style={ListAccountNameStyle}>{accountObj.accountName}</label>
						<div style={ListAccountTypeStyle}>
							<FormControl componentClass="select" style={FormInputStyle} value={accountObj.accountType} onChange={this.onAccountTypeChange.bind(this, accountObj)}>
								<option label="Select an Account Type...">{AccountTypes.None}</option>
								<option label={AccountTypeNames.CreditCard}>{AccountTypes.CreditCard}</option>
								<option label={AccountTypeNames.LineOfCredit}>{AccountTypes.LineOfCredit}</option>
							</FormControl>
						</div>
					</div>
				);
			}
			else {
				accountItems.push(
					<div key={accountObj.accountName} style={ListItemContainer}>
						<label style={ListAccountNameStyle}>{accountObj.accountName}</label>
						<div style={ListAccountTypeStyle}>
							<FormControl componentClass="select" style={FormInputStyle} value={accountObj.accountType} onChange={this.onAccountTypeChange.bind(this, accountObj)}>
								<option label="Select an Account Type...">{AccountTypes.None}</option>
								<optgroup label="Budget">
									<option label={AccountTypeNames.Checking}>{AccountTypes.Checking}</option>
									<option label={AccountTypeNames.Savings}>{AccountTypes.Savings}</option>
									<option label={AccountTypeNames.CreditCard}>{AccountTypes.CreditCard}</option>
									<option label={AccountTypeNames.Cash}>{AccountTypes.Cash}</option>
									<option label={AccountTypeNames.LineOfCredit}>{AccountTypes.LineOfCredit}</option>
									<option label={AccountTypeNames.PayPal}>{AccountTypes.PayPal}</option>
									<option label={AccountTypeNames.MerchantAccount}>{AccountTypes.MerchantAccount}</option>
								</optgroup>
								<optgroup label="Tracking">
									<option label={AccountTypeNames.InvestmentAccount}>{AccountTypes.InvestmentAccount}</option>
									<option label={AccountTypeNames.Mortgage}>{AccountTypes.Mortgage}</option>
									<option label={AccountTypeNames.OtherAsset}>{AccountTypes.OtherAsset}</option>
									<option label={AccountTypeNames.OtherLiability}>{AccountTypes.OtherLiability}</option>
								</optgroup>
							</FormControl>
						</div>
					</div>
				);
			}
		});

		return accountItems;
	}

	private getModalForStep2():JSX.Element {

		var accountItems = this.getAccountItemControls();

		return (
			<Modal show={this.state.showModal} animation={true} onHide={this.hide} backdrop="static" keyboard={false} dialogClassName="import-ynab-data-dialog">
				<Modal.Header bsClass="modal-header">
					<Modal.Title>Import YNAB Data</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<div style={AccountsListContainerStyle}>
							<div style={ListItemContainer}>
								<label style={ListHeaderAccountNameLabelStyle}>ACCOUNT NAME</label>
								<label style={ListHeaderAccountTypeLabelStyle}>ACCOUNT TYPE</label>
							</div>
							<hr className="dialog-listitem-separator" />
							<ul style={ListStyle}>
								{accountItems}
							</ul>
						</div>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button className="dialog-secondary-button" onClick={this.hide}>
						Cancel&nbsp;<Glyphicon glyph="remove-sign" />
					</Button>
					<Button className="dialog-primary-button" onClick={this.validateStep2}>
						Import&nbsp;<Glyphicon glyph="ok-sign" />
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}

	public render() {

		if(this.state.showModal) {

			if(this.state.currentStep == 1) {
				return this.getModalForStep1();
			}
			else if(this.state.currentStep == 2) {
				return this.getModalForStep2();
			}
		}
		else
			return <div />;				
	}
}