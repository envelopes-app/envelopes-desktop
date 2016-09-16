/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PFlagColumnHeaderProps {
	height?: number;
	width?: number;
	columnKey?:string;
}

const PFlagColumnHeaderStyle = {
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

export class PFlagColumnHeader extends React.Component<PFlagColumnHeaderProps, {}> {

	public render() {

		var columnHeaderStyle = _.assign({}, PFlagColumnHeaderStyle, {lineHeight: this.props.height + 'px'});

    	return (
			<div style={columnHeaderStyle}>
				<span className="glyphicon glyphicon-flag" aria-hidden="true"/>
			</div>
		);
  	}
}
