/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon } from 'react-bootstrap';

import { IEntitiesCollection } from '../../../interfaces/state';
import * as budgetEntities from '../../../interfaces/budgetEntities';

export interface PRegisterStatusBarProps {
	accountId:string;
	isAllAccounts:boolean;
	entitiesCollection:IEntitiesCollection;
}

const DisabledColor = "#C3CBCE";
const EnabledColor = "#16A336";

const RegisterStatusBarContainerStyle:React.CSSProperties = {
	flex: '0 0 auto',
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "center",
	justifyContent: "flex-end",
	fontSize: "14px",
	height: "30px",
	width: "100%",
//	backgroundColor: "#E5F5F9",
	backgroundColor: '#003540',
	paddingLeft: '10px',
	paddingRight: '10px'
}

const EnabledStyle:React.CSSProperties = {
	color: EnabledColor
}

const DisabledStyle:React.CSSProperties = {
	color: DisabledColor
}

const RegisterStatusBarStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "center",
	backgroundColor: '#003540',
	padding: "8px",
	fontSize: "12px"
}


export class PRegisterStatusBar extends React.Component<PRegisterStatusBarProps, {}> {

	public render() {

		return (
			<div style={RegisterStatusBarContainerStyle}>
				<div style={EnabledStyle}><Glyphicon glyph="lock"/></div>
				<div style={DisabledStyle}><Glyphicon glyph="time"/></div>
			</div>
		);
	}
}