/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface SelectionColumnHeaderProps {
	height?: number;
	width?: number;
	columnKey?:string;
}

const SelectionColumnHeaderStyle = {
	display: 'block',
	backgroundColor: 'white',
	color: '#4C7079',
	fontSize: '12px',
	fontWeight: 'normal',
	width: '100%',
	height: '100%',
	textAlign: 'left',
	verticalAlign: 'middle',
	paddingLeft: '5px',
	paddingRight: '5px'
}

export class SelectionColumnHeader extends React.Component<SelectionColumnHeaderProps, {}> {

	public render() {

		var columnHeaderStyle = _.assign({}, SelectionColumnHeaderStyle, {lineHeight: this.props.height + 'px'});

    	return (
			<div style={columnHeaderStyle}>
				<input type='checkbox' />
			</div>
		);
  	}
}
