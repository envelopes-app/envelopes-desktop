/// <reference path="../../_includes.ts" />

import * as React from 'react';

var FileDrop = require("react-file-drop");

export interface PFileDropContainerProps {
	handleFileDragOver?:(event:React.SyntheticEvent<any>)=>void;
	handleFileDrop:(files:FileList, event:React.SyntheticEvent<any>)=>void;
}

const FileDropStyle:React.CSSProperties = {
	borderColor: "#000000",
	borderWidth: "1px",
	borderStyle: "dashed",
	paddingTop: "10px",
	paddingLeft: "10px",
	paddingRight: "10px",
}

export class PFileDropContainer extends React.Component<PFileDropContainerProps, {}> {

	public render() {

		return (
			<div style={FileDropStyle}>
				<FileDrop frame={document} targetAlwaysVisible={true} onDragOver={this.props.handleFileDragOver} onDrop={this.props.handleFileDrop}>
					{this.props.children}
				</FileDrop>
			</div>
		);
	}
}
