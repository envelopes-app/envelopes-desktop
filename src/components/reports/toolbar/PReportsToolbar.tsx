/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { UIConstants } from '../../../constants';
import { IEntitiesCollection } from '../../../interfaces/state';

export interface PReportsToolbarProps {
	selectedReport:string;
	entitiesCollection:IEntitiesCollection;
}

const ReportsToolbarContainerStyle:React.CSSProperties = {
	flex: '0 0 auto',
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'space-between',
	alignItems: 'center',
	height: '45px',
	width: '100%',
	backgroundColor: "#FFFFFF",
	paddingLeft: '5px',
	paddingRight: '5px',
	borderStyle: "solid",
	borderColor: UIConstants.BorderColor,
	borderWidth: "0px",
	borderBottomWidth: "1px",
}

export class PReportsToolbar extends React.Component<PReportsToolbarProps, {}> {

	public render() {
		return <div style={ReportsToolbarContainerStyle} />;
	}
}