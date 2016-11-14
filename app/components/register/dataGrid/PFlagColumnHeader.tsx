/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PFlagColumnHeaderProps {
	height?: number;
	width?: number;
	columnKey?:string;
}

const PFlagColumnHeaderStyle:React.CSSProperties = {
	fontSize: '14px'
}

export class PFlagColumnHeader extends React.Component<PFlagColumnHeaderProps, {}> {

	public render() {

		var columnHeaderStyle = Object.assign({}, PFlagColumnHeaderStyle, {lineHeight: this.props.height + 'px'});

    	return (
			<div className="register-header-cell" style={columnHeaderStyle}>
				<span className="glyphicon glyphicon-flag" aria-hidden="true"/>
			</div>
		);
  	}
}
