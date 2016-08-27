/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface ClearedColumnHeaderProps {
	height?: number;
	width?: number;
	columnKey?:string;
}

const ClearedColumnHeaderStyle = {
	display: 'block',
	backgroundColor: 'white',
	color: '#4C7079',
	fontSize: '12px',
	fontWeight: 'normal',
	width: '100%',
	height: '100%',
	verticalAlign: 'middle',
	paddingLeft: '5px',
	paddingRight: '5px'
}

export class ClearedColumnHeader extends React.Component<ClearedColumnHeaderProps, {}> {

	public render() {

		var columnHeaderStyle = _.assign({}, ClearedColumnHeaderStyle, {lineHeight: this.props.height + 'px'});

    	return (
			<div style={columnHeaderStyle}>
				<span className="glyphicon glyphicon-copyright-mark" aria-hidden="true"/>
			</div>
		);
  	}
}
