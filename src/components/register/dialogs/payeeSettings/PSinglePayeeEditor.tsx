/// <reference path="../../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormControl, FormGroup } from 'react-bootstrap';

import { PFormControl } from '../../../common/PFormControl';
import { PPayeeTransactionsDialog } from './PPayeeTransactionsDialog';
import { TransactionSources } from '../../../../constants';
import * as budgetEntities from '../../../../interfaces/budgetEntities';
import { ITransactionObject } from '../../../../interfaces/objects';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../../interfaces/state';
import { DataFormatter } from '../../../../utilities';

export interface PSinglePayeeEditorProps {
	dataFormatter: DataFormatter;
	payee:budgetEntities.IPayee;
	transactionsCount:number;
	entitiesCollection:IEntitiesCollection;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PSinglePayeeEditorState {
	isEditing:boolean;
	payeeName:string;
	nameValidationState:string;
	nameValidationMessage:string;
	showTransactions:boolean;
	transactionObjects:Array<ITransactionObject>;
}

const PayeeEditorContainerStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: "column nowrap",
	justifyContent: "flex-start",
	alignItems: "center",
	padding: "10px",
	width: "100%"
}

const NameEditorContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: "space-between",
	alignItems: "flex-start",
	width: "100%"
}

const NameLabelStyle:React.CSSProperties = {
	flex: "1 1 auto",
	fontSize: "20px",
	fontWeight: "normal",
	marginBottom: "0px",
	width: "100%"
}

const NameButtonStyle:React.CSSProperties = {
	flex: "0 0 auto",
	width: "80px",
	marginLeft: "5px",
	fontSize: "14px"
}

const EnablePayeeContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: "flex-start",
	marginBottom: "5px",
	width: "100%"
}

const LabelStyle:React.CSSProperties = {
	flex: "1 1 auto",
	display: "flex",
	flexFlow: "row nowrap",
	fontSize: "14px",
	fontWeight: "normal",
	paddingLeft: "5px",
	marginBottom: "0px",
	width: "100%"
}

const EnableCountStyle:React.CSSProperties = {
	fontSize: "14px",
	color: "#009cc2",
	fontWeight: "bold",
	marginBottom: "0px",
	cursor: "pointer"
}

const SeparatorStyle:React.CSSProperties = {
	width: "100%",
	marginTop: "5px",
	marginBottom: "10px",
	borderTop: "1px solid #588697"
}

const PayeeCategoryContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "center",
	width: "100%",
}

const PayeeCategorySelectStyle:React.CSSProperties = {
	flex: "1 1 auto",
	fontSize: "14px",
	fontWeight: "normal",
	width: "100%"
}

export class PSinglePayeeEditor extends React.Component<PSinglePayeeEditorProps, PSinglePayeeEditorState> {

	private transactionsCount:HTMLDivElement;
	private transactionsDialog:PPayeeTransactionsDialog;

	constructor(props:PSinglePayeeEditorProps) {
        super(props);
		this.onRenameClicked = this.onRenameClicked.bind(this);
		this.onPayeeNameChange = this.onPayeeNameChange.bind(this);
		this.onSaveClicked = this.onSaveClicked.bind(this);
		this.onCancelClicked = this.onCancelClicked.bind(this);
		this.onPayeeEnabledChange = this.onPayeeEnabledChange.bind(this);
		this.onTransactionsCountClick = this.onTransactionsCountClick.bind(this);
		this.onPayeeCategoryChange = this.onPayeeCategoryChange.bind(this);
		this.state = {
			isEditing: false,
			payeeName: null,
			nameValidationState: null,
			nameValidationMessage: null,
			showTransactions: false,
			transactionObjects: null
		}
	}

	private onRenameClicked(event:React.MouseEvent<any>):void {
		var state = Object.assign({}, this.state);
		state.isEditing = true;
		state.payeeName = this.props.payee.name;
		state.nameValidationState = null;
		state.nameValidationMessage = null;
		this.setState(state);
	}

	private onPayeeNameChange(event:React.FormEvent<any>):void {
		var state = Object.assign({}, this.state);
		state.payeeName = (event.target as HTMLInputElement).value;
		this.setState(state);
	}

	private onSaveClicked(event:React.MouseEvent<any>):void {

		if(this.validatePayeeName()) {

			// Create a clone of the payee and set the name in it
			var payeeClone = Object.assign({}, this.props.payee, {
				name: this.state.payeeName
			});

			// Send this payee clone entity for persistence
			this.props.updateEntities({
				payees: [payeeClone]
			});

			var state = Object.assign({}, this.state);
			state.isEditing = false;
			state.payeeName = null;
			state.nameValidationState = null;
			state.nameValidationMessage = null;
			this.setState(state);
		}
	}

	private onCancelClicked(event:React.MouseEvent<any>):void {

		var state = Object.assign({}, this.state);
		state.isEditing = false;
		state.payeeName = null;
		state.nameValidationState = null;
		state.nameValidationMessage = null;
		this.setState(state);
	}

	private validatePayeeName():boolean {

		// We want to make sure that the payee name is not empty, or is not equal to the
		// name of some other payee
		var isValid = true;

		// Ensure that the payee name is not empty
		if(this.state.payeeName == "") {

			isValid = false;
			var state = Object.assign({}, this.state);
			state.nameValidationState = "error";
			state.nameValidationMessage = "The payee name is required.";
			this.setState(state);
		}
		else {
			// Ensure that the payee name is not the same as any other payee
			var payeesArray = this.props.entitiesCollection.payees;
			_.forEach(payeesArray.getAllItems(), (payee)=>{
				if(payee.isTombstone == 0 && payee.name == this.state.payeeName && payee.entityId != this.props.payee.entityId) {
					
					isValid = false;
					var state = Object.assign({}, this.state);
					state.nameValidationState = "error";
					state.nameValidationMessage = "This payee name is already in use."
					this.setState(state);
					return false;
				};
			})
		}

		return isValid;
	}

	private onPayeeEnabledChange(event:React.FormEvent<any>):void {

		// Create a clone of the payee and set the enabled flag in it
		var payeeClone = Object.assign({}, this.props.payee, {
			enabled: this.props.payee.enabled == 0 ? 1 : 0
		});

		// Send this payee clone entity for persistence
		this.props.updateEntities({
			payees: [payeeClone]
		});
	}

	private onTransactionsCountClick(event:React.MouseEvent<any>):void {

		if(!this.transactionsDialog.isShowing()) {

			var transactionObjects = this.getTransactionObjects();
			this.transactionsDialog.show(transactionObjects, this.transactionsCount);
		}
	}

	private onPayeeCategoryChange(event:React.FormEvent<any>):void {

		var updatedCategory = (event.target as HTMLSelectElement).value;
		// Create a clone of the payee and set the auto fill category in it
		var payeeClone = Object.assign({}, this.props.payee, {
			autoFillSubCategoryId: updatedCategory == "None" ? null : updatedCategory
		});

		// Send this payee clone entity for persistence
		this.props.updateEntities({
			payees: [payeeClone]
		});
	}

	private getTransactionObjects():Array<ITransactionObject> {

		var entitiesCollection = this.props.entitiesCollection;
		var transactions = entitiesCollection.transactions.getAllItems();
		var transactionObjects:Array<ITransactionObject> = [];
		var payeeId = this.props.payee.entityId;

		_.forEach(transactions, (transaction)=>{
			if(transaction.isTombstone == 0 && transaction.payeeId == payeeId && transaction.source != TransactionSources.Matched) {

				var account = entitiesCollection.accounts.getEntityById(transaction.accountId);
				var accountName = account ? account.accountName : "";
				var payeeName = "";
				var subCategory = transaction.subCategoryId ? entitiesCollection.subCategories.getEntityById(transaction.subCategoryId) : null;
				var masterCategory = subCategory ? entitiesCollection.masterCategories.getEntityById(subCategory.masterCategoryId) : null;
				var categoryName = subCategory ? `${masterCategory.name}: ${subCategory.name}` : "";
				
				var transactionObject:ITransactionObject = {
					entityId: transaction.entityId,
					account: accountName,
					date: transaction.date,
					payee: payeeName,
					category: categoryName,
					memo: transaction.memo,
					amount: transaction.amount
				} 

				transactionObjects.push(transactionObject);
			}
		});

		// Sort the transactions by descending date
		transactionObjects = _.orderBy(transactionObjects, ["date"], ["desc"]);
		return transactionObjects;
	}

	private getAutoFillCategoryNodesList():Array<JSX.Element> {

		var categoriesList:Array<JSX.Element> = [
			<option key="empty_category" label="None">None</option>
		];

		var subCategoriesArray = this.props.entitiesCollection.subCategories;
		var masterCategoriesArray = this.props.entitiesCollection.masterCategories;

		_.forEach(masterCategoriesArray.getVisibleNonTombstonedMasterCategories(), (masterCategory)=>{

			var subCategories = subCategoriesArray.getVisibleNonTombstonedSubCategoriesForMasterCategory(masterCategory.entityId);
			var subCategoryNodes:Array<JSX.Element> = [];
			_.forEach(subCategories, (subCategory)=>{
				subCategoryNodes.push(
					<option key={subCategory.entityId} label={subCategory.name}>{subCategory.entityId}</option>
				);
			});

			var masterCategoryNode = (
				<optgroup key={masterCategory.entityId} label={masterCategory.name}>
					{subCategoryNodes}
				</optgroup>
			);

			categoriesList.push(masterCategoryNode);
		});

		return categoriesList;
	}

	private getCategoryNameNode():JSX.Element {

		var categoryNameNode:JSX.Element;

		if(!this.state.isEditing) {
			categoryNameNode = (
				<div style={NameEditorContainerStyle}>
					<label style={NameLabelStyle}>{this.props.payee.name}</label>
					<button className="dialog-secondary-button" style={NameButtonStyle} onClick={this.onRenameClicked}>Rename</button>
				</div>
			);
		} 
		else {
			categoryNameNode = (
				<div style={NameEditorContainerStyle}>
					<PFormControl value={this.state.payeeName} errorMessage={this.state.nameValidationMessage} onChange={this.onPayeeNameChange} />
					<button className="dialog-secondary-button" style={NameButtonStyle} onClick={this.onSaveClicked}>Save</button>
					<button className="dialog-secondary-button" style={NameButtonStyle} onClick={this.onCancelClicked}>Cancel</button>
				</div>
			);
		}

		return categoryNameNode;
	}

	public render() {
		
		var autoFillSubCategoryId = this.props.payee.autoFillSubCategoryId;
		if(!autoFillSubCategoryId)
			autoFillSubCategoryId = "None";

		var categoryNameNode = this.getCategoryNameNode();
		var autoFillCategoryNodes = this.getAutoFillCategoryNodesList();

		return (
			<div style={PayeeEditorContainerStyle}>

				{categoryNameNode}

				<hr style={SeparatorStyle} />
				<div style={EnablePayeeContainerStyle}>
					<input type="checkbox" checked={this.props.payee.enabled == 1} onChange={this.onPayeeEnabledChange} />
					<div style={LabelStyle}>
						Enable this payee (used in 
						<div ref={(d)=> this.transactionsCount = d } style={EnableCountStyle} onClick={this.onTransactionsCountClick}>&nbsp;{this.props.transactionsCount}&nbsp;</div> 
						transactions)
					</div>
				</div>

				<hr style={SeparatorStyle} />
				<div style={PayeeCategoryContainerStyle}>
					<label style={LabelStyle}>Automatically categorize this payee as:</label>
					<FormControl componentClass="select" style={PayeeCategorySelectStyle} value={autoFillSubCategoryId}  onChange={this.onPayeeCategoryChange}>
						{autoFillCategoryNodes}
					</FormControl>
				</div>

				<PPayeeTransactionsDialog 
					ref={(d)=> this.transactionsDialog = d}
					dataFormatter={this.props.dataFormatter}
					entitiesCollection={this.props.entitiesCollection}
				/>
			</div>
		);
	}
}