/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ColorPalette from '../common/ColorPalette';

export interface PAccountButtonContainerProps {
	identity: string,
	label: string,
	value: number
}

const PAccountButtonContainerStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',
	width: '100%',
	alignItems: 'center',
	cursor: 'pointer',
	backgroundColor: ColorPalette.Shade500
};

const PAccountButtonContainerButtonStyle = {
	flex: '1 1 auto',
	borderRadius: '0px',
	color: 'white',
	backgroundColor: ColorPalette.Shade500,
	borderColor: ColorPalette.Shade500,
	fontSize: '12px',
	textAlign: 'left',
	outline: 'none',
	boxShadow: 'none'
};

const PAccountButtonContainerValueStyle = {
	color: 'white',
	fontSize: '12px',
	fontWeight: 'normal', 
};

const PAccountButtonContainerValueWithBadgeStyle = {
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
		this.state = {expanded:true};
	}

	private handleClick() {

		var expanded = (this.state as any).expanded;
		this.setState({expanded:!expanded})
	}

  	public render() {

		var collapseContainerIdentity = "collapseContainer_" + this.props.identity;
		var glyphiconClass:string;
		var expanded = (this.state as any).expanded;
		if(expanded == true)
			glyphiconClass = "glyphicon glyphicon-triangle-bottom";
		else
			glyphiconClass = "glyphicon glyphicon-triangle-right";

		var valueNode;
		if(this.props.value < 0)
			valueNode = <span className="badge" style={PAccountButtonContainerValueWithBadgeStyle}>{this.props.value}</span>;
		else
			valueNode = <span style={PAccountButtonContainerValueStyle}>{this.props.value}</span>;

		return (
			<div>
				<div style={PAccountButtonContainerStyle}>
					<button 
						className="btn btn-primary btn-block" 
						style={PAccountButtonContainerButtonStyle}
						type="button" 
						data-toggle="collapse" 
						data-target={'#' + collapseContainerIdentity} 
						aria-expanded="true" 
						aria-controls={collapseContainerIdentity}
						onClick={this.handleClick}>

						<span className={glyphiconClass} aria-hidden="true"></span>
						&nbsp;{this.props.label}
					</button>
					{valueNode}
					<span style={{width:'8px'}} />
				</div>
				<div className="collapse in" id={collapseContainerIdentity}>
					{this.props.children}
				</div>
			</div>
		);
	}
}
