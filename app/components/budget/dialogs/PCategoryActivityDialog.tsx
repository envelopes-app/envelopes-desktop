/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, FormGroup, FormControl, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { DateWithoutTime } from '../../../utilities/';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PCategoryActivityDialogProps {
	entitiesCollection:IEntitiesCollection
	// Dispatcher Functions
	updateEntities:(entities:ISimpleEntitiesCollection)=>void;
}

export interface PCategoryActivityDialogState {
	show:boolean;
	target:HTMLElement;
	placement:string;
}

const PopoverStyle = {
	maxWidth: 'none',
	width:'300px'
}

const ButtonsContainerStyle = {
	display: "flex",
	flexFlow: "row nowrap",	
	width: "100%",
	justifyContent: "flex-end"
}

const CancelButtonStyle = {
	flex: "0 0 auto",
	fontSize:"14px"
}

const OkButtonStyle = {
	flex: "0 0 auto",
	fontSize:"14px",
	marginLeft: "10px"
}

export class PCategoryActivityDialog extends React.Component<PCategoryActivityDialogProps, PCategoryActivityDialogState> {

	constructor(props: any) {
        super(props);
		this.onChange = this.onChange.bind(this);
		this.onOkClick = this.onOkClick.bind(this);
		this.onCancelClick = this.onCancelClick.bind(this);
		this.state = {
			show:false, 
			target:null, 
			placement:"left" 
		};
	}

	public isShowing():boolean {
		return this.state.show;
	}

	private onChange(event:React.SyntheticEvent):void { 

	}

	private onOkClick():void { 

	}

	private onCancelClick():void { 
		// Hide the dialog
		this.hide();
	}
	
	public show(subCategoryId:string, month:DateWithoutTime, target:HTMLElement, placement:string = "left"):void {

		// Get the subCategory for the passed subCategoryId
		var subCategory = this.props.entitiesCollection.subCategories.getEntityById(subCategoryId);
		var monthlySubCategoryBudget = this.props.entitiesCollection.monthlySubCategoryBudgets.getMonthlySubCategoryBudgetsForSubCategoryInMonth(subCategoryId, month.toISOString());
		if(subCategory && monthlySubCategoryBudget) {

			var state = Object.assign({}, this.state) as PCategoryActivityDialogState;
			state.show = true;
			state.target = target;
			state.placement = placement;
			this.setState(state);
		}
	}

	public hide():void {
		var state = Object.assign({}, this.state) as PCategoryActivityDialogState;
		state.show = false;
		this.setState(state);
	}

	public render() {

		return (
			<Overlay show={this.state.show} placement={this.state.placement} 
				rootClose={true} onHide={this.onCancelClick} target={()=> ReactDOM.findDOMNode(this.state.target)}>
				<Popover id="categoryActivityDialog" style={PopoverStyle}>
					<div style={ButtonsContainerStyle}>
						<Button className="dialog-secondary-button" style={CancelButtonStyle} onClick={this.onCancelClick}>
							Cancel&nbsp;<Glyphicon glyph="remove-circle"/>
						</Button>
						<Button className="dialog-primary-button" style={OkButtonStyle} onClick={this.onOkClick}>
							OK&nbsp;<Glyphicon glyph="ok-circle"/>
						</Button>
					</div>
				</Popover>
			</Overlay>
		);
	}
}
