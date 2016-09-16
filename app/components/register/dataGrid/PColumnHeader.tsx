/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PColumnHeaderProps {
	label: string;
	showSortIcon?:boolean;
	height?: number;
	width?: number;
	columnKey?:string;
}

const PColumnHeaderStyle = {
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

export class PColumnHeader extends React.Component<PColumnHeaderProps, {}> {

	public render() {

		var columnHeaderStyle = _.assign({}, PColumnHeaderStyle, {lineHeight: this.props.height + 'px'});
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
