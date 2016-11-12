/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DataFormatter } from '../../utilities';

export interface PAccountButtonContainerProps {
	identity: string;
	label: string;
	value?: number;
	expanded: boolean;
	dataFormatter: DataFormatter;
	setExpanded: (expanded:boolean)=>void;
}

const PAccountButtonContainerStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'row nowrap',
	width: '100%',
	alignItems: 'center',
	cursor: 'pointer'
};

const PAccountButtonContainerButtonStyle:React.CSSProperties = {
	flex: '1 1 auto',
	borderRadius: '0px',
	color: 'white',
	backgroundColor: "transparent",
	borderColor: "transparent",
	fontSize: '12px',
	textAlign: 'left',
	outline: 'none',
	boxShadow: 'none'
};

const PAccountButtonContainerValueStyle:React.CSSProperties = {
	color: 'white',
	fontSize: '12px',
	fontWeight: 'normal', 
};

const PAccountButtonContainerValueWithBadgeStyle:React.CSSProperties = {
	flex: '1 1 auto',
	color: '#D33C2D',
	fontSize: '12px',
	fontWeight: 'normal', 
	backgroundColor: 'white'
};

export class PAccountButtonContainer extends React.Component<PAccountButtonContainerProps, {}> {

	constructor(props: any) {
        super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	private handleClick() {
		// Flip the expanded state
		this.props.setExpanded( !this.props.expanded );
	}

  	public render() {

		var valueNode:JSX.Element;
		var glyphiconClass, containerClass:string;
		var collapseContainerIdentity = "collapseContainer_" + this.props.identity;

		if(this.props.expanded == true) {
			glyphiconClass = "glyphicon glyphicon-triangle-bottom";
			containerClass = "collapse in";
		}
		else {
			glyphiconClass = "glyphicon glyphicon-triangle-right";
			containerClass = "collapse";
		}

		var dataFormatter = this.props.dataFormatter;
		if(!this.props.value)
			valueNode = <span style={PAccountButtonContainerValueStyle} />;
		else if(this.props.value < 0)
			valueNode = <span className="badge" style={PAccountButtonContainerValueWithBadgeStyle}>{dataFormatter.formatCurrency(this.props.value)}</span>;
		else
			valueNode = <span style={PAccountButtonContainerValueStyle}>{dataFormatter.formatCurrency(this.props.value)}</span>;

		return (
			<div>
				<div style={PAccountButtonContainerStyle}>
					<button 
						className="btn btn-primary btn-block" 
						style={PAccountButtonContainerButtonStyle}
						type="button" 
						data-toggle="collapse" 
						data-target={'#' + collapseContainerIdentity} 
						onClick={this.handleClick}>

						<span className={glyphiconClass}></span>
						&nbsp;{this.props.label}
					</button>
					<div>
						{valueNode}
					</div>
					<span style={{width:'8px'}} />
				</div>
				<div className={containerClass} id={collapseContainerIdentity}>
					{this.props.children}
				</div>
				<hr className="sidebar-horizontal-rule" />
			</div>
		);
	}
}
