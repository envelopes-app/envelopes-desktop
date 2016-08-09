/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';

import ColorPalette from '../common/ColorPalette';

export interface PAccountButtonProps {
	label: string,
	value: number,
	selected: boolean;
	onClick?: ()=>void;
}

const AccountButtonContainerStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',	
	height: '30px',
	top: '0px',
	paddingLeft: '16px', 
	alignItems: 'center',
	backgroundColor: ColorPalette.Shade500
};

const AccountButtonLabelStyle = {

	fontSize: '14px',
	fontWeight: 'normal', 
	margin: '0px', 
	paddingLeft: '8px', 
	color: 'white'
};

const AccountButtonValueStyle = {

	fontSize: '12px',
	fontWeight: 'normal', 
	textAlign: 'right',
	color: 'white'
};

const AccountButtonValueWithBadgeStyle = {

	fontSize: '12px',
	fontWeight: 'normal', 
	color: '#D33C2D',
	backgroundColor: 'white'
};

export class PAccountButton extends React.Component<PAccountButtonProps, {}> {
  
	constructor(props: any) {
        super(props);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.state = {hoverState:false};
	}

	private handleMouseEnter() {
		// We only want to show hover state if we are not selected
		if(this.props.selected == false) {
			this.setState({hoverState:true});
		}
	}

	private handleMouseLeave() {
		// We only want to show hover state if we are not selected
		if(this.props.selected == false) {
			this.setState({hoverState:false});
		}
	}

  	public render() {
		var colorValue:string;
		if(this.props.selected == true)
			colorValue = ColorPalette.Shade800;
		else {
			var hoverState = (this.state as any).hoverState;
			if(hoverState == true)
				colorValue = ColorPalette.Shade700;
			else
				colorValue = ColorPalette.Shade500;
		}

		// Create a clone of the style object, and update the backgroundColor value in it
		var moduleButtonContainerStyle = _.assign({}, AccountButtonContainerStyle, {backgroundColor: colorValue}); 

		var valueNode;
		if(this.props.value < 0)
			valueNode = <span className="badge" style={AccountButtonValueWithBadgeStyle}>{this.props.value}</span>;
		else
			valueNode = <span style={AccountButtonValueStyle}>{this.props.value}</span>;

		return (
			<div style={moduleButtonContainerStyle} ref="moduleButtonContainer" 
				onClick={this.props.onClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<span style={AccountButtonLabelStyle}>{this.props.label}</span>
				<span className="glyphicon glyphicon-edit" style={{paddingLeft: '5px', color:'white'}}/>
				<span style={{flex: '1 1 auto'}} />
				{valueNode}
				<span style={{width:'8px'}} />
			</div>
		);
  	}
}