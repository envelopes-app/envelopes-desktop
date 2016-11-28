/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import { Glyphicon } from 'react-bootstrap';

export interface PLinkButtonProps {
	text?: string;
	glyphNames?: Array<string>;
	enabled?:boolean;
	tooltip?: string;
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

	constructor(props:PLinkButtonProps) {
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

		// Add the glyphs before the text if they are specified
		if(this.props.glyphNames) {
			_.forEach(this.props.glyphNames, (glyphName)=>{
				buttonContents.push(
					<span key={"button-glyph-" + glyphName} className={"glyphicon " + glyphName} aria-hidden="true"></span>
				);
			})
		}

		// Add the button text if it is specified
		if(this.props.text) {
			buttonContents.push(
				<text key="button-text" style={PLinkButtonTextStyle}>&nbsp;{this.props.text}&nbsp;</text>
			);
		}

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
				title={this.props.tooltip ? this.props.tooltip : null}
				ref={(d)=> this.rootElement = d }>
				{buttonContents}
			</div>
		);
  	}
}