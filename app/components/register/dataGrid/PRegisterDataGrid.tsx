/// <reference path="../../../_includes.ts" /> 
import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Table, Column, Cell } from 'fixed-data-table';

import { PInfoColumnHeader } from './PInfoColumnHeader';
import { PClearedColumnHeader } from './PClearedColumnHeader';
import { PColumnHeader } from './PColumnHeader';
import { PFlagColumnHeader } from './PFlagColumnHeader';
import { PSelectionColumnHeader } from './PSelectionColumnHeader';

import { PSelectionCell } from './PSelectionCell';
import { PInfoCell } from './PInfoCell';
import { PFlagCell } from './PFlagCell';
import { PDateCell } from './PDateCell';
import { PAccountCell } from './PAccountCell';
import { PPayeeCell } from './PPayeeCell';
import { PCategoryCell } from './PCategoryCell';
import { PMemoCell } from './PMemoCell';
import { POutflowCell } from './POutflowCell';
import { PInflowCell } from './PInflowCell';
import { PClearedCell } from './PClearedCell';

import { DataFormatter, DateWithoutTime, RegisterTransactionObject } from '../../../utilities';
import { ClearedFlag, TransactionFlag, RegisterSortField, RegisterSortOrder } from '../../../constants';
import { IEntitiesCollection, ISimpleEntitiesCollection, IRegisterState } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PRegisterDataGridProps {
	accountId:string;
	isAllAccounts:boolean;
	dataFormatter:DataFormatter;
	entitiesCollection:IEntitiesCollection;
	registerState:IRegisterState;
	// Local UI state updation functions
	selectTransaction:(registerTransactionObject:RegisterTransactionObject, unselectAllOthers:boolean)=>void;
	unselectTransaction:(registerTransactionObject:RegisterTransactionObject)=>void;
	editTransaction:(registerTransactionObject:RegisterTransactionObject, focusOnField:string)=>void;
	selectAllTransactions:()=>void;
	unselectAllTransactions:()=>void;
	setRegisterSort:(sortByFields:Array<string>, sortOrders:Array<string>)=>void;
	updateClearedForTransaction:(transaction:budgetEntities.ITransaction)=>void;
	showFlagSelectionDialog:(registerTransactionObject:RegisterTransactionObject, element:HTMLElement)=>void;
	showApproveRejectDialog:(transaction:budgetEntities.ITransaction, element:HTMLElement)=>void;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PRegisterDataGridState {
	componentWidth:number;
	componentHeight:number;
}

const RegisterDataGridContainerStyle = {
	flex: '1 1 auto',
	backgroundColor: '#ffffff'
}

export class PRegisterDataGrid extends React.Component<PRegisterDataGridProps, PRegisterDataGridState> {
  
	private dataGridContainer:HTMLDivElement;

	constructor(props: any) {
        super(props);
		this.handleWindowResize = this.handleWindowResize.bind(this);
		this.state = { componentWidth:0, componentHeight:0 };
	}

	public componentDidMount() {
		window.addEventListener("resize", this.handleWindowResize);
		this.updateComponentDimensions();
	}

	public componentWillUnmount() {
		window.removeEventListener("resize", this.handleWindowResize);
	}

	private handleWindowResize() {
		this.updateComponentDimensions();
	}

	public updateComponentDimensions() {
		var state = _.assign({}, this.state) as PRegisterDataGridState;
		var div = ReactDOM.findDOMNode(this.dataGridContainer);
		state.componentWidth = div.clientWidth;
		state.componentHeight = div.clientHeight;
		this.setState(state);
	}

	private showInfoColumn():boolean {

		var accounts:Array<budgetEntities.IAccount>;
		if(this.props.isAllAccounts == true)
			accounts = this.props.entitiesCollection.accounts.getAllItems();
		else 
			accounts = [ this.props.entitiesCollection.accounts.getEntityById(this.props.accountId) ];

		var showInfoColumn = false;
		// Iterate through all the accounts that we are showing, and if any of these have a non-zero
		// warning or info count, then set showInfoColumn to true
		_.forEach(accounts, (account)=>{

			if(account.infoCount > 0 || account.warningCount > 0) {
				showInfoColumn = true;
				return false;
			}
		});

		return showInfoColumn;
	}

	public render() {

		var showDataGrid:boolean = this.state.componentWidth > 0 && this.state.componentHeight > 0;
		if(showDataGrid) {

			var sortField = this.props.registerState.sortByFields[0];
			var sortOrder = this.props.registerState.sortOrders[0];
			var registerTransactionObjects = this.props.registerState.registerTransactionObjectsArray;

			var tableColumns = [
				<Column 
					key="selectionColumn"
					width={25}
					header={<PSelectionColumnHeader selectAllTransactions={this.props.selectAllTransactions} unselectAllTransactions={this.props.unselectAllTransactions} />}
					cell={
						<PSelectionCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={this.props.registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
							unselectTransaction={this.props.unselectTransaction} 
						/>
					}
				/>,
				<Column 
					key="infoColumn"
					width={25}
					header={<PInfoColumnHeader />}
					cell={
						<PInfoCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={this.props.registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
							showApproveRejectDialog={this.props.showApproveRejectDialog}
						/>
					}
				/>,
				<Column 
					key="flagColumn"
					width={25}
					header={<PFlagColumnHeader />}
					cell={
						<PFlagCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={this.props.registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							showFlagSelectionDialog={this.props.showFlagSelectionDialog}
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				<Column 
					key="accountColumn"
					width={100}
					header={
						<PColumnHeader label="ACCOUNT" fieldName={RegisterSortField.Account}
							sortByField={sortField} sortOrder={sortOrder} 
							setRegisterSort={this.props.setRegisterSort}
						/>
					}
					cell={
						<PAccountCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={this.props.registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				<Column 
					key="dateColumn"
					width={90}
					header={
						<PColumnHeader label="DATE" fieldName={RegisterSortField.Date}
							sortByField={sortField} sortOrder={sortOrder} 
							setRegisterSort={this.props.setRegisterSort}
						/>
					}
					cell={
						<PDateCell  
							dataFormatter={this.props.dataFormatter}
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={this.props.registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				<Column 
					key="payeeColumn"
					width={170}
					header={
						<PColumnHeader label="PAYEE" fieldName={RegisterSortField.Payee}
							sortByField={sortField} sortOrder={sortOrder} 
							setRegisterSort={this.props.setRegisterSort}
						/>
					}
					cell={
						<PPayeeCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={this.props.registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				<Column 
					key="categoryColumn"
					width={280}
					header={
						<PColumnHeader label="CATEGORY" fieldName={RegisterSortField.Category}
							sortByField={sortField} sortOrder={sortOrder} 
							setRegisterSort={this.props.setRegisterSort}
						/>
					}
					cell={
						<PCategoryCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={this.props.registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				<Column 
					key="memoColumn"
					width={170}
					flexGrow={1}
					header={
						<PColumnHeader label="MEMO" fieldName={RegisterSortField.Memo}
							sortByField={sortField} sortOrder={sortOrder} 
							setRegisterSort={this.props.setRegisterSort}
						/>
					}
					cell={
						<PMemoCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={this.props.registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				<Column 
					key="outflowColumn"
					width={100}
					header={
						<PColumnHeader label="OUTFLOW" fieldName={RegisterSortField.Outflow}
							sortByField={sortField} sortOrder={sortOrder} 
							setRegisterSort={this.props.setRegisterSort}
						/>
					}
					cell={
						<POutflowCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={this.props.registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				<Column 
					key="inflowColumn"
					width={100}
					header={
						<PColumnHeader label="INFLOW" fieldName={RegisterSortField.Inflow}
							sortByField={sortField} sortOrder={sortOrder} 
							setRegisterSort={this.props.setRegisterSort}
						/>
					}
					cell={
						<PInflowCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={this.props.registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				<Column 
					key="clearedColumn"
					width={30}
					header={<PClearedColumnHeader />}
					cell={
						<PClearedCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={this.props.registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction}
							updateClearedForTransaction={this.props.updateClearedForTransaction} 
						/>
					}
				/>
			];

			if(this.props.isAllAccounts == false) {
				// Remove the accounts column from the array we created above
				tableColumns.splice(3, 1); // Start at index 3, remove 1 item
			}

			if(this.showInfoColumn() == false) {
				// Remove the info column from the array we created above
				tableColumns.splice(1, 1); // Start at index 1, remove 1 item
			}

			return (
				<div style={RegisterDataGridContainerStyle} ref={(d)=> this.dataGridContainer = d}>
					<Table headerHeight={25} rowHeight={30} 
						rowsCount={registerTransactionObjects ? registerTransactionObjects.length : 0} 
						width={this.state.componentWidth} height={this.state.componentHeight}>
						{tableColumns}
					</Table>
				</div>
			);
		}
		else {
			return (
				<div style={RegisterDataGridContainerStyle} ref={(d)=> this.dataGridContainer = d} />
			);
		}
  	}
}