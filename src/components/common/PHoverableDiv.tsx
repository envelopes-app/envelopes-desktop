/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PHoverableDivProps {
	enabled?:boolean;
	selected?:boolean;
	defaultStyle:React.CSSProperties;
	hoverStyle:React.CSSProperties;
	disabledStyle?:React.CSSProperties;
	selectedStyle?:React.CSSProperties;
	onClick:(event:React.MouseEvent<any>)=>void;
}

export interface PHoverableDivState {
	hoverState:boolean;
}

export class PHoverableDiv extends React.Component<PHoverableDivProps, PHoverableDivState> {

	private rootElement:HTMLDivElement;

	constructor(props:PHoverableDivProps) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.state = {
			hoverState: false
		}
	}

	private handleMouseEnter() {
		var state:any = Object.assign({}, this.state);
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {
		var state:any = Object.assign({}, this.state);
		state.hoverState = false;
		this.setState(state);
	}

	private handleClick(event:React.MouseEvent<any>):void {

		var enabled = this.props.enabled == false ? false : true;
		if(enabled && this.props.onClick)
			this.props.onClick(event);
	}

	public getRootElement():HTMLDivElement {
		return this.rootElement;
	}

	public render() {

		var enabled = this.props.enabled == false ? false : true;
		var selected = this.props.selected == true ? true : false;

		// Choose the appropriate style object for the component
		var styleObject:React.CSSProperties;;

		if(enabled == false)
			styleObject = this.props.disabledStyle;
		else if(selected == true)
			styleObject = this.props.selectedStyle;
		else if(this.state.hoverState == true)
			styleObject = this.props.hoverStyle;
		else
			styleObject = this.props.defaultStyle

		return (
			<div style={styleObject} 
				ref={(d)=> this.rootElement = d }
				onClick={this.handleClick}
				onMouseEnter={this.handleMouseEnter} 
				onMouseLeave={this.handleMouseLeave}>

				{this.props.children}
			</div>
		);
	}
}
