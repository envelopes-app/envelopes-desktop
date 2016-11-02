/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Col, Modal, Form, FormGroup, FormControl, ControlLabel, Radio, Glyphicon } from 'react-bootstrap';

import { EntityFactory } from '../../persistence';
import { DataFormats, DateWithoutTime } from '../../utilities';
import * as catalogEntities from '../../interfaces/catalogEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../interfaces/state';

export interface POpenBudgetDialogProps { 
	activeBudget:catalogEntities.IBudget;
	entitiesCollection:IEntitiesCollection

	showCreateNewBudgetDialog:()=>void;
	// Dispatcher Functions
	openBudget:(budget:catalogEntities.IBudget)=>void;
}

export interface POpenBudgetDialogState {
	showModal:boolean;
}

const ButtonsContainerStyle = {
	width: "100%",
	display: "flex",
	flexFlow: "row nowrap"
}

export class POpenBudgetDialog extends React.Component<POpenBudgetDialogProps, POpenBudgetDialogState> {

	constructor(props: any) {
        super(props);
		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
		this.create = this.create.bind(this);
        this.state = { 
			showModal: false
		};
    }

	private hide():void {
		// Hide the modal, and set the account in state to null
		this.setState({ showModal:false });
	};

	public isShowing():boolean {
		return this.state.showModal;
	}

	public show():void {

		this.setState({ 
			showModal: true
		});
	};

	private create():void {

		this.hide();
		this.props.showCreateNewBudgetDialog();
	}

	private openBudget(budgetId:string):void {

		// Get the corresponding budget entity from the entities collection
		var budget = this.props.entitiesCollection.budgets.getEntityById(budgetId);
		this.props.openBudget(budget);
		this.hide();
	}

	private getBudgetsList():Array<JSX.Element> {

		var budgets:Array<JSX.Element> = [];

		_.forEach(this.props.entitiesCollection.budgets.getAllItems(), (budget)=>{

			// If this is not the currently active budget, add it to the list
			if(budget.isTombstone == 0 && budget.entityId != this.props.activeBudget.entityId) {
				
				var lastAccessedOn = "";
				if(budget.lastAccessedOn)
					lastAccessedOn = DateWithoutTime.createFromUTCTime(budget.lastAccessedOn).toISOString();

				budgets.push(
					<div key={budget.entityId} className="budget-list-item" onClick={this.openBudget.bind(this, budget.entityId)}>
						<label className="budget-list-item-budgetname">{budget.budgetName}</label>
						<label className="budget-list-item-lastaccessedon">last accessed on {lastAccessedOn}</label>
					</div>
				);
			}
		});

		return budgets;
	}

	public render() {

		if(this.state.showModal) {

			var budgets = this.getBudgetsList();

			return (
				<Modal show={this.state.showModal} animation={true} onHide={this.hide} backdrop="static" keyboard={false} dialogClassName="open-budget-dialog">
					<Modal.Header bsClass="modal-header">
						<Modal.Title>Open a budget</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<ul className="budget-list">
							{budgets}
						</ul>
					</Modal.Body>
					<Modal.Footer>
						<div style={ButtonsContainerStyle}>
							<Button className="dialog-primary-button" onClick={this.create}>
								Create New Budget&nbsp;<Glyphicon glyph="plus" />
							</Button>
							<div className="spacer" />
							<Button className="dialog-secondary-button" onClick={this.hide}>
								Close&nbsp;<Glyphicon glyph="remove-sign" />
							</Button>
						</div>
					</Modal.Footer>
				</Modal>
			);
		}
		else
			return <div />;
	}
}