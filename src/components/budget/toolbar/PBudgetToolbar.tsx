/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { UIConstants } from '../../../constants';
import { PLinkButton } from '../../common/PLinkButton';

export interface PBudgetToolbarProps {
	inspectorCollapsed:boolean;
	expandAllMasterCategories:()=>void;
	collapseAllMasterCategories:()=>void;
	setInspectorState:(collapsed:boolean)=>void;
	onAddCategoryGroupSelected:(element:HTMLElement)=>void;
	showReorderCategoriesDialog:()=>void;
}

const BudgetToolbarContainerStyle:React.CSSProperties = {
	flex: '0 0 auto',
	height: '35px',
	width: '100%',
	backgroundColor: '#ffffff',
	paddingLeft: '10px',
	paddingRight: '10px',
}

const BudgetToolbarStyle:React.CSSProperties = {
	flex: '1 1 auto',
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '100%',
	width: '100%',
}

export class PBudgetToolbar extends React.Component<PBudgetToolbarProps, {}> {
  
	private addCategoryButton:PLinkButton;

	constructor(props:PBudgetToolbarProps) {
        super(props);
		this.expandInspector = this.expandInspector.bind(this);
		this.collapseInspector = this.collapseInspector.bind(this);
		this.onExpandAllButtonClick = this.onExpandAllButtonClick.bind(this);
		this.onCollapseAllButtonClick = this.onCollapseAllButtonClick.bind(this);
		this.onAddCategoryButtonClick = this.onAddCategoryButtonClick.bind(this);
		this.onReorderCategoriesButtonClick = this.onReorderCategoriesButtonClick.bind(this);
	}

	private onExpandAllButtonClick(event:React.MouseEvent<any>):void {
		this.props.expandAllMasterCategories();
	}

	private onCollapseAllButtonClick(event:React.MouseEvent<any>):void {
		this.props.collapseAllMasterCategories();
	}

	private onAddCategoryButtonClick(event:React.MouseEvent<any>):void {

		var element = ReactDOM.findDOMNode(this.addCategoryButton) as HTMLElement;
		this.props.onAddCategoryGroupSelected(element);
	}

	private onReorderCategoriesButtonClick(event:React.MouseEvent<any>):void {
		this.props.showReorderCategoriesDialog();
	}

	private expandInspector():void {
		this.props.setInspectorState(false);
	}

	private collapseInspector():void {
		this.props.setInspectorState(true);
	}

	private getInspectorButton():JSX.Element {

		var inspectorbutton:JSX.Element;

		if(this.props.inspectorCollapsed) {

			inspectorbutton = (
				<PLinkButton 
					tooltip="Expand inspector" text="Expand Inspector" glyphNames={["glyphicon-chevron-left", "glyphicon-menu-hamburger"]} 
					enabled={true} clickHandler={this.expandInspector} />
			);
		}
		else {
			inspectorbutton = (
				<PLinkButton 
					tooltip="Collapse Inspector" text="Collapse Inspector" glyphNames={["glyphicon-menu-hamburger", "glyphicon-chevron-right"]} 
					enabled={true} clickHandler={this.collapseInspector} />
			);
		}

		return inspectorbutton;
	}

	public render() {

		var inspectorButton = this.getInspectorButton();

    	return (
			<div style={BudgetToolbarContainerStyle}>
				<div style={BudgetToolbarStyle}>
					<PLinkButton 
						tooltip="Expand all categories" glyphNames={["glyphicon-list", "glyphicon-arrow-down"]} 
						enabled={true} clickHandler={this.onExpandAllButtonClick} />

					<PLinkButton 
						tooltip="Collapse all categories" glyphNames={["glyphicon-list", "glyphicon-arrow-up"]} 
						enabled={true} clickHandler={this.onCollapseAllButtonClick} />

					<PLinkButton 
						ref={(c)=>{this.addCategoryButton = c;}}
						tooltip="Add Category Group" text="Add Category Group" glyphNames={["glyphicon-plus-sign"]} 
						enabled={true} clickHandler={this.onAddCategoryButtonClick} />

					<PLinkButton 
						tooltip="Reorder Categories" text="Reorder Categories" glyphNames={["glyphicon-retweet"]} 
						enabled={true} clickHandler={this.onReorderCategoriesButtonClick} />

					<div className="spacer" />
					{inspectorButton}
				</div>
			</div>
		);
  	}
}