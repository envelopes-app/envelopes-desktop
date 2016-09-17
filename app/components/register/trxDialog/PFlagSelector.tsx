/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormGroup, FormControl, Col, ControlLabel, Glyphicon, Overlay, Popover } from 'react-bootstrap';

import { TransactionFlag } from '../../../constants';

export interface PFlagSelectorProps { 
	selectedFlag?:string;
	handleTabPressed:(shiftPressed:boolean)=>void;
}

export interface PFlagSelectorState {
	showPopover:boolean;
	selectedFlag:string;
}

const PopoverStyle = {
	maxWidth: 'none', 
	width:'240px'
}

export class PFlagSelector extends React.Component<PFlagSelectorProps, PFlagSelectorState> {

	private flagInput:HTMLDivElement;
	private flagColors:Array<string> = ['None', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'];

	constructor(props:any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.setSelectedFlag = this.setSelectedFlag.bind(this);
		// If the passed selected flag is null, then set it to 'None'
		var selectedFlag = this.props.selectedFlag ? this.props.selectedFlag : 'None';
		this.state = {showPopover:false, selectedFlag:selectedFlag };	
	}

	public getSelectedFlag():string {
		return this.state.selectedFlag;
	}

	public showPopover():void {
		// If the popover is already showing then we dont need to do anything
		if(this.state.showPopover == false) {
			var state:any = _.assign({}, this.state);
			state.showPopover = true;
			this.setState(state);
		}
	}

	public hidePopover():void {
		// If the popover is already hidden then we dont need to do anything
		if(this.state.showPopover == true) {
			var state:any = _.assign({}, this.state);
			state.showPopover = false;
			this.setState(state);
		}
	}

	private onClick() {
		// If the popover is not already showing, then show it.
		this.showPopover();
	}

	private onKeyDown(event:KeyboardEvent):void {

		if(this.state.showPopover == true && event.keyCode == 38 || event.keyCode == 40) {

			// Get the currently selected flag color
			var currentFlagColor = this.state.selectedFlag;
			var index = _.indexOf(this.flagColors, currentFlagColor);

			// Up Arrow Key
			if(event.keyCode == 38) {
				// Decrement the index to get the previous color
				index--;
				// If we have gone below 0, go back to the last index
				if(index < 0)
					index = this.flagColors.length - 1;
			}
			// Down Arrow Key
			else if(event.keyCode == 40) {
				// Increment the index to get the next color
				index++;
				// If we have gone above the last index, go back to the first index
				if(index >= this.flagColors.length)
					index = 0;
			}

			// Get the color corresponding to the index and set it as the selected flag
			var newFlagColor = this.flagColors[index];
			var state:any = _.assign({}, this.state);
			state.selectedFlag = newFlagColor;
			this.setState(state);
		}
		// Escape Key
		else if(event.keyCode == 27) {
			// If the popover is showing, then hide it.
			if(this.state.showPopover == true) {
				var state:any = _.assign({}, this.state);
				state.showPopover = false;
				this.setState(state);
			}
		}
		// Tab Key
		else if(event.keyCode == 9) {
			// Prevent the default action from happening as we are manually handling it
			event.preventDefault();
			// Hide the popover
			this.hidePopover();
			// Let the parent dialog know that tab was pressed
			this.props.handleTabPressed(event.shiftKey);
		}
	}

	private setSelectedFlag(flag:string) {
		var state:any = _.assign({}, this.state);
		if(state.selectedFlag != flag) {
			// Update the selected flag in the state
			state.selectedFlag = flag;
			this.setState(state);
		}
		else {
			// Clear the flag
			state.selectedFlag = null;
			this.setState(state);
		}
	}

	private getListItem(flagColorName:string = 'None', selected:boolean = false) {

		var flagColor = TransactionFlag.getFlagColor[flagColorName];
		var flagTextColor = TransactionFlag.getFlagTextColor[flagColorName];
		if(selected) {
			return (
				<div key={flagColorName} className="flag-dropdown-list-item-selected" style={{backgroundColor:flagColor}} onClick={this.setSelectedFlag.bind(this, flagColorName)}>
					<button className="flag-dropdown-list-item-button" style={{backgroundColor:flagTextColor, borderColor:flagTextColor}}>{flagColorName}</button>
					<Glyphicon glyph="ok-circle" style={{color:'white'}}/>
				</div>
			);
		}
		else {
			return (
				<div key={flagColorName} className="flag-dropdown-list-item" style={{backgroundColor:flagColor}} onClick={this.setSelectedFlag.bind(this, flagColorName)}>
					<button className="flag-dropdown-list-item-button" style={{backgroundColor:flagTextColor, borderColor:flagTextColor}}>{flagColorName}</button>
				</div>
			);
		}
	}

	public render() {

		var flagColorName = this.state.selectedFlag ? this.state.selectedFlag : 'None';
		var flagColor = TransactionFlag.getFlagColor[flagColorName];
		var flagTextColor = TransactionFlag.getFlagTextColor[flagColorName];

		var flagPopoverItems = [
			this.getListItem("None", !this.state.selectedFlag || this.state.selectedFlag === 'None'),
			this.getListItem("Red", this.state.selectedFlag === 'Red'),
			this.getListItem("Orange", this.state.selectedFlag === 'Orange'),
			this.getListItem("Yellow", this.state.selectedFlag === 'Yellow'),
			this.getListItem("Green", this.state.selectedFlag === 'Green'),
			this.getListItem("Blue", this.state.selectedFlag === 'Blue'),
			this.getListItem("Purple", this.state.selectedFlag === 'Purple')
		];

		return (
			<FormGroup onKeyDown={this.onKeyDown}>
				<Col componentClass={ControlLabel} sm={3}>
					Flag
				</Col>
				<Col sm={9}>
					<FormControl ref={(n) => this.flagInput = n } type="text" componentClass="input" style={{backgroundColor:flagColor}} 
						contentEditable={false} readOnly={true} onClick={this.onClick} />
					<Overlay show={this.state.showPopover} placement="right" target={ ()=> ReactDOM.findDOMNode(this.flagInput) }>
						<Popover id="selectFlagPopover" style={PopoverStyle}>
							<ul className="flag-dropdown-list">
								{flagPopoverItems}
							</ul>
						</Popover>
					</Overlay>
				</Col>
			</FormGroup>
		);
	}
}
