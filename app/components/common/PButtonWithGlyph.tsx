/// <reference path="../../_includes.ts" />

import * as React from 'react';

import '../../styles/common/ButtonWithGlyph.css';

export interface PButtonWithGlyphProps {
	text: string;
	glyphName: string;
	clickHandler: (event:React.MouseEvent)=>void;
}

export class PButtonWithGlyph extends React.Component<PButtonWithGlyphProps, {}> {
  	render() {
		return (
			<button type="button" className="btn btn-default button-with-glyph" aria-label="Left Align" onClick={this.props.clickHandler}>
				<span className={"glyphicon " + this.props.glyphName} aria-hidden="true"></span>
				&nbsp;{this.props.text}
			</button>
		);
  }
}