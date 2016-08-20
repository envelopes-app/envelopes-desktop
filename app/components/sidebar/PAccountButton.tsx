/// <reference path="../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';

import ColorPalette from '../common/ColorPalette';
import { IAccount } from '../../interfaces/budgetEntities';

const AccountButtonContainerStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',	
	height: '30px',
	top: '0px',
	paddingLeft: '16px', 
	alignItems: 'center',
	cursor: 'pointer',
	backgroundColor: ColorPalette.Shade500
};

const AccountButtonLabelStyle = {

	fontSize: '14px',
	fontWeight: 'normal', 
	margin: '0px', 
	paddingLeft: '8px', 
	color: 'white'
};

const GlyphStyle = {
	paddingLeft: '5px',
	color: 'white'
};

const AccountButtonValueStyle = {

	fontSize: '12px',
	fontWeight: 'normal', 
	textAlign: 'right',
	color: 'white'
};

const AccountButtonValueWithBadgeStyle = {

	fontSize: '12px',
	fontWeight: 'normal', 
	color: '#D33C2D',
	backgroundColor: 'white'
};

export interface PAccountButtonProps {
	account:IAccount;
	selected: boolean;
	editAccount?: (accountId:string)=>void;
	selectAccount?: (accountId:string)=>void;
}

export class PAccountButton extends React.Component<PAccountButtonProps, {}> {
  
	constructor(props: any) {
        super(props);
		this.handleClick = this.handleClick.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.handleGlyphClick = this.handleGlyphClick.bind(this);
		this.handleGlyphMouseEnter = this.handleGlyphMouseEnter.bind(this);
		this.handleGlyphMouseLeave = this.handleGlyphMouseLeave.bind(this);
		this.state = {hoverState:false, glyphHoverState:false};
	}

	private handleClick() {
		this.props.selectAccount(this.props.account.entityId);
	}

	private handleMouseEnter() {

		var state:any = _.assign({}, this.state);
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {

		var state:any = _.assign({}, this.state);
		state.hoverState = false;
		this.setState(state);
	}

	private handleGlyphClick() {
		this.props.editAccount(this.props.account.entityId);
	}

	private handleGlyphMouseEnter() {

		var state:any = _.assign({}, this.state);
		state.glyphHoverState = true;
		this.setState(state);
	}

	private handleGlyphMouseLeave() {

		var state:any = _.assign({}, this.state);
		state.glyphHoverState = false;
		this.setState(state);
	}

  	public render() {

		var hoverState = (this.state as any).hoverState;
		var glyphHoverState = (this.state as any).glyphHoverState;

		// Based on the hoverState, determine the backgroundColor value
		var backgroundColorValue:string = ColorPalette.Shade800;
		if(this.props.selected == false) {
			if(hoverState == true)
				backgroundColorValue = ColorPalette.Shade700;
			else
				backgroundColorValue = ColorPalette.Shade500;
		}

		// Create a clone of the style object, and update the backgroundColor value in it
		var accountButtonContainerStyle = _.assign({}, AccountButtonContainerStyle, {backgroundColor: backgroundColorValue}); 

		// Based on the hoverState and glyphHoverState, determine the opacity for the glyph
		var opacity:number = 0;
		if(hoverState == true) {
			if(glyphHoverState == true)
				opacity = 1;
			else
				opacity = 0.5;
		}

		// Create a clone of the style object, and update the opacity value in it
		var glyphStyle = _.assign({}, GlyphStyle, {opacity: opacity}); 

		var valueNode;
		var balanceValue = this.props.account.clearedBalance + this.props.account.unclearedBalance;
		if(balanceValue < 0)
			valueNode = <span className="badge" style={AccountButtonValueWithBadgeStyle}>{balanceValue}</span>;
		else
			valueNode = <span style={AccountButtonValueStyle}>{balanceValue}</span>;

		return (
			<div style={accountButtonContainerStyle} 
				onClick={this.handleClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<span style={AccountButtonLabelStyle}>{this.props.account.accountName}</span>
				<span className="glyphicon glyphicon-edit" style={glyphStyle} 
					onClick={this.handleGlyphClick} onMouseEnter={this.handleGlyphMouseEnter} onMouseLeave={this.handleGlyphMouseLeave} />
				<span style={{flex: '1 1 auto'}} />
				{valueNode}
				<span style={{width:'8px'}} />
			</div>
		);
  	}
}