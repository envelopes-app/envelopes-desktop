/// <reference path="../../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormControl, Glyphicon, Modal } from 'react-bootstrap';

import { PSinglePayeeEditor } from './PSinglePayeeEditor';
import { PMultiPayeeEditor } from './PMultiPayeeEditor';
import { PLinkButton } from '../../../common/PLinkButton';
import { InternalCategories, SubCategoryType } from '../../../../constants';
import { DataFormatter, SimpleObjectMap } from '../../../../utilities';
import * as budgetEntities from '../../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../../interfaces/state';

export interface PPayeeSettingsDialogProps {
	dataFormatter:DataFormatter;
	entitiesCollection:IEntitiesCollection
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PPayeeSettingsDialogState {
	show:boolean;
	selectedPayees:Array<string>;
	selectedPayeesMap:SimpleObjectMap<boolean>;
	payeeTransactionsCountMap:SimpleObjectMap<number>;
}

const ModalBodyStyle:React.CSSProperties = {
	padding: "0px"
}

const PayeesContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	width: "100%"
}

const PayeesListStyle:React.CSSProperties = {
	flex: "0 0 auto",
	width: "250px",
	minHeight: "300px",
	maxHeight: "400px",
	listStyleType: "none",
	borderStyle: "solid",
	borderColor: "#DFE4E9",
	borderLeftWidth: "0px",
	borderRightWidth: "1px",
	borderTopWidth: "0px",
	borderBottomWidth: "0px",
	padding: "0px",
	overflowY: "auto"
}

const PayeeListItemStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "center",
	paddingBottom: "3px",	
	paddingTop: "3px",
	paddingLeft: "10px",
	paddingRight: "5px",
	cursor: "pointer"
}

const PayeeListItemAltStyle = Object.assign({}, PayeeListItemStyle, {
	backgroundColor: "#DFE4E9"
});

const DisabledGlyphStyle:React.CSSProperties = {
	width: "20px",
	color: "#890309",
	paddingRight: "5px",
	cursor: "inherit"
}

const PayeeListItemSelectionStyle:React.CSSProperties = {
	margin: "0px",
	cursor: "inherit"
}

const PayeeListItemNameStyle:React.CSSProperties = {
	margin: "0px",
	fontSize: "14px",
	fontWeight: "normal",
	paddingLeft: "5px",
	whiteSpace: "nowrap",
  	overflow: "hidden",
  	textOverflow: "ellipsis",
	cursor: "inherit"
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

const PayeeEditorContainerForNoPayeeStyle = Object.assign({}, PayeeEditorContainerStyle, {
	justifyContent: "center"
});

const SeparatorStyle:React.CSSProperties = {
	width: "100%",
	marginTop: "5px",
	marginBottom: "10px",
	borderTop: "1px solid #588697"
}

export class PPayeeSettingsDialog extends React.Component<PPayeeSettingsDialogProps, PPayeeSettingsDialogState> {

	constructor(props:PPayeeSettingsDialogProps) {
        super(props);
		this.hide = this.hide.bind(this);
		this.combineSelectedPayees = this.combineSelectedPayees.bind(this);

		this.state = {
			show: false,
			selectedPayees: [],
			selectedPayeesMap: {},
			payeeTransactionsCountMap: {}
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}
	
	public show():void {

		var state = Object.assign({}, this.state) as PPayeeSettingsDialogState;
		state.show = true;
		state.selectedPayees = [];
		state.selectedPayeesMap = {};
		state.payeeTransactionsCountMap = this.getPayeeTransactionsCountMap();
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PPayeeSettingsDialogState;
		state.show = false;
		state.selectedPayees = null;
		state.selectedPayeesMap = null;
		state.payeeTransactionsCountMap = null;
		this.setState(state);
	}
	
	private getPayeeTransactionsCountMap():SimpleObjectMap<number> {

		// Iterate through all the transactions and build a map for payee/transactions-count
		var payeeTransactionsCountMap:SimpleObjectMap<number> = {};
		var transactionsArray = this.props.entitiesCollection.transactions;
		_.forEach(transactionsArray.getAllItems(), (transaction)=>{

			if(transaction.isTombstone == 0 && transaction.payeeId != null) {

				var existingCount = payeeTransactionsCountMap[transaction.payeeId];
				if(!existingCount)
					existingCount = 0;

				payeeTransactionsCountMap[transaction.payeeId] = ++existingCount;
			}
		});

		return payeeTransactionsCountMap;
	}

	private selectPayee(entityId:string, selected:boolean):void {

		var state = Object.assign({}, this.state);
		
		state.selectedPayeesMap[entityId] = selected;
		if(selected) {
			// If the item is being selected, insert it into the selected payees array as well
			state.selectedPayees.push(entityId);
		}
		else {
			// Remove the item from the selected payees array
			var index = _.indexOf(state.selectedPayees, entityId);
			state.selectedPayees.splice(index, 1);
		}

		this.setState(state);
	}

	private getPayeesList():Array<JSX.Element> {

		var i = 0;
		var payeeNodes:Array<JSX.Element> = [];

		var payees = this.props.entitiesCollection.payees.getAllItems();
		var selectedPayeesMap = this.state.selectedPayeesMap;
		// Sort the payees by name before displaying
		payees = _.sortBy(payees, 'name');
		_.forEach(payees, (payee)=>{

			// Don't include the internal payees in the list
			if(payee.isTombstone == 0 && !payee.internalName && !payee.accountId) {
				var selected = selectedPayeesMap[payee.entityId] ? selectedPayeesMap[payee.entityId] : false;
				var disabledGlyph = <div />;
				// If the payee is disabled, then we are going to show the glyph for it
				if(payee.enabled == 0) {
					disabledGlyph = <Glyphicon glyph="ban-circle" style={DisabledGlyphStyle} />
				}

				var payeeNode = (
					<div key={payee.entityId} style={++i % 2 == 0 ? PayeeListItemStyle : PayeeListItemAltStyle} onClick={this.selectPayee.bind(this, payee.entityId, !selected)}>
						<input style={PayeeListItemSelectionStyle} type="checkbox" checked={selected}/>
						<label style={PayeeListItemNameStyle}>{payee.name}</label>
						<div className="spacer" />
						{disabledGlyph}
					</div>
				);
				payeeNodes.push(payeeNode);
			}
		});	

		return payeeNodes;
	}

	private combineSelectedPayees(combinedPayeeName:string):void {

		var payeesArray = this.props.entitiesCollection.payees;
		var transactionsArray = this.props.entitiesCollection.transactions;
		var scheduledTransactionsArray = this.props.entitiesCollection.scheduledTransactions;

		var changedEntities:ISimpleEntitiesCollection = {
			payees: [],
			transactions: [],
			scheduledTransactions: []
		}

		// Do we have an existing payee that has a name equal to the passed combinedPayeeName
		var combinedPayee = this.props.entitiesCollection.payees.getPayeeByName(combinedPayeeName);
		// If there is no current payee that has this name, then take the first payee from the 
		// list of selected payees, and change it's name to be equal to the passed combinedPayeeName.
		if(!combinedPayee) {

			combinedPayee = payeesArray.getEntityById( this.state.selectedPayees[0] ); 
			combinedPayee = Object.assign({}, combinedPayee);
			combinedPayee.name = combinedPayeeName;
			changedEntities.payees.push(combinedPayee);
		}

		// Iterate through all the selected payees
		_.forEach(this.state.selectedPayees, (payeeId)=>{

			if(payeeId != combinedPayee.entityId) {

				// Get all the transactions and scheduled transactions that refer this payee
				// and point them to the combinedPayee
				_.forEach(transactionsArray.getAllItems(), (transaction)=>{
					if(transaction.payeeId == payeeId) {

						let transactionClone = Object.assign({}, transaction);
						transactionClone.payeeId = combinedPayee.entityId;
						changedEntities.transactions.push(transactionClone);
					}
				});

				_.forEach(scheduledTransactionsArray.getAllItems(), (scheduledTransaction)=>{
					if(scheduledTransaction.payeeId == payeeId) {

						let scheduledTransactionClone = Object.assign({}, scheduledTransaction);
						scheduledTransactionClone.payeeId = combinedPayee.entityId;
						changedEntities.scheduledTransactions.push(scheduledTransactionClone);
					}
				});

				// Tombstone this payee
				let payee = payeesArray.getEntityById(payeeId);
				let payeeClone = Object.assign({}, payee);
				payeeClone.isTombstone = 1;
				changedEntities.payees.push(payeeClone);
			}			
		});

		// Send these changes for persistence
		this.props.updateEntities(changedEntities);

		// Update the local state, and set the combinedPayee as the selected payee
		var state = Object.assign({}, this.state);
		state.selectedPayees = [combinedPayee.entityId];
		state.selectedPayeesMap = {};
		state.selectedPayeesMap[combinedPayee.entityId] = true;
		this.setState(state);
	}

	private getPayeeEditorForNoSelection():JSX.Element {

		return (
			<div style={PayeeEditorContainerForNoPayeeStyle}>
				<label>Select a payee to edit</label>
			</div>
		) 	
	}

	private getPayeeEditorForSingleSelection():JSX.Element {

		var payeeId = this.state.selectedPayees[0];
		var payee = this.props.entitiesCollection.payees.getEntityById(payeeId);
		var payeeTransactionsCount = this.state.payeeTransactionsCountMap[payeeId];
		if(!payeeTransactionsCount)
			payeeTransactionsCount = 0;

		return (
			<PSinglePayeeEditor 
				dataFormatter={this.props.dataFormatter}
				payee={payee} 
				transactionsCount={payeeTransactionsCount} 
				entitiesCollection={this.props.entitiesCollection}
				updateEntities={this.props.updateEntities} 
			/>
		);
	}

	private getPayeeEditorForMultiSelection():JSX.Element {

		var payeeIds = this.state.selectedPayees;
		var payeesArray = this.props.entitiesCollection.payees;

		// Get the payee entities corresponding to the selected payee ids
		var payees = _.map(payeeIds, (payeeId)=>{
			return payeesArray.getEntityById(payeeId);
		});

		return (
			<PMultiPayeeEditor 
				payees={payees}
				combineSelectedPayees={this.combineSelectedPayees}
			/>
		);
	}

	public componentWillReceiveProps(nextProps:PPayeeSettingsDialogProps):void {

		// Refresh the payee transactions count map in the state
		var state = Object.assign({}, this.state) as PPayeeSettingsDialogState;
		state.payeeTransactionsCountMap = this.getPayeeTransactionsCountMap();
		this.setState(state);
	}

	public render() {

		if(this.state.show) {

			var payeesList = this.getPayeesList(); 
			var payeeEditor:JSX.Element;
			// Get the payee editor to show based on the number of items that are selected in the payees list
			var selectedItemsCount = this.state.selectedPayees.length;
			if(selectedItemsCount == 0)
				payeeEditor = this.getPayeeEditorForNoSelection();
			else if(selectedItemsCount == 1)
				payeeEditor = this.getPayeeEditorForSingleSelection();
			else
				payeeEditor = this.getPayeeEditorForMultiSelection();

			return (
				<Modal show={this.state.show} animation={true} onHide={this.hide} backdrop="static" keyboard={false} dialogClassName="payee-settings-dialog">
					<Modal.Header>
						<Modal.Title>Payee Settings</Modal.Title>
					</Modal.Header>
					<Modal.Body style={ModalBodyStyle}>
						<div style={PayeesContainerStyle}>
							<li style={PayeesListStyle}>
								{payeesList}
							</li>
							<div style={PayeeEditorContainerStyle}>
								{payeeEditor}
							</div>
						</div>
					</Modal.Body>
					<Modal.Footer>
						<button className="dialog-primary-button" onClick={this.hide}>
							Close&nbsp;<Glyphicon glyph="ok-sign" />
						</button>
					</Modal.Footer>
				</Modal>
			);
		}
		else {
			return <div />;
		}
	}
}
