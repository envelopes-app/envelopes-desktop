/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PLinkButton } from '../../common/PLinkButton';

export interface PBudgetToolbarProps {
	expandAllMasterCategories:()=>void;
	collapseAllMasterCategories:()=>void;
	onAddCategoryGroupSelected:(element:HTMLElement)=>void;
}

const BudgetToolbarContainerStyle:React.CSSProperties = {
	flex: '0 0 auto',
	height: '35px',
	width: '100%',
	backgroundColor: '#ffffff',
	paddingLeft: '10px',
	paddingRight: '10px'
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
  
	private expandAllButton:PLinkButton;
	private collapseAllButton:PLinkButton;
	private addCategoryButton:PLinkButton;

	constructor(props: any) {
        super(props);
		this.onExpandAllButtonClick = this.onExpandAllButtonClick.bind(this);
		this.onCollapseAllButtonClick = this.onCollapseAllButtonClick.bind(this);
		this.onAddCategoryButtonClick = this.onAddCategoryButtonClick.bind(this);
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

	public render() {
    	return (
			<div style={BudgetToolbarContainerStyle}>
				<div style={BudgetToolbarStyle}>
					<PLinkButton 
						ref={(c)=>{this.expandAllButton = c;}}
						text="Expand All" glyphName="glyphicon-triangle-bottom" 
						clickHandler={this.onExpandAllButtonClick} />

					<PLinkButton 
						ref={(c)=>{this.collapseAllButton = c;}}
						text="Collapse All" glyphName="glyphicon-triangle-right" 
						clickHandler={this.onCollapseAllButtonClick} />

					<PLinkButton 
						ref={(c)=>{this.addCategoryButton = c;}}
						text="Add Category Group" glyphName="glyphicon-plus-sign" 
						clickHandler={this.onAddCategoryButtonClick} />
				</div>
			</div>
		);
  	}
}