/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';

export interface PModuleButtonProps {
	label: string,
	selected: boolean;
	onClick?: ()=>void;
}

const ModuleButtonContainerStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'row nowrap',	
	height: '70px',
	top: '0px',
	paddingLeft: '16px', 
	alignItems: 'center',
	cursor: 'pointer',
	backgroundColor: "transparent"
};

const ModuleButtonLabelStyle:React.CSSProperties = {

	position: 'relative',
	opacity: 1,
	fontSize: '20px',
	letterSpacing: '0px',
	fontWeight: 'normal', 
	margin: '0px', 
	paddingLeft: '8px', 
	paddingRight: '16px',
	color: 'rgb(255, 255, 255)'
};

export class PModuleButton extends React.Component<PModuleButtonProps, {hoverState:boolean}> {
  
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

		var moduleButtonContainerStyle = Object.assign({}, ModuleButtonContainerStyle);

		var colorValue:string;
		if(this.props.selected == true)
			moduleButtonContainerStyle["backgroundColor"] = "#00596F";
		else {
			var hoverState = (this.state as any).hoverState;
			if(hoverState == true)
				moduleButtonContainerStyle["backgroundColor"] = "#1D879B";
		}

		return (
			<div style={moduleButtonContainerStyle} ref="moduleButtonContainer" 
				onClick={this.props.onClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				{this.props.children}
				<span style={ModuleButtonLabelStyle}>{this.props.label}</span>
			</div>
		);
  	}
}