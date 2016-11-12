/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { ITransaction } from '../../../interfaces/budgetEntities';
import { ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PApproveRejectDialogProps {
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PApproveRejectDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	transaction:ITransaction;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'250px',
	display: "flex",
	flexFlow: "column nowrap",
}

const ButtonStyle:React.CSSProperties = {
	width: "100%"
}

export class PApproveRejectDialog extends React.Component<PApproveRejectDialogProps, PApproveRejectDialogState> {

	constructor(props: any) {
        super(props);
		this.hide = this.hide.bind(this);
		this.approveTransaction = this.approveTransaction.bind(this);
		this.rejectTransaction = this.rejectTransaction.bind(this);
		this.state = {
			show: false, 
			target: null, 
			placement: "bottom",
			transaction: null
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}
	
	public show(transaction:ITransaction, target:HTMLElement, placement:string = "bottom"):void {

		// Get the subCategory for the passed subCategoryId
		var state = Object.assign({}, this.state) as PApproveRejectDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		state.transaction = transaction;
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PApproveRejectDialogState;
		state.show = false;
		state.transaction = null;
		this.setState(state);
	}

	private approveTransaction():void {

		// Create a clone of the transaction, set the accepted flag to true, and save
		var updatedTransaction = Object.assign({}, this.state.transaction);
		updatedTransaction.accepted = 1;
		this.props.updateEntities({
			transactions: [updatedTransaction]
		});

		// Hide the dialog
		this.hide();
	}

	private rejectTransaction():void {

		// Create a clone of the transaction, set the tombstone flag to true, and save
		var updatedTransaction = Object.assign({}, this.state.transaction);
		updatedTransaction.isTombstone = 1;
		this.props.updateEntities({
			transactions: [updatedTransaction]
		});

		// Hide the dialog
		this.hide();
	}

	public render() {

		if(this.state.transaction) {

			return (
				<Overlay key="overlay" rootClose={true} show={this.state.show} placement={this.state.placement} 
					onHide={this.hide} target={ ()=> ReactDOM.findDOMNode(this.state.target) }>
					<Popover id="approveRejectPopover" style={PopoverStyle}>
						<Button className="dialog-primary-button" style={ButtonStyle} onClick={this.approveTransaction}> 
							<Glyphicon glyph="ok-circle"/>&nbsp;Approve Transaction
						</Button>
						<div style={{height:"10px"}} />
						<Button className="dialog-warning-button" style={ButtonStyle} onClick={this.rejectTransaction}> 
							<Glyphicon glyph="remove-circle"/>&nbsp;Reject Transaction
						</Button>
					</Popover>
				</Overlay>
			);
		}
		else {
			return <div />;
		}
	}
}
