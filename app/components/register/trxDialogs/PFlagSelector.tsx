/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormGroup, Glyphicon, Overlay, Popover } from 'react-bootstrap';

export interface PFlagSelectorProps { 
	width: number;
	selectedFlag?:string;
	selectionChanged?:(flag:string)=>void;
}

const PopoverStyle = {
	maxWidth: 'none', 
	width:'200px'
}

export class PFlagSelector extends React.Component<PFlagSelectorProps, {showPopover:boolean, selectedFlag:string}> {

	private flagInput:Glyphicon;

	private flagColorMapping:any = {
		'None': '#E1E1E1',
		'Red': '#D43D2E',
		'Orange': '#FF7B00',
		'Yellow': '#F8E136',
		'Green': '#9AC234',
		'Blue': '#0082CB',
		'Purple': '#9384B7'
	}

	private flagTextColorMapping:any = {
		'Red': '#AA3125',
		'Orange': '#CC6200',
		'Yellow': '#C6B42B',
		'Green': '#7B9B29',
		'Blue': '#0068A2',
		'Purple': '#756992'
	}

	constructor(props: any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.setSelectedFlag = this.setSelectedFlag.bind(this);
		this.state = {showPopover:false, selectedFlag:this.props.selectedFlag};	
	}

	private onClick() {
		var state:any = _.assign({}, this.state);
		state.showPopover = true;
		this.setState(state);
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

	private getListItem(flagColorName:string, selected:boolean) {

		var flagColor = this.flagColorMapping[flagColorName];
		var flagTextColor = this.flagTextColorMapping[flagColorName];
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

		// Set the color for the flag glyph
		var flagColor:string = this.flagColorMapping['None'];
		if(this.state.selectedFlag != null)
			flagColor = this.flagColorMapping[this.state.selectedFlag];

		var flagPopoverItems = [
			this.getListItem("Red", this.state.selectedFlag === 'Red'),
			this.getListItem("Orange", this.state.selectedFlag === 'Orange'),
			this.getListItem("Yellow", this.state.selectedFlag === 'Yellow'),
			this.getListItem("Green", this.state.selectedFlag === 'Green'),
			this.getListItem("Blue", this.state.selectedFlag === 'Blue'),
			this.getListItem("Purple", this.state.selectedFlag === 'Purple')
		];

		return (
			<div>
				<FormGroup width={this.props.width}>
					<Glyphicon glyph="flag" ref={(n) => this.flagInput = n } style={{color:flagColor}} onClick={this.onClick}/>
				</FormGroup>
				<Overlay show={this.state.showPopover} placement="bottom" target={ ()=> ReactDOM.findDOMNode(this.flagInput) }>
					<Popover id="selectFlagPopover" style={PopoverStyle}>
						<ul className="flag-dropdown-list">
							{flagPopoverItems}
						</ul>
					</Popover>
				</Overlay>
			</div>
		);
	}
}
