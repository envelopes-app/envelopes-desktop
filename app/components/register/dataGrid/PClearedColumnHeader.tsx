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
	display: 'block',
	backgroundColor: 'white',
	color: '#4C7079',
	fontSize: '14px',
	fontWeight: 'normal',
	width: '100%',
	height: '100%',
	verticalAlign: 'middle',
	paddingLeft: '5px',
	paddingRight: '5px'
}

export class PClearedColumnHeader extends React.Component<PClearedColumnHeaderProps, {}> {

	public render() {

		var columnHeaderStyle = _.assign({}, PClearedColumnHeaderStyle, {lineHeight: this.props.height + 'px'});

    	return (
			<div style={columnHeaderStyle}>
				<span className="glyphicon glyphicon-copyright-mark" aria-hidden="true"/>
			</div>
		);
  	}
}
