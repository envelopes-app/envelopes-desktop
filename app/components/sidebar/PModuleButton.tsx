/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';

import ColorPalette from '../common/ColorPalette';

export interface PModuleButtonProps {
	label: string,
	selected: boolean;
	onClick?: ()=>void;
}

const ModuleButtonContainerStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',	
	height: '50px',
	borderRadius: '2px',
	top: '0px',
	paddingLeft: '16px', 
	alignItems: 'center',
	cursor: 'pointer',
	backgroundColor: ColorPalette.Shade500
};

const ModuleButtonLabelStyle = {

	position: 'relative',
	opacity: 1,
	fontSize: '18px',
	letterSpacing: '0px',
	fontWeight: 500, 
	margin: '0px', 
	paddingLeft: '8px', 
	paddingRight: '16px',
	color: 'rgb(255, 255, 255)'
};

export class PModuleButton extends React.Component<PModuleButtonProps, {}> {
  
	constructor(props: any) {
        super(props);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.state = {hoverState:false};
	}

	private handleMouseEnter() {
		this.setState({hoverState:true});
	}

	private handleMouseLeave() {
		this.setState({hoverState:false});
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
		var moduleButtonContainerStyle = _.assign({}, ModuleButtonContainerStyle, {backgroundColor: colorValue}); 

		return (
			<div style={moduleButtonContainerStyle} ref="moduleButtonContainer" 
				onClick={this.props.onClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				{this.props.children}
				<span style={ModuleButtonLabelStyle}>{this.props.label}</span>
			</div>
		);
  	}
}