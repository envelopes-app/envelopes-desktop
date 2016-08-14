import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';

import ColorPalette from '../common/ColorPalette';

export interface PSidebarHeaderProps {
	title: string;
}

const PSidebarHeaderStyle = {
	borderRadius: '0px',
	color: 'white',
	backgroundColor: ColorPalette.Shade500,
	borderColor: ColorPalette.Shade600,
	fontSize: '20px',
	textAlign: 'left',
	outline: 'none',
	boxShadow: 'none'
};

const PSidebarMenuItemStyle = {
	color: ColorPalette.Shade900
}

export class PSidebarHeader extends React.Component<PSidebarHeaderProps, {}> {
  
	public render() {

    	return (
			<div className="dropdown">
				<button type="button" 
						className="btn btn-default btn-lg btn-block" 
						style={PSidebarHeaderStyle} 
						data-toggle="dropdown" 
						aria-haspopup="true" 
						aria-expanded="false">
						
					{this.props.title} 
					&nbsp;<span className="caret"></span>
				</button>
				<ul className="dropdown-menu dropdown-menu-right">
					<li><a style={PSidebarMenuItemStyle}>Create a new budget</a></li>
					<li><a style={PSidebarMenuItemStyle}>Open a budget</a></li>
					<li role="separator" className="divider"></li>
					<li><a style={PSidebarMenuItemStyle}>Budget settings</a></li>
					<li><a style={PSidebarMenuItemStyle}>Make a fresh start</a></li>
					<li><a style={PSidebarMenuItemStyle}>Export budget data</a></li>
				</ul>  
			</div>
  		);
  	}
}