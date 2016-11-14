/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import { Glyphicon } from 'react-bootstrap';

import { RegisterSortField, RegisterSortOrder } from '../../../constants';

export interface PColumnHeaderProps {
	label: string;
	fieldName:string;
	sortByField:string;
	sortOrder:string;
	height?: number;
	width?: number;
	columnKey?:string;

	setRegisterSort:(sortByFields:Array<string>, sortOrders:Array<string>)=>void;
}

const ColumnHeaderStyle:React.CSSProperties = {
	width: "100%",
	display: "flex",
	flexFlow: "row nowrap",
	justifyContent: "space-between",
	alignItems: "center",
	paddingRight: "4px",
	cursor: "pointer"
}

export class PColumnHeader extends React.Component<PColumnHeaderProps, {}> {

	constructor(props: any) {
        super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	private handleClick(event:React.MouseEvent<any>):void {

		// If we are already sorted by this field, then simply flip the sort order
		if(this.props.fieldName == this.props.sortByField) {

			if(this.props.sortOrder == RegisterSortOrder.Descending)
				this.props.setRegisterSort([this.props.sortByField], [RegisterSortOrder.Ascending]);
			else
				this.props.setRegisterSort([this.props.sortByField], [RegisterSortOrder.Descending]);
		}
		else {
			// Set the sort to this field, with order set to descending
			this.props.setRegisterSort([this.props.fieldName], [RegisterSortOrder.Descending]);
		}
	}

	public render() {

		var columnHeaderStyle = Object.assign({}, ColumnHeaderStyle, {lineHeight: this.props.height + 'px'});

		if(this.props.fieldName == this.props.sortByField) {

			// We are currently sorting by this column, so set the fontWeight to bold 
			columnHeaderStyle["fontWeight"] = "bold";

			if(this.props.sortOrder == RegisterSortOrder.Ascending) {
				return (
					<div className="register-header-cell" style={columnHeaderStyle} onClick={this.handleClick}>
						{this.props.label}
						<Glyphicon glyph="arrow-up" style={{top:"0px"}}/>
					</div>
				);
			}
			else {
				return (
					<div className="register-header-cell" style={columnHeaderStyle} onClick={this.handleClick}>
						{this.props.label}
						<Glyphicon glyph="arrow-down" style={{top:"0px"}}/>
					</div>
				);
			}
		}
		else {
			return (
				<div className="register-header-cell" style={columnHeaderStyle} onClick={this.handleClick}>
					{this.props.label}
				</div>
			);
		}
  	}
}
