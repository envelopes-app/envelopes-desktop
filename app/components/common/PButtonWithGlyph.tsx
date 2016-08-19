/// <reference path="../../_includes.ts" />

import * as React from 'react';

export interface PButtonWithGlyphProps {
	text: string;
	glyphName: string;
	clickHandler: (event:React.MouseEvent)=>void;
}

const PButtonWithGlyphStyle = {
	color: '#fff',
	backgroundColor: '#216FB5',
	borderColor: '#ccc'
}

export class PButtonWithGlyph extends React.Component<PButtonWithGlyphProps, {}> {
  	render() {
		return (
			<button type="button" className="btn btn-default" style={PButtonWithGlyphStyle} aria-label="Left Align" onClick={this.props.clickHandler}>
				<span className={"glyphicon " + this.props.glyphName} aria-hidden="true"></span>
				&nbsp;{this.props.text}
			</button>
		);
  }
}