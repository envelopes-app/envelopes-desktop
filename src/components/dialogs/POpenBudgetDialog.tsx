/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Modal, Glyphicon } from 'react-bootstrap';

import { EntityFactory } from '../../persistence';
import { DataFormatter, DateWithoutTime } from '../../utilities';
import * as catalogEntities from '../../interfaces/catalogEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../interfaces/state';

export interface POpenBudgetDialogProps { 
	dataFormatter:DataFormatter;
	activeBudgetId:string;
	entitiesCollection:IEntitiesCollection;

	showCreateNewBudgetDialog:()=>void;
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
	openBudget:(budget:catalogEntities.IBudget)=>void;
}

export interface POpenBudgetDialogState {
	showModal:boolean;
	budgetIdForDeletion:string;
}

const BudgetNameContainer:React.CSSProperties = {
	display: "flex",
	flexFlow: "column nowrap",
	flex: "0 0 auto"
}

export class POpenBudgetDialog extends React.Component<POpenBudgetDialogProps, POpenBudgetDialogState> {

	constructor(props:POpenBudgetDialogProps) {
        super(props);
		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
		this.create = this.create.bind(this);
        this.state = { 
			showModal: false,
			budgetIdForDeletion: null
		};
    }

	private hide():void {
		// Hide the modal, and set the account in state to null
		this.setState({ 
			showModal:false,
			budgetIdForDeletion: null
		});
	};

	public isShowing():boolean {
		return this.state.showModal;
	}

	public show():void {

		this.setState({ 
			showModal: true,
			budgetIdForDeletion: null
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

	private setBudgetIdForDeletion(budgetId:string):void {

		var state = Object.assign({}, this.state);
		state.budgetIdForDeletion = budgetId;
		this.setState(state);
	}

	private deleteBudget(budgetId:string):void {

		// Get the budget entity corresponding to this entity
		var budget = this.props.entitiesCollection.budgets.getEntityById(budgetId);
		var budgetClone = Object.assign({}, budget);
		budgetClone.isTombstone = 1;
		this.props.updateEntities({
			budgets: [budgetClone]
		});

		var state = Object.assign({}, this.state);
		state.budgetIdForDeletion = null;
		this.setState(state);
	}

	private cancelDeletionConfirmation():void {

		var state = Object.assign({}, this.state);
		state.budgetIdForDeletion = null;
		this.setState(state);
	}	

	private getBudgetsList():Array<JSX.Element> {

		var budgets:Array<JSX.Element> = [];
		var dataFormatter = this.props.dataFormatter;

		_.forEach(this.props.entitiesCollection.budgets.getAllItems(), (budget)=>{

			// If this is not the currently active budget, add it to the list
			if(budget.isTombstone == 0 && budget.entityId != this.props.activeBudgetId) {
				
				if(budget.entityId != this.state.budgetIdForDeletion) {
					var lastAccessedOn = "";
					if(budget.lastAccessedOn)
						lastAccessedOn = dataFormatter.formatDate(budget.lastAccessedOn);

					budgets.push(
						<div key={budget.entityId} className="budget-list-item">
							<div style={BudgetNameContainer} onClick={this.openBudget.bind(this, budget.entityId)}>
								<label className="budget-list-item-budgetname">{budget.budgetName}</label>
								<label className="budget-list-item-lastaccessedon">last accessed on {lastAccessedOn}</label>
							</div>
							<div className="spacer" />
							<Glyphicon glyph="trash" className="budget-list-item-deleteglyph" onClick={this.setBudgetIdForDeletion.bind(this, budget.entityId)} />
						</div>
					);
				}
				else {
					budgets.push(
						<div key={budget.entityId} className="budget-list-item-delete-confirmation">
							<label className="budget-list-item-delete-message">
								Are you sure you want to delete "{budget.budgetName}"?
							</label>
							<div className="spacer" />
							<button className="dialog-warning-button" onClick={this.cancelDeletionConfirmation.bind(this)}>
								Cancel
							</button>
							<div style={{width:"8px"}} />
							<button className="dialog-warning-button" onClick={this.deleteBudget.bind(this, budget.entityId)}>
								Delete
							</button>
						</div>
					);
				}
			}
		});

		return budgets;
	}

	public render() {

		if(this.state.showModal) {

			var budgets = this.getBudgetsList();

			return (
				<div className="open-budget-dialog">
					<Modal show={this.state.showModal} animation={true} onHide={this.hide} backdrop="static" keyboard={false}>
						<Modal.Header>
							<Modal.Title>Open a budget</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<div>
								<ul className="budget-list">
									{budgets}
								</ul>
							</div>
						</Modal.Body>
						<Modal.Footer>
							<div className="buttons-container">
								<button className="dialog-primary-button" onClick={this.create}>
									Create New Budget&nbsp;<Glyphicon glyph="plus" />
								</button>
								<div className="spacer" />
								<button className="dialog-secondary-button" onClick={this.hide}>
									Cancel&nbsp;<Glyphicon glyph="remove-sign" />
								</button>
							</div>
						</Modal.Footer>
					</Modal>
				</div>
			);
		}
		else
			return <div />;
	}
}