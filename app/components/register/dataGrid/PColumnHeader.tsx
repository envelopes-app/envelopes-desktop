/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';

export interface PColumnHeaderProps {
	label: string;
	showSortIcon?:boolean;
	height?: number;
	width?: number;
	columnKey?:string;
}

export class PColumnHeader extends React.Component<PColumnHeaderProps, {}> {

	public render() {

		var columnHeaderStyle = _.assign({}, {lineHeight: this.props.height + 'px'});
		// If we are currently sorting by this column, then set the fontWeight to bold 
		if(this.props.showSortIcon && this.props.showSortIcon == true)
			columnHeaderStyle["fontWeight"] = "bold";

    	return (
			<div className="register-header-cell" style={columnHeaderStyle}>
				{this.props.label}
			</div>
		);
  	}
}
