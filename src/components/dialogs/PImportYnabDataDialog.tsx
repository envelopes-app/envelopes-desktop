/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Baby from 'babyparse';
import { Modal, Form, FormGroup, FormControl, ControlLabel, Glyphicon } from 'react-bootstrap';

import { PFileDropContainer } from '../common/PFileDropContainer';
import { DataFormatter, Logger } from '../../utilities';
import * as budgetEntities from '../../interfaces/budgetEntities';
import { AccountTypes, AccountTypeNames } from '../../constants';
import { YNABDataImporter } from '../../persistence';
import { IDataFormat } from '../../interfaces/formatters';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../interfaces/state';
import { IImportedAccountObject } from '../../interfaces/objects';

export interface PImportYnabDataDialogProps { 
	activeBudgetId:string;
	dataFormatter:DataFormatter;
	entitiesCollection:IEntitiesCollection;

	showBudgetSettings:()=>void;
	// Dispatcher Functions
	updateEntities:(entitiesCollection:ISimpleEntitiesCollection)=>void;
}

export interface PImportYnabDataDialogState {

	showModal:boolean;
	currentStep:number;
	budgetFileName:string;
	budgetFilePath:string;
	budgetPathValidationState:string;
	budgetPathValidationMessage:string;
	registerFileName:string;
	registerFilePath:string;
	registerPathValidationState:string;
	registerPathValidationMessage:string;

	// These contain the parsed csv data
	budgetRows:Array<any>;
	registerRows:Array<any>;
	accountsList:Array<IImportedAccountObject>;
}

const FormControlsContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	alignContent: "stretch"
}

const FileInputStyle:React.CSSProperties = {
	flex: "1 1 auto",
	borderColor: '#2FA2B5',
	borderWidth: '2px'
}

const FileInputErrorStyle:React.CSSProperties = Object.assign({}, FileInputStyle, {
	borderBottomLeftRadius: "0px",
	borderBottomRightRadius: "0px",
});

const ErrorMessageStyle:React.CSSProperties = {
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

const AccountsListContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap"
}

const ListItemContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "center",
	marginBottom: "5px"
}

const ListHeaderAccountNameLabelStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#4D717A",
	marginBottom: "0px",
	width: "30%"
}

const ListHeaderAccountTypeLabelStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#4D717A",
	marginBottom: "0px",
	width: "70%"
}

const ListStyle:React.CSSProperties = {
	paddingLeft: "0px",
	maxHeight: "250px",	
	overflowY: "auto",
}

const ListAccountNameStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#4D717A",
	width: "30%"
}

const ListAccountTypeStyle:React.CSSProperties = {
	fontSize: "14px",
	fontWeight: "normal",
	color: "#4D717A",
	width: "70%"
}

const AccountTypeInputStyle:React.CSSProperties = {
	flex: "1 1 auto",
	borderColor: '#2FA2B5',
	borderWidth: '2px',
}

export class PImportYnabDataDialog extends React.Component<PImportYnabDataDialogProps, PImportYnabDataDialogState> {

	private ctrlBudgetCsvPath:FormControl;
	private ctrlRegisterCsvPath:FormControl;

	constructor(props:PImportYnabDataDialogProps) {
        super(props);
		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
		this.showBudgetSettings = this.showBudgetSettings.bind(this);
		this.handleFileDrop = this.handleFileDrop.bind(this);
		this.validateStep1 = this.validateStep1.bind(this);
		this.validateStep2 = this.validateStep2.bind(this);
        this.state = { 
			showModal: false,
			currentStep: 0,
			budgetFileName: "",
			budgetFilePath: "",
			registerFileName: "",
			registerFilePath: "",
			budgetPathValidationState: null,
			budgetPathValidationMessage: null,
			registerPathValidationState: null,
			registerPathValidationMessage: null,
			budgetRows: null,
			registerRows: null,
			accountsList: null
		};
    }

	private showBudgetSettings():void {

		this.hide();
		this.props.showBudgetSettings();
	}

	private handleFileDrop(files:FileList, event:React.SyntheticEvent<any>):void {

		var stateModified = false;
		var state = Object.assign({}, this.state);

		for(var i:number = 0; i < files.length; i++) {

			var file:File = files[i];
			if(file.type == 'text/csv') {

				var fileName = file.name;
				if(fileName.endsWith("Budget.csv")) {
					state.budgetFileName = file.name;
					state.budgetFilePath = file.path;
					stateModified = true;
				}
				else if(fileName.endsWith("Register.csv")) {
					state.registerFileName = file.name;
					state.registerFilePath = file.path;
					stateModified = true;
				}
			}
		}

		if(stateModified)
			this.setState(state);
	}

	private validateStep1():void {

		var state = Object.assign({}, this.state) as PImportYnabDataDialogState;
		// ****************************************************************
		// Validate Budget File Path
		// ****************************************************************
		var budgetPathValidated = true;
		if(this.state.budgetFileName == "") {
			budgetPathValidated = false;
			state.budgetPathValidationState = 'error';
			state.budgetPathValidationMessage = "We need the 'Budget.csv' file for importing the data.";
		}
		else {
			var parsed = Baby.parseFiles(this.state.budgetFilePath);
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
		if(this.state.registerFileName == "") {
			registerPathValidated = false;
			state.registerPathValidationState = 'error';
			state.registerPathValidationMessage = "We need the 'Register.csv' file for importing the data.";
		}
		else {
			var parsed = Baby.parseFiles(this.state.registerFilePath);
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
				state.registerRows = registerRows;
			}
		}

		if(registerPathValidated) {
			state.registerPathValidationState = null;
			state.registerPathValidationMessage = null;
		}

		if(budgetPathValidated && registerPathValidated) {
			// Get the list of accounts present in the imported data
			state.accountsList = YNABDataImporter.getAccountsList(budgetRows, registerRows, this.props.entitiesCollection);
			state.currentStep = 2;
		}
		else {
			state.accountsList = null;
		}

		this.setState(state);
	}

	private onAccountTypeChange(accountObj:IImportedAccountObject, event:React.FormEvent<any>):void {
		// Update the accountObj with the selected option
		accountObj.selectedAccountType = (event.target as HTMLInputElement).value;
		var state = Object.assign({}, this.state);
		this.setState(state);
	}

	private validateStep2():void {

		var accountsList = this.state.accountsList;
		// We want to ensure that account types have been assigned to all of the accounts
		var validated = true;
		_.forEach(accountsList, (accountObj)=>{
			if(accountObj.selectedAccountType == AccountTypes.None || accountObj.selectedAccountType == AccountTypes.Liability)
				validated = false;
		});

		if(validated == true) {

			try {
				// Get the active budget and get the data format from it
				var activeBudget = this.props.entitiesCollection.budgets.getEntityById( this.props.activeBudgetId ); 
				var dataImporter = new YNABDataImporter(activeBudget, this.props.entitiesCollection, this.props.dataFormatter);
				// Build up the list of entities that need to be created/updated in the budget
				dataImporter.buildEntitiesList(this.state.budgetRows, this.state.registerRows, accountsList);
				// Send the entities for persistence
				this.props.updateEntities(dataImporter.updatedEntities);
				this.hide();
			}
			catch(error) {
				var state = Object.assign({}, this.state);
				state.currentStep = 3;
				this.setState(state);
			}
		}
	}

	public isShowing():boolean {
		return this.state.showModal;
	}

	public show():void {

		this.setState({ 
			showModal: true,
			currentStep: 1,
			budgetFileName: "",
			budgetFilePath: "",
			registerFileName: "",
			registerFilePath: "",
			budgetPathValidationState: null,
			budgetPathValidationMessage: null,
			registerPathValidationState: null,
			registerPathValidationMessage: null,
			budgetRows: null,
			registerRows: null,
			accountsList: null
		});
	};

	public hide():void {

		this.setState({ 
			showModal: false,
			currentStep: 0,
			budgetFileName: "",
			budgetFilePath: "",
			registerFileName: "",
			registerFilePath: "",
			budgetPathValidationState: null,
			budgetPathValidationMessage: null,
			registerPathValidationState: null,
			registerPathValidationMessage: null,
			budgetRows: null,
			registerRows: null,
			accountsList: null
		});
	}

	private getBudgetCsvPathControl():JSX.Element {

		var element:JSX.Element;
		if(this.state.budgetPathValidationState == "error") {
			element = (
				<FormGroup>
					<ControlLabel>
						'Budget.csv' Path:
					</ControlLabel>
					<FormControl ref={(c)=> {this.ctrlBudgetCsvPath = c;}} type="text" style={FileInputErrorStyle} value={this.state.budgetFileName} title={this.state.budgetFilePath} readOnly={true} />
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
					<FormControl ref={(c)=> {this.ctrlBudgetCsvPath = c;}} type="text" style={FileInputStyle} value={this.state.budgetFileName} title={this.state.budgetFilePath} readOnly={true} />
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
					<FormControl ref={(c)=> {this.ctrlRegisterCsvPath = c;}} type="text" style={FileInputErrorStyle} value={this.state.registerFileName} title={this.state.registerFilePath} readOnly={true} />
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
					<FormControl ref={(c)=> {this.ctrlRegisterCsvPath = c;}} type="text" style={FileInputStyle} value={this.state.registerFileName} title={this.state.registerFilePath} readOnly={true} />
				</FormGroup>
			);
		}

		return element;
	}

	private getModalForStep1():JSX.Element {

		var budgetPath = this.getBudgetCsvPathControl();
		var registerPath = this.getRegisterCsvPathControl();

		return (
			<div className="import-ynab-data-dialog">
				<Modal show={this.state.showModal} animation={true} onHide={this.hide} backdrop="static" keyboard={false}>
					<Modal.Header>
						<Modal.Title>Import YNAB Data</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form>
							<p>
								Before importing your YNAB data, make sure that the date and currency formatting settings in this budget match those of your online YNAB budget. If the settings do not match, the data may not import correctly.
							</p>
							<p>
								Drag and drop the 'Budget.csv' and 'Register.csv' files below.
							</p>
							<br />
							<PFileDropContainer handleFileDrop={this.handleFileDrop}>
								{budgetPath}
								{registerPath}
							</PFileDropContainer>
						</Form>
					</Modal.Body>
					<Modal.Footer>
						<div className="buttons-container">
							<button className="dialog-secondary-button" onClick={this.showBudgetSettings}>
								Budget Settings&nbsp;<Glyphicon glyph="cog" />
							</button>
							<div className="spacer" />
							<button className="dialog-secondary-button" onClick={this.hide}>
								Cancel&nbsp;<Glyphicon glyph="remove-sign" />
							</button>
							<div style={{width:"8px"}}/>
							<button className="dialog-primary-button" onClick={this.validateStep1}>
								Next&nbsp;<Glyphicon glyph="ok-sign" />
							</button>
						</div>
					</Modal.Footer>
				</Modal>
			</div>
		);
	}

	private getAccountItemControls():Array<JSX.Element> {

		var accountItems:Array<JSX.Element> = [];
		var accountsList = this.state.accountsList;

		_.forEach(accountsList, (accountObj)=>{

			if(accountObj.suggestedAccountType == AccountTypes.Liability) {
				accountItems.push(
					<div key={accountObj.accountName} style={ListItemContainer}>
						<label style={ListAccountNameStyle}>{accountObj.accountName}</label>
						<div style={ListAccountTypeStyle}>
							<FormControl componentClass="select" style={AccountTypeInputStyle} value={accountObj.selectedAccountType} onChange={this.onAccountTypeChange.bind(this, accountObj)}>
								<option label="Select an Account Type...">{AccountTypes.None}</option>
								<option label={AccountTypeNames.CreditCard}>{AccountTypes.CreditCard}</option>
								<option label={AccountTypeNames.LineOfCredit}>{AccountTypes.LineOfCredit}</option>
							</FormControl>
						</div>
					</div>
				);
			}
			else if(accountObj.suggestedAccountType == AccountTypes.None) {
				accountItems.push(
					<div key={accountObj.accountName} style={ListItemContainer}>
						<label style={ListAccountNameStyle}>{accountObj.accountName}</label>
						<div style={ListAccountTypeStyle}>
							<FormControl componentClass="select" style={AccountTypeInputStyle} value={accountObj.selectedAccountType} onChange={this.onAccountTypeChange.bind(this, accountObj)}>
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
			else {
				accountItems.push(
					<div key={accountObj.accountName} style={ListItemContainer}>
						<label style={ListAccountNameStyle}>{accountObj.accountName}</label>
						<div style={ListAccountTypeStyle}>
							<FormControl componentClass="text" style={AccountTypeInputStyle} readOnly={true}>
								{AccountTypes.getLabel(accountObj.selectedAccountType)}
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
			<div className="import-ynab-data-dialog">
				<Modal show={this.state.showModal} animation={true} onHide={this.hide} backdrop="static" keyboard={false}>
					<Modal.Header>
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
						<div className="buttons-container">
							<button className="dialog-secondary-button" onClick={this.hide}>
								Cancel&nbsp;<Glyphicon glyph="remove-sign" />
							</button>
							<div style={{width:"8px"}}/>
							<button className="dialog-primary-button" onClick={this.validateStep2}>
								Import&nbsp;<Glyphicon glyph="ok-sign" />
							</button>
						</div>
					</Modal.Footer>
				</Modal>
			</div>
		);
	}

	private getModalForStep3():JSX.Element {

		return (
			<div className="import-ynab-data-dialog">
				<Modal show={this.state.showModal} animation={true} onHide={this.hide} backdrop="static" keyboard={false}>
					<Modal.Header>
						<Modal.Title>Import YNAB Data</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div>
						And error occurred during import of the data. Makre sure that the budget settings for this budget match the settings of your YNAB Online budget and try again.   
						</div>
					</Modal.Body>
					<Modal.Footer>
						<div className="buttons-container">
							<button className="dialog-primary-button" onClick={this.hide}>
								Close&nbsp;<Glyphicon glyph="ok-sign" />
							</button>
						</div>
					</Modal.Footer>
				</Modal>
			</div>
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
			else if(this.state.currentStep == 3) {
				return this.getModalForStep3();
			}
		}
		else
			return <div />;				
	}
}