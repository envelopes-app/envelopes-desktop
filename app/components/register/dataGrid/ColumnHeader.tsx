/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface ColumnHeaderProps {
	label: string;
	showSortIcon?:boolean;
	height?: number;
	width?: number;
	columnKey?:string;
}

const ColumnHeaderStyle = {
	display: 'block',
	backgroundColor: 'white',
	color: '#4C7079',
	fontSize: '11px',
	fontWeight: 'normal',
	width: '100%',
	height: '100%',
	textAlign: 'left',
	verticalAlign: 'middle',
	paddingLeft: '5px',
	paddingRight: '5px'
}

export class ColumnHeader extends React.Component<ColumnHeaderProps, {}> {

	public render() {

		var columnHeaderStyle = _.assign({}, ColumnHeaderStyle, {lineHeight: this.props.height + 'px'});
		// If we are currently sorting by this column, then set the fontWeight to bold 
		if(this.props.showSortIcon && this.props.showSortIcon == true)
			columnHeaderStyle["fontWeight"] = "bold";

    	return (
			<div style={columnHeaderStyle}>
				{this.props.label}
			</div>
		);
  	}
}
