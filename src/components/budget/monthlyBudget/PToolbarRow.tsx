/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { UIConstants } from '../../../constants';
import { DateWithoutTime } from '../../../utilities';
import { PLinkButton } from '../../common/PLinkButton';

export interface PToolbarRowProps {
	currentMonth:DateWithoutTime;
	visibleMonths:number;
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
	borderColor: UIConstants.MonthlyBudgetBorderColor,
	borderStyle: "solid",
	borderTopWidth: "0px",
	borderBottomWidth: "1px",
	borderRightWidth: "0px",
	borderLeftWidth: "0px",
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

const MonthNameStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'center',
	alignItems: 'center',
	height: '100%',
	width: UIConstants.MonthlyDataColumnsWidth,
	borderColor: UIConstants.MonthlyBudgetBorderColor,
	borderStyle: "solid",
	borderTopWidth: "0px",
	borderBottomWidth: "0px",
	borderRightWidth: "0px",
	borderLeftWidth: "5px",
	color: UIConstants.BudgetHeaderTextColor,
	fontSize: "14px",
	fontWeight: "bold"
}

export class PToolbarRow extends React.Component<PToolbarRowProps, {}> {
  
	private addCategoryButton:PLinkButton;

	constructor(props:PToolbarRowProps) {
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

	public getMonthNameNodes():Array<JSX.Element> {

		var currentMonth = this.props.currentMonth.clone().subtractMonths(this.props.visibleMonths - 1);
		var monthNameNodes:Array<JSX.Element> = [];
		while(currentMonth.isAfter(this.props.currentMonth) == false) {

			var monthNameNode = (
				<div key={currentMonth.toISOString()} style={MonthNameStyle}>
					{currentMonth.format("MMM YYYY")}
				</div>
			);

			monthNameNodes.push(monthNameNode);
			currentMonth = currentMonth.addMonths(1);
		}

		return monthNameNodes;
	}

	public render() {

		var monthNameNodes = this.getMonthNameNodes();

    	return (
			<div style={BudgetToolbarContainerStyle}>
				<div style={BudgetToolbarStyle}>
					<PLinkButton 
						tooltip="Reorder Categories" glyphNames={["glyphicon-retweet"]} 
						enabled={true} clickHandler={this.onReorderCategoriesButtonClick} />

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

					<div className="spacer" />
					{monthNameNodes}
				</div>
			</div>
		);
  	}
}