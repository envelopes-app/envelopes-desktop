/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Glyphicon } from 'react-bootstrap';

import { PHoverableDiv } from '../../common/PHoverableDiv';
import { PAccountSelectionDialog } from './PAccountSelectionDialog';
import { PCategorySelectionDialog } from './PCategorySelectionDialog';
import { PTimeframeSelectionDialog } from './PTimeframeSelectionDialog';

import { UIConstants } from '../../../constants';
import { IEntitiesCollection } from '../../../interfaces/state';

export interface PReportsToolbarProps {
	selectedReport:string;
	entitiesCollection:IEntitiesCollection;
}

const ReportsToolbarContainerStyle:React.CSSProperties = {
	flex: '0 0 auto',
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '45px',
	width: '100%',
	backgroundColor: "#FFFFFF",
	paddingLeft: '20px',
	paddingRight: '20px',
	borderStyle: "solid",
	borderColor: UIConstants.BorderColor,
	borderWidth: "0px",
	borderBottomWidth: "1px",
}

const ButtonDefaultStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: 'center',
	fontSize: "16px",
	fontWeight: "normal",
	color: "#009cc2",
	marginRight: "20px",
	cursor: "pointer"
}

const ButtonHoverStyle = Object.assign({}, ButtonDefaultStyle, {
	color: "#005076"
});

const GlyphStyle:React.CSSProperties = {
	fontSize: "12px"
}
export class PReportsToolbar extends React.Component<PReportsToolbarProps, {}> {

	private accountsSelectionButton:PHoverableDiv;
	private categoriesSelectionButton:PHoverableDiv;
	private timeframeSelectionButton:PHoverableDiv;

	private accountSelectionDialog:PAccountSelectionDialog;
	private categorySelectionDialog:PCategorySelectionDialog;
	private timeframeSelectionDialog:PTimeframeSelectionDialog;

	constructor(props:PReportsToolbarProps) {
		super(props);
		this.handleCategorySelectionButtonClicked = this.handleCategorySelectionButtonClicked.bind(this);
		this.handleTimeframeSelectionButtonClicked = this.handleTimeframeSelectionButtonClicked.bind(this);
		this.handleAccountSelectionButtonClicked = this.handleAccountSelectionButtonClicked.bind(this);
	}

	private handleCategorySelectionButtonClicked(event:React.MouseEvent<any>):void {

		if(this.categorySelectionDialog.isShowing() == false)
			this.categorySelectionDialog.show(this.categoriesSelectionButton.getRootElement(), "bottom");
	}

	private handleTimeframeSelectionButtonClicked(event:React.MouseEvent<any>):void {

		if(this.timeframeSelectionDialog.isShowing() == false)
			this.timeframeSelectionDialog.show(this.timeframeSelectionButton.getRootElement(), "bottom");
	}

	private handleAccountSelectionButtonClicked(event:React.MouseEvent<any>):void {

		if(this.accountSelectionDialog.isShowing() == false)
			this.accountSelectionDialog.show(this.accountsSelectionButton.getRootElement(), "bottom");
	}
	
	public render() {
		
		return (
			<div style={ReportsToolbarContainerStyle}>

				<PHoverableDiv ref={(b)=> this.categoriesSelectionButton = b }
					defaultStyle={ButtonDefaultStyle} 
					hoverStyle={ButtonHoverStyle} 
					onClick={this.handleCategorySelectionButtonClicked}>
					All Categories&nbsp;
					<Glyphicon glyph="triangle-bottom" style={GlyphStyle} />
				</PHoverableDiv> 

				<PHoverableDiv ref={(b)=> this.timeframeSelectionButton = b }
					defaultStyle={ButtonDefaultStyle} 
					hoverStyle={ButtonHoverStyle} 
					onClick={this.handleTimeframeSelectionButtonClicked}>
					Dec 2015 - Dec 2016&nbsp;
					<Glyphicon glyph="triangle-bottom" style={GlyphStyle} />
				</PHoverableDiv> 

				<PHoverableDiv ref={(b)=> this.accountsSelectionButton = b }
					defaultStyle={ButtonDefaultStyle} 
					hoverStyle={ButtonHoverStyle} 
					onClick={this.handleAccountSelectionButtonClicked}>
					All Accounts&nbsp;
					<Glyphicon glyph="triangle-bottom" style={GlyphStyle} />
				</PHoverableDiv> 

				<PCategorySelectionDialog 
					ref={(d)=> this.categorySelectionDialog = d }
					entitiesCollection={this.props.entitiesCollection}
				/>

				<PAccountSelectionDialog 
					ref={(d)=> this.accountSelectionDialog = d }
					entitiesCollection={this.props.entitiesCollection}
				/>

				<PTimeframeSelectionDialog 
					ref={(d)=> this.timeframeSelectionDialog = d }
					entitiesCollection={this.props.entitiesCollection}
				/>
			</div>
		);
	}
}