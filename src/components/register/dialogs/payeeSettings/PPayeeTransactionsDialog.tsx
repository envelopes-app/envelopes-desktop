/// <reference path="../../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { PTransactionsList } from '../../../common/PTransactionsList';
import { TransactionSources } from '../../../../constants';
import { DataFormatter, DateWithoutTime } from '../../../../utilities';
import { ITransactionObject } from '../../../../interfaces/objects';
import * as budgetEntities from '../../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../../interfaces/state';

export interface PPayeeTransactionsDialogProps {
	dataFormatter:DataFormatter;
	entitiesCollection:IEntitiesCollection
}

export interface PPayeeTransactionsDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	transactions:Array<ITransactionObject>;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'610px'
}

export class PPayeeTransactionsDialog extends React.Component<PPayeeTransactionsDialogProps, PPayeeTransactionsDialogState> {

	constructor(props:PPayeeTransactionsDialogProps) {
        super(props);
		this.hide = this.hide.bind(this);
		this.onCloseClick = this.onCloseClick.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"left",
			transactions:null
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}

	private onCloseClick():void { 
		// Hide the dialog
		this.hide();
	}
	
	public show(transactions:Array<ITransactionObject>, target:HTMLElement, placement:string = "bottom"):void {

		var state = Object.assign({}, this.state) as PPayeeTransactionsDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		state.transactions = transactions;
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PPayeeTransactionsDialogState;
		state.show = false;
		this.setState(state);
	}

	public render() {

		if(this.state.show) {
			return (
				<Overlay show={this.state.show} placement={this.state.placement} 
					rootClose={true} onHide={this.onCloseClick} target={()=> ReactDOM.findDOMNode(this.state.target)}>
					<Popover id="masterCategoryActivityDialog" style={PopoverStyle}>
						<PTransactionsList 
							dataFormatter={this.props.dataFormatter}
							showAccountColumn={true}
							showCategoryColumn={true}
							showPayeeColumn={false}
							transactions={this.state.transactions}
						/>
					</Popover>
				</Overlay>
			);
		}
		else {
			return <div />;
		}
	}
}
