/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PClearedColumnHeaderProps {
	height?: number;
	width?: number;
	columnKey?:string;
}

export class PClearedColumnHeader extends React.Component<PClearedColumnHeaderProps, {}> {

	public render() {

		var columnHeaderStyle = {lineHeight: this.props.height + 'px', fontSize: "14px"};

    	return (
			<div className="register-header-cell" style={columnHeaderStyle}>
				<span className="glyphicon glyphicon-copyright-mark" aria-hidden="true"/>
			</div>
		);
  	}
}
