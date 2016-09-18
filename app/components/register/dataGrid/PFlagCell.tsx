/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Cell } from 'fixed-data-table';
import { Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { TransactionFlag } from '../../../constants';
import { ITransaction } from '../../../interfaces/budgetEntities';
import { SimpleObjectMap } from '../../../utilities';

export interface PFlagCellProps {
	width?:number;
	height?:number;
	rowIndex?:number;
	columnKey?:string;
	transactions:Array<ITransaction>;
	selectedTransactionsMap:SimpleObjectMap<boolean>;

	editTransaction:(transactionId:string, focusOnField:string)=>void;
	selectTransaction:(transactionId:string, unselectAllOthers:boolean)=>void;
	updateFlagForTransaction:(transaction:ITransaction, flag:string)=>void;
}

export interface PFlagCellState {
	showPopover:boolean;
	transaction:ITransaction;
}

const CellStyle = {
	height: "100%",
	width: "100%",
	fontSize: "14px",
	paddingTop: "4px",
	paddingLeft: "4px"
}

const CellStyleSelected = {
	height: "100%",
	width: "100%",
	color: "#FFFFFF",
	backgroundColor: "#00596F",
	fontSize: "14px",
	paddingTop: "4px",
	paddingLeft: "4px"
}

const PopoverStyle = {
	maxWidth: 'none', 
	width:'200px'
}

export class PFlagCell extends React.Component<PFlagCellProps, PFlagCellState> {

	private flagGlyph:HTMLSpanElement;

	constructor(props: any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
		this.onHide = this.onHide.bind(this);
		this.onGlyphClick = this.onGlyphClick.bind(this);
		this.state = {showPopover: false, transaction: null};
	}

	private onClick(event:MouseEvent):void {

		if((event.target as any).localName == "div") {
			var transaction = this.props.transactions[this.props.rowIndex];
			this.props.selectTransaction(transaction.entityId, true);
		}
	}	

	private onDoubleClick(event:MouseEvent):void {

		var transaction = this.props.transactions[this.props.rowIndex];
		this.props.editTransaction(transaction.entityId, null);
	}

	private onGlyphClick():void {

		var transaction = this.props.transactions[this.props.rowIndex];
		// Update the state to show the popover
		var state = _.assign({}, this.state) as PFlagCellState;
		state.showPopover = true;
		state.transaction = transaction;
		this.setState(state);
	}

	private onHide():void {

		// Hide the popover
		var state = _.assign({}, this.state) as PFlagCellState;
		state.showPopover = false;
		state.transaction = null;
		this.setState(state);
	}

	private setSelectedFlag(flag:string):void {

		// Get the transaction from the state and call method to update it
		var transaction = this.state.transaction;
		this.props.updateFlagForTransaction(transaction, flag);
		this.onHide();
	}

	private getListItem(flagColorName:string, selected:boolean = false) {

		var flagColor = TransactionFlag.getFlagColor(flagColorName);
		var flagTextColor = TransactionFlag.getFlagTextColor(flagColorName);

		if(selected) {
			return (
				<div key={flagColorName} className="flag-dropdown-list-item-selected" style={{backgroundColor:flagColor}} onClick={this.setSelectedFlag.bind(this, flagColorName)}>
					<button className="flag-dropdown-list-item-button" style={{backgroundColor:flagTextColor, borderColor:flagTextColor}}>{flagColorName}</button>
					<Glyphicon glyph="ok-circle" style={{color:'white'}}/>
				</div>
			);
		}
		else {
			return (
				<div key={flagColorName} className="flag-dropdown-list-item" style={{backgroundColor:flagColor}} onClick={this.setSelectedFlag.bind(this, flagColorName)}>
					<button className="flag-dropdown-list-item-button" style={{backgroundColor:flagTextColor, borderColor:flagTextColor}}>{flagColorName}</button>
				</div>
			);
		}
	}

	public render() {

		var flagColor = TransactionFlag.getFlagColor(TransactionFlag.None);
		var selected:boolean = false;
		var items = [
			(
				<span key="glyph" className="glyphicon glyphicon-flag" aria-hidden="true"
					style={{cursor: 'pointer'}} onClick={this.onGlyphClick} 
					ref={(s)=> this.flagGlyph = s}/>
			)
		];

		if(this.props.transactions) {

			// Get the transaction for the current row
			var transaction = this.props.transactions[this.props.rowIndex];
			flagColor = TransactionFlag.getFlagColor(transaction.flag);
			// Check whether this transaction is currently selected
			var selectedValue = this.props.selectedTransactionsMap[transaction.entityId];
			if(selectedValue && selectedValue == true)
				selected = true;

			if(this.state.showPopover) {

				var flagPopoverItems = [
					this.getListItem("None", transaction.flag === 'None'),
					this.getListItem("Red", transaction.flag === 'Red'),
					this.getListItem("Orange", transaction.flag === 'Orange'),
					this.getListItem("Yellow", transaction.flag === 'Yellow'),
					this.getListItem("Green", transaction.flag === 'Green'),
					this.getListItem("Blue", transaction.flag === 'Blue'),
					this.getListItem("Purple", transaction.flag === 'Purple')
				];

				var popover = (
					<Overlay key="overlay" rootClose={true} show={true} placement="bottom" onHide={this.onHide} 
						target={ ()=> ReactDOM.findDOMNode(this.flagGlyph) }>
						<Popover id="selectFlagPopover" style={PopoverStyle}>
							<ul className="flag-dropdown-list">
								{flagPopoverItems}
							</ul>
						</Popover>
					</Overlay>
				);

				items.push(popover);
			}
		}

		var cellStyle:any;
		if(selected)
			cellStyle = _.assign({}, CellStyleSelected, {color:flagColor});
		else 
			cellStyle = _.assign({}, CellStyle, {color:flagColor});

		return (
			<div style={cellStyle} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>
				{items}
			</div>
		);
  	}
}