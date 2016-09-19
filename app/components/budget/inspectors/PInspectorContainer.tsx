/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PInspectorContainerProps {

}

const InspectorContainerStyle = {
	flex: '0 0 auto',
	minWidth: "260px",
	width: "260px",
	backgroundColor: "#E5F5F9",
	borderColor: "#DFE4E9",
	borderStyle: "solid",
	borderTopWidth: "1px",
	borderBottomWidth: "0px",
	borderRightWidth: "1px",
	borderLeftWidth: "0px",
	overflowY: "scroll"
}

export class PInspectorContainer extends React.Component<PInspectorContainerProps, {}> {

	public render() {
    	return (
			<div style={InspectorContainerStyle}>
			</div>
		);
  	}

}