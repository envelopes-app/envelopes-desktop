/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { UIConstants } from '../../../constants';

export interface PSpendingInspectorProps {
}

export interface PSpendingInspectorState {

}

const InspectorContainerStyle:React.CSSProperties = {
	flex: "0 0 auto",
	height: "100%",
	width: UIConstants.ReportsInspectorWidth,
	borderColor: UIConstants.ReportsInspectorBorderColor,
	borderStyle: "solid",
	borderTopWidth: "0px",
	borderBottomWidth: "0px",
	borderRightWidth: "0px",
	borderLeftWidth: "1px",
	backgroundColor: UIConstants.ReportsInspectorBackgroundColor
}

export class PSpendingInspector extends React.Component<PSpendingInspectorProps, PSpendingInspectorState> {

	public render() {
		return <div style={InspectorContainerStyle} />;
	}
}