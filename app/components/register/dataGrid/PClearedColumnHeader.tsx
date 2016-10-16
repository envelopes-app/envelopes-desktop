/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PClearedColumnHeaderProps {
	height?: number;
	width?: number;
	columnKey?:string;
}

const PClearedColumnHeaderStyle = {
	fontSize: '14px'
}

export class PClearedColumnHeader extends React.Component<PClearedColumnHeaderProps, {}> {

	public render() {

		var columnHeaderStyle = _.assign({}, PClearedColumnHeaderStyle, {lineHeight: this.props.height + 'px'});

    	return (
			<div className="register-header-cell" style={columnHeaderStyle}>
				<span className="glyphicon glyphicon-copyright-mark" aria-hidden="true"/>
			</div>
		);
  	}
}
