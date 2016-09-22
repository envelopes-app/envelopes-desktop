/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PDefaultInspector } from './PDefaultInspector';

import { IEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PInspectorContainerProps {
	entitiesCollection:IEntitiesCollection;
	selectedSubCategories:Array<string>;
}

const InspectorContainerStyle = {
	flex: '0 0 auto',
	minWidth: "340px",
	width: "340px",
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

		var inspector:JSX.Element;

		if(this.props.selectedSubCategories.length == 0)
			inspector = <PDefaultInspector />;

    	return (
			<div style={InspectorContainerStyle}>
				{inspector}
			</div>
		);
  	}
}