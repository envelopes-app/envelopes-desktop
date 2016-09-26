/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';

export interface PButtonWithGlyphProps {
	text?:string;
	glyphName:string;
	showGlyph?:boolean;
	clickHandler:(event:React.MouseEvent)=>void;
}

const PButtonWithGlyphStyle = {
	color: '#fff',
	backgroundColor: '#216FB5',
	borderColor: '#ccc'
}

const GlyphStyle = {
	opacity: "0.5",
	cursor: "pointer"
}

const GlyphHoverStyle = {
	opacity: "1",
	cursor: "pointer"
}

export class PButtonWithGlyph extends React.Component<PButtonWithGlyphProps, {hoverState:boolean}> {

	constructor(props: any) {
        super(props);
		this.handleClick = this.handleClick.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.state = {hoverState:false};
	}

	private handleClick(event:React.MouseEvent) {
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

		if(this.props.text) {
			return (
				<button type="button" className="btn btn-default" style={PButtonWithGlyphStyle} aria-label="Left Align" onClick={this.props.clickHandler}>
					<span className={"glyphicon " + this.props.glyphName} aria-hidden="true"></span>
					&nbsp;{this.props.text}
				</button>
			);
		}
		else {
			if(this.props.showGlyph) {
				return (
					<span className={"glyphicon " + this.props.glyphName} style={this.state.hoverState ? GlyphHoverStyle : GlyphStyle} aria-hidden="true"
						onClick={this.handleClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}
					/>
				);
			}
			else
				return <div />;
		}
  	}
}