/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';

export interface PLinkButtonProps {
	text: string;
	glyphName?: string;
	enabled?:boolean;
	clickHandler?: (event:React.MouseEvent)=>void;
}

const PLinkButtonCommonStyle = {
	cursor: 'pointer',
	paddingLeft: '5px',
	paddingRight: '5px'
}

const PLinkButtonDefaultStyle = {
	color: '#009cc2'
}

const PLinkButtonHoverStyle = {
	color: '#005076'
}

const PLinkButtonTextStyle = {
	fontSize: '13px',
	fontWeight: 'normal'
}

export class PLinkButton extends React.Component<PLinkButtonProps, {hoverState:boolean}> {

	constructor(props: any) {
        super(props);
		this.onClick = this.onClick.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.state = {hoverState:false};
	}

	private onClick(event:React.MouseEvent):void {

		if(this.props.enabled == undefined || this.props.enabled == null || this.props.enabled == true)
			this.props.clickHandler(event);
	}

	private handleMouseEnter() {

		var state:any = _.assign({}, this.state);
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {

		var state:any = _.assign({}, this.state);
		state.hoverState = false;
		this.setState(state);
	}

  	public render() {

		var style:any;
		if(this.state.hoverState) 
			style = _.assign({}, PLinkButtonCommonStyle, PLinkButtonHoverStyle);
		else
			style = _.assign({}, PLinkButtonCommonStyle, PLinkButtonDefaultStyle);

		if(this.props.glyphName) {
			return (
				<div style={style} onClick={this.onClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
					<span className={"glyphicon " + this.props.glyphName} aria-hidden="true"></span>
					<text style={PLinkButtonTextStyle}>&nbsp;{this.props.text}</text>
				</div>
			);
		}
		else {
			return (
				<div style={style} onClick={this.onClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
					<text style={PLinkButtonTextStyle}>&nbsp;{this.props.text}</text>
				</div>
			);
		}
  	}
}