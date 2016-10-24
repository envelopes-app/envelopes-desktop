/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { TransactionFlag } from '../../../constants';
import { ITransaction, IScheduledTransaction } from '../../../interfaces/budgetEntities';
import { ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PMoveToAccountDialogProps {
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PMoveToAccountDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
}

const PopoverStyle = {
	maxWidth: 'none',
	width:'200px'
}

export class PMoveToAccountDialog extends React.Component<PMoveToAccountDialogProps, PMoveToAccountDialogState> {

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
		var state = Object.assign({}, this.state) as PMoveToAccountDialogState;
		state.show = true;
		state.target = target;
		state.placement = placement;
		this.setState(state);
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PMoveToAccountDialogState;
		state.show = false;
		this.setState(state);
	}

	public render() {

		if(this.state.show) {

			return (
				<Overlay key="overlay" rootClose={true} show={this.state.show} placement={this.state.placement} 
					onHide={this.hide} target={ ()=> ReactDOM.findDOMNode(this.state.target) }>
					<Popover id="moveToAccountPopover" style={PopoverStyle}>
					</Popover>
				</Overlay>
			);
		}
		else {
			return <div />;
		}
	}
}
