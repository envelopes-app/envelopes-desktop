/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import { Glyphicon } from 'react-bootstrap';

export interface PLinkButtonProps {
	text: string;
	glyphName?: string;
	enabled?:boolean;
	clickHandler?: (event:React.MouseEvent<any>)=>void;
	showDropDown?:boolean;
}

const PLinkButtonCommonStyle:React.CSSProperties = {
	cursor: 'pointer',
	paddingLeft: '5px',
	paddingRight: '5px'
}

const PLinkButtonDefaultStyle:React.CSSProperties = {
	color: '#009cc2'
}

const PLinkButtonDisabledStyle:React.CSSProperties = {
	color: '#009cc2',
	opacity: 0.5
}

const PLinkButtonHoverStyle:React.CSSProperties = {
	color: '#005076'
}

const PLinkButtonTextStyle:React.CSSProperties = {
	fontSize: '14px',
	fontWeight: 'normal'
}

export class PLinkButton extends React.Component<PLinkButtonProps, {hoverState:boolean}> {

	private rootElement:HTMLDivElement;

	constructor(props: any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.state = {hoverState:false};
	}

	public getRootElement():HTMLDivElement {
		return this.rootElement;
	}

	private onClick(event:React.MouseEvent<any>):void {

		if(this.props.enabled == undefined || this.props.enabled == null || this.props.enabled == true)
			this.props.clickHandler(event);
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

  	public render() {

		var style:any;
		if(this.props.enabled == false)
			style = Object.assign({}, PLinkButtonCommonStyle, PLinkButtonDisabledStyle);
		else if(this.state.hoverState) 
			style = Object.assign({}, PLinkButtonCommonStyle, PLinkButtonHoverStyle);
		else
			style = Object.assign({}, PLinkButtonCommonStyle, PLinkButtonDefaultStyle);

		var buttonContents:Array<JSX.Element> = [];

		// Add the glyph before the text if one is specified
		if(this.props.glyphName) {
			buttonContents.push(
				<span key="button-glyph" className={"glyphicon " + this.props.glyphName} aria-hidden="true"></span>
			);
		}

		// Add the button text
		buttonContents.push(
			<text key="button-text" style={PLinkButtonTextStyle}>&nbsp;{this.props.text}&nbsp;</text>
		);

		// Add the dropdown glyph at the end 
		if(this.props.showDropDown == true) {
			buttonContents.push(
				<span key="dropdown-glyph" className="glyphicon glyphicon-triangle-bottom" style={{fontSize:"10px"}} aria-hidden="true"></span>
			);
		}

		return (
			<div style={style} onClick={this.onClick} 
				onMouseEnter={this.handleMouseEnter} 
				onMouseLeave={this.handleMouseLeave}
				ref={(d)=> this.rootElement = d }>
				{buttonContents}
			</div>
		);
  	}
}