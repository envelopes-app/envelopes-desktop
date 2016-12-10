/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PLinkButton } from '../../common/PLinkButton';

export interface PBudgetToolbarProps {
	expandAllMasterCategories:()=>void;
	collapseAllMasterCategories:()=>void;
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
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '100%',
	width: '100%'
}

export class PBudgetToolbar extends React.Component<PBudgetToolbarProps, {}> {
  
	private reorderButton:PLinkButton;
	private expandAllButton:PLinkButton;
	private collapseAllButton:PLinkButton;
	private addCategoryButton:PLinkButton;

	constructor(props:PBudgetToolbarProps) {
        super(props);
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

	public render() {
    	return (
			<div style={BudgetToolbarContainerStyle}>
				<div style={BudgetToolbarStyle}>
					<PLinkButton 
						ref={(c)=>{this.expandAllButton = c;}}
						tooltip="Expand all categories" glyphNames={["glyphicon-list", "glyphicon-arrow-down"]} 
						enabled={true} clickHandler={this.onExpandAllButtonClick} />

					<PLinkButton 
						ref={(c)=>{this.collapseAllButton = c;}}
						tooltip="Collapse all categories" glyphNames={["glyphicon-list", "glyphicon-arrow-up"]} 
						enabled={true} clickHandler={this.onCollapseAllButtonClick} />

					<PLinkButton 
						ref={(c)=>{this.addCategoryButton = c;}}
						tooltip="Add Category Group" text="Add Category Group" glyphNames={["glyphicon-plus-sign"]} 
						enabled={true} clickHandler={this.onAddCategoryButtonClick} />

					<PLinkButton 
						ref={(c)=>{this.reorderButton = c;}}
						tooltip="Reorder Categories" text="Reorder Categories" glyphNames={["glyphicon-retweet"]} 
						enabled={true} clickHandler={this.onReorderCategoriesButtonClick} />
				</div>
			</div>
		);
  	}
}