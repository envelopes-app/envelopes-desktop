/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PInfoColumnHeaderProps {
	height?: number;
	width?: number;
	columnKey?:string;
}

export class PInfoColumnHeader extends React.Component<PInfoColumnHeaderProps, {}> {

	public render() {

		var columnHeaderStyle = {lineHeight: this.props.height + 'px', fontSize: "14px"};
    	return (
			<div className="register-header-cell" style={columnHeaderStyle}>
				<span className="glyphicon glyphicon-info-sign" aria-hidden="true"/>
			</div>
		);
  	}
}
