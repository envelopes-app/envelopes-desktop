/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import { Glyphicon } from 'react-bootstrap';

import { RegisterSortField, RegisterSortOrder } from '../../../constants';

export interface PColumnHeaderProps {
	label: string;
	showSortIcon?:boolean;
	sortOrder?:string;
	height?: number;
	width?: number;
	columnKey?:string;
}

const ColumnHeaderStyle = {
	width: "100%",
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: "space-between",
	alignItems: "center",
	paddingRight: "4px"
}

export class PColumnHeader extends React.Component<PColumnHeaderProps, {}> {

	constructor(props: any) {
        super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	private handleClick(event:React.MouseEvent):void {

	}

	public render() {

		var columnHeaderStyle = _.assign({}, ColumnHeaderStyle, {lineHeight: this.props.height + 'px'});

		if(this.props.showSortIcon == true) {

			// If we are currently sorting by this column, then set the fontWeight to bold 
			if(this.props.showSortIcon && this.props.showSortIcon == true)
				columnHeaderStyle["fontWeight"] = "bold";

			if(this.props.sortOrder == RegisterSortOrder.Ascending) {
				return (
					<div className="register-header-cell" style={columnHeaderStyle}>
						{this.props.label}
						<Glyphicon glyph="arrow-up" style={{top:"0px"}}/>
					</div>
				);
			}
			else {
				return (
					<div className="register-header-cell" style={columnHeaderStyle}>
						{this.props.label}
						<Glyphicon glyph="arrow-down" style={{top:"0px"}}/>
					</div>
				);
			}
		}
		else {

			// If we are not currently sorting by this column, then set cursor to pointer to indicate
			// that sorting can be applied. 
			columnHeaderStyle["cursor"] = "pointer";

			return (
				<div className="register-header-cell" style={columnHeaderStyle} onClick={this.handleClick}>
					{this.props.label}
				</div>
			);
		}
  	}
}
