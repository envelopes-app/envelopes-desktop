/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, Form, Glyphicon, Modal } from 'react-bootstrap';

import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PReorderAccountsDialogProps {
	entitiesCollection:IEntitiesCollection
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PPReorderAccountsDialogState {
	show:boolean;
}

const PopoverStyle:React.CSSProperties = {
	maxWidth: 'none',
	width:'260px'
}

export class PReorderAccountsDialog extends React.Component<PReorderAccountsDialogProps, PPReorderAccountsDialogState> {

	constructor(props:PReorderAccountsDialogProps) {
        super(props);
		this.hide = this.hide.bind(this);
		this.state = {
			show:false
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}
	
	public show():void {

		var state = Object.assign({}, this.state) as PPReorderAccountsDialogState;
		state.show = true;
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PPReorderAccountsDialogState;
		state.show = false;
		this.setState(state);
	}

	public render() {

		if(this.state.show) {

			return (
				<Modal show={this.state.show} animation={true} onHide={this.hide} backdrop="static" keyboard={false} dialogClassName="reorder-categories-dialog">
					<Modal.Header className="modal-header">
						<Modal.Title>Reorder Accounts</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form>
						</Form>
					</Modal.Body>
					<Modal.Footer>
						<Button className="dialog-secondary-button" onClick={this.hide}>
							Cancel&nbsp;<Glyphicon glyph="remove-sign" />
						</Button>
						<Button className="dialog-primary-button" onClick={this.hide}>
							Save&nbsp;<Glyphicon glyph="ok-sign" />
						</Button>
					</Modal.Footer>
				</Modal>
			);
		}
		else {
			return <div />;
		}
	}
}
