/// <reference path="../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';

export interface PButtonWithGlyphProps {
	text?:string;
	glyphName:string;
	showGlyph?:boolean;
	glyphColor?:string;
	clickHandler:(event:React.MouseEvent)=>void;
}

const PButtonWithGlyphStyle = {
	color: '#FFFFFF',
	backgroundColor: '#216FB5',
	borderColor: '#CCCCCC'
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
		event.stopPropagation();
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
			// When we are showing text on the button, the glyph is always visible
			return (
				<button type="button" className="btn btn-default" style={PButtonWithGlyphStyle} aria-label="Left Align" onClick={this.props.clickHandler}>
					<span className={"glyphicon " + this.props.glyphName} aria-hidden="true"></span>
					&nbsp;{this.props.text}
				</button>
			);
		}
		else {
			// Otherwise we use the showGlyph property to determine if it is to be shown or not
			if(this.props.showGlyph) {
				var glyphStyle = this.state.hoverState ? GlyphHoverStyle : GlyphStyle;

				if(this.props.glyphColor)
					glyphStyle = Object.assign({}, glyphStyle, {color:this.props.glyphColor});

				return (
					<span className={"glyphicon " + this.props.glyphName} style={glyphStyle} aria-hidden="true"
						onClick={this.handleClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}
					/>
				);
			}
			else
				return <div />;
		}
  	}
}