/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { TransactionFlag } from '../../../constants';
import { ITransaction, IScheduledTransaction } from '../../../interfaces/budgetEntities';
import { ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PEditMenuDialogProps {
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PEditMenuDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
}

const PopoverStyle = {
	maxWidth: 'none',
	width:'220px',
	display: "flex",
	flexFlow: "column nowrap",
	alignItems: "stretch"
}

export class PEditMenuDialog extends React.Component<PEditMenuDialogProps, PEditMenuDialogState> {

	constructor(props: any) {
        super(props);
		this.hide = this.hide.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"bottom"
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}
	
	public show(target:HTMLElement, placement:string = "bottom"):void {

		// Get the subCategory for the passed subCategoryId
		var state = Object.assign({}, this.state) as PEditMenuDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PEditMenuDialogState;
		state.show = false;
		this.setState(state);
	}

	public render() {

		if(this.state.show) {

			return (
				<Overlay key="overlay" rootClose={true} show={this.state.show} placement={this.state.placement} 
					onHide={this.hide} target={ ()=> ReactDOM.findDOMNode(this.state.target) }>
					<Popover id="editMenuPopover" style={PopoverStyle}>
						<div className="menu-item">
							<Glyphicon glyph="copyright-mark" />
							&nbsp;Mark as Cleared
						</div>
						<div className="menu-item">
							<Glyphicon glyph="copyright-mark" style={{opacity:"0.5"}} />
							&nbsp;Mark as Uncleared
						</div>
						<div className="menu-item-separator" />
						<div className="menu-item">
							<Glyphicon glyph="ok-circle" />
							&nbsp;Approve
						</div>
						<div className="menu-item">
							<Glyphicon glyph="minus-sign" />
							&nbsp;Reject
						</div>
						<div className="menu-item-separator" />
						<div className="menu-item">
							<Glyphicon glyph="envelope" />
							&nbsp;Categorize as
						</div>
						<div className="menu-item-separator" />
						<div className="menu-item">
							<Glyphicon glyph="transfer" />
							&nbsp;Move to account
						</div>
						<div className="menu-item-separator" />
						<div className="menu-item">
							<Glyphicon glyph="remove-circle" />
							&nbsp;Delete
						</div>
					</Popover>
				</Overlay>
			);
		}
		else {
			return <div />;
		}
	}
}
