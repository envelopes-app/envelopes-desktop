/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form, FormControl, FormGroup, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PPayeeSelectorProps { 
	width: number;
	payees: Array<budgetEntities.IPayee>;
}

const PayeeSelectorStyle = {
	borderColor: '#009CC2',
	borderTopWidth: '2px',
	borderBottomWidth: '2px',
	borderLeftWidth: '2px',
	borderRightWidth: '2px',
}

const GlyphIconStyle = {
	color: '#009CC2'
}

const PopoverStyle = {
	maxWidth: 'none', 
	width:'250px'
}

const PayeeSelectionListItemStyle = {
	width: '100%',
}

export class PPayeeSelector extends React.Component<PPayeeSelectorProps, {showPopover:boolean, selectedPayee:budgetEntities.IPayee}> {

	private payeeInput:FormControl;

	constructor(props: any) {
        super(props);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.setSelectedPayee = this.setSelectedPayee.bind(this);
		this.state = {showPopover:false, selectedPayee: this.props.payees[0]};	
	}

	private onFocus() {
		var state:any = _.assign({}, this.state);
		state.showPopover = true;
		this.setState(state);
	}

	private onBlur() {
		// this.setState({showPopover:false});
	}

	private setSelectedPayee(entityId:string) {
		// Get the payee from the list of payees that corresponds to this entityId
		var selectedPayee = _.find(this.props.payees, { entityId: entityId});
		var state:any = _.assign({}, this.state);
		state.selectedPayee = selectedPayee;
		this.setState(state);
	}

	public render() {

		var payeesPopoverItem;
		var payeesPopoverItems = [];

		// Get the currently selected payee from state so that we can highlight the corresponding item
		var selectedPayee = this.state.selectedPayee;

		_.forEach(this.props.payees, (payee)=>{

			if(selectedPayee && selectedPayee.entityId == payee.entityId)
				payeesPopoverItem = <li key={payee.entityId} className="custom-dropdown-list-item-selected" id={payee.entityId}>{payee.name}</li>;
			else
				payeesPopoverItem = <li key={payee.entityId} className="custom-dropdown-list-item" id={payee.entityId} onClick={this.setSelectedPayee.bind(this, payee.entityId)}>{payee.name}</li>;

			payeesPopoverItems.push(payeesPopoverItem);
		});

		return (
			<div>
				<FormGroup width={this.props.width}>
					<FormControl ref={(n) => this.payeeInput = n } type="text" componentClass="input" style={PayeeSelectorStyle} 
						onFocus={this.onFocus} onBlur={this.onBlur} contentEditable={false} 
						defaultValue={this.state.selectedPayee ? this.state.selectedPayee.name : ""} />
					<FormControl.Feedback>
						<Glyphicon glyph="triangle-bottom" style={GlyphIconStyle} />
					</FormControl.Feedback>
				</FormGroup>
				<Overlay show={this.state.showPopover} placement="bottom" target={ ()=> ReactDOM.findDOMNode(this.payeeInput) }>
					<Popover id="selectPayeePopover" style={PopoverStyle} title="Payees">
						<ul className="custom-dropdown-list">
							{payeesPopoverItems}
						</ul>
					</Popover>
				</Overlay>
			</div>
		);
	}
}
