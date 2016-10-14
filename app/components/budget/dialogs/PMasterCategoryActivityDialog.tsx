/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, FormGroup, FormControl, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { PTransactionsList } from './PTransactionsList';
import { DateWithoutTime } from '../../../utilities/';
import { ITransactionObject } from '../../../interfaces/objects';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PMasterCategoryActivityDialogProps {
	entitiesCollection:IEntitiesCollection
}

export interface PMasterCategoryActivityDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
	transactions:Array<ITransactionObject>;
}

const PopoverStyle = {
	maxWidth: 'none',
	width:'400px'
}

export class PMasterCategoryActivityDialog extends React.Component<PMasterCategoryActivityDialogProps, PMasterCategoryActivityDialogState> {

	constructor(props: any) {
        super(props);
		this.hide = this.hide.bind(this);
		this.onOkClick = this.onOkClick.bind(this);
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

	private onOkClick():void { 
		// Hide the dialog
		this.hide();
	}
	
	public show(subCategoryId:string, month:DateWithoutTime, target:HTMLElement, placement:string = "bottom"):void {

		// Get the subCategory for the passed subCategoryId
		var subCategory = this.props.entitiesCollection.subCategories.getEntityById(subCategoryId);
		var monthlySubCategoryBudget = this.props.entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(subCategoryId, month.toISOString());
		if(subCategory && monthlySubCategoryBudget) {

			var state = Object.assign({}, this.state) as PMasterCategoryActivityDialogState;
			state.show = true;
			state.target = target;
			state.placement = placement;
			state.transactions = this.buildTransactionObjects();
			this.setState(state);
		}
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PMasterCategoryActivityDialogState;
		state.show = false;
		this.setState(state);
	}

	private buildTransactionObjects():Array<ITransactionObject> {

		return null;
	}

	public render() {

		return (
			<Overlay show={this.state.show} placement={this.state.placement} 
				rootClose={true} onHide={this.onOkClick} target={()=> ReactDOM.findDOMNode(this.state.target)}>
				<Popover id="masterCategoryActivityDialog" style={PopoverStyle}>
					<PTransactionsList 
						showAccountColumn={true}
						showCategoryColumn={false}
						transactions={this.state.transactions}
					/>
					<div className="buttons-container">
						<Button className="dialog-primary-button" onClick={this.onOkClick}>
							OK&nbsp;<Glyphicon glyph="ok-circle"/>
						</Button>
					</div>
				</Popover>
			</Overlay>
		);
	}
}
