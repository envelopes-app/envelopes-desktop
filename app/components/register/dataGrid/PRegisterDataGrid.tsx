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
import { PCheckNumberCell } from './PCheckNumberCell';
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

const RegisterDataGridContainerStyle:React.CSSProperties = {
	flex: '1 1 auto',
	backgroundColor: '#ffffff'
}

export class PRegisterDataGrid extends React.Component<PRegisterDataGridProps, PRegisterDataGridState> {
  
	private dataGridContainer:HTMLDivElement;

	constructor(props:PRegisterDataGridProps) {
        super(props);
		this.onKeyDown = this.onKeyDown.bind(this);
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
		var state = Object.assign({}, this.state) as PRegisterDataGridState;
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


	private onKeyDown(event:React.KeyboardEvent<any>):void {

		debugger;
		// We want the user to move the selection up and down the register screen using the arrow
		// keys, and also the tab/shift-tab combination.
		if(event.keyCode == 38) {
			// Up Arrow Key
			event.stopPropagation();
		}
		else if(event.keyCode == 40) {
			// Down Arrow Key
			event.stopPropagation();
		}
		else if(event.keyCode == 9) {
			// Tab Key
			//if(event.shiftKey) {}
			//else {}
			event.stopPropagation();
		}
		else if(event.keyCode == 27) {
			// Excape Key
			event.stopPropagation();
		}
		else if(event.keyCode == 13) {
			// Enter Key
			event.stopPropagation();
		}
	}

	public render() {

		var showDataGrid:boolean = this.state.componentWidth > 0 && this.state.componentHeight > 0;
		if(showDataGrid) {

			var registerState = this.props.registerState;
			var sortField = registerState.sortByFields[0];
			var sortOrder = registerState.sortOrders[0];
			var registerTransactionObjects = registerState.registerTransactionObjectsArray;

			var tableColumns = [
				// Index 0
				<Column 
					key="selectionColumn"
					width={25}
					header={<PSelectionColumnHeader selectAllTransactions={this.props.selectAllTransactions} unselectAllTransactions={this.props.unselectAllTransactions} />}
					cell={
						<PSelectionCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
							unselectTransaction={this.props.unselectTransaction} 
						/>
					}
				/>,
				// Index 1
				<Column 
					key="infoColumn"
					width={25}
					header={<PInfoColumnHeader />}
					cell={
						<PInfoCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
							showApproveRejectDialog={this.props.showApproveRejectDialog}
						/>
					}
				/>,
				// Index 2
				<Column 
					key="flagColumn"
					width={25}
					header={<PFlagColumnHeader />}
					cell={
						<PFlagCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							showFlagSelectionDialog={this.props.showFlagSelectionDialog}
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				// Index 3
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
							selectedTransactionsMap={registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				// Index 4
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
							selectedTransactionsMap={registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				// Index 5
				<Column 
					key="checkColumn"
					width={90}
					header={
						<PColumnHeader label="CHECK #" fieldName={RegisterSortField.CheckNumber}
							sortByField={sortField} sortOrder={sortOrder} 
							setRegisterSort={this.props.setRegisterSort}
						/>
					}
					cell={
						<PCheckNumberCell  
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				// Index 6
				<Column 
					key="payeeColumn"
					width={170}
					flexGrow={1}
					header={
						<PColumnHeader label="PAYEE" fieldName={RegisterSortField.Payee}
							sortByField={sortField} sortOrder={sortOrder} 
							setRegisterSort={this.props.setRegisterSort}
						/>
					}
					cell={
						<PPayeeCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				// Index 7
				<Column 
					key="categoryColumn"
					width={280}
					flexGrow={1}
					header={
						<PColumnHeader label="CATEGORY" fieldName={RegisterSortField.Category}
							sortByField={sortField} sortOrder={sortOrder} 
							setRegisterSort={this.props.setRegisterSort}
						/>
					}
					cell={
						<PCategoryCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				// Index 8
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
							selectedTransactionsMap={registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				// Index 9
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
							dataFormatter={this.props.dataFormatter}
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				// Index 10
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
							dataFormatter={this.props.dataFormatter}
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction} 
						/>
					}
				/>,
				// Index 11
				<Column 
					key="clearedColumn"
					width={30}
					header={<PClearedColumnHeader />}
					cell={
						<PClearedCell 
							registerTransactionObjects={registerTransactionObjects}
							selectedTransactionsMap={registerState.selectedTransactionsMap}
							editTransaction={this.props.editTransaction} 
							selectTransaction={this.props.selectTransaction}
							updateClearedForTransaction={this.props.updateClearedForTransaction} 
						/>
					}
				/>
			];

			if(registerState.showClearedColumn == false) {
				// Remove the cleared column from the array we created above
				tableColumns.splice(11, 1); // Start at index 11, remove 1 item
			}

			if(registerState.showMemoColumn == false) {
				// Remove the memo column from the array we created above
				tableColumns.splice(8, 1);
			}

			if(registerState.showCheckColumn == false) {
				// Remove the check number column from the array we created above
				tableColumns.splice(5, 1);
			}

			if(this.props.isAllAccounts == false) {
				// Remove the accounts column from the array we created above
				tableColumns.splice(3, 1);
			}

			if(registerState.showFlagColumn == false) {
				// Remove the flag column from the array we created above
				tableColumns.splice(2, 1);
			}

			if(this.showInfoColumn() == false) {
				// Remove the info column from the array we created above
				tableColumns.splice(1, 1);
			}

			return (
				<div style={RegisterDataGridContainerStyle} ref={(d)=> this.dataGridContainer = d} onKeyDown={this.onKeyDown}>
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