/// <reference path="../../../_includes.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { UIConstants } from '../../../constants';
import { DataFormatter, DateWithoutTime } from '../../../utilities';
import { PLinkButton } from '../../common/PLinkButton';
import { IEntitiesCollection } from '../../../interfaces/state';

export interface PToolbarRowProps {
	dataFormatter:DataFormatter;
	currentMonth:DateWithoutTime;
	visibleMonths:number;
	entitiesCollection:IEntitiesCollection;

	expandAllMasterCategories:()=>void;
	collapseAllMasterCategories:()=>void;
	onAddCategoryGroupSelected:(element:HTMLElement)=>void;
	showReorderCategoriesDialog:()=>void;
	showCoverOverspendingDialog:(subCategoryId:string, month:DateWithoutTime, amountToCover:number, element:HTMLElement, placement?:string)=>void;
	showMoveMoneyDialog:(subCategoryId:string, month:DateWithoutTime, amountToMove:number, element:HTMLElement, placement?:string)=>void;
}

const BudgetToolbarContainerStyle:React.CSSProperties = {
	flex: '0 0 auto',
	height: '45px',
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

const MonthDataContainerStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '100%',
	width: UIConstants.MonthlyDataColumnsWidth,
	borderColor: UIConstants.MonthlyBudgetBorderColor,
	borderStyle: "solid",
	borderTopWidth: "0px",
	borderBottomWidth: "0px",
	borderRightWidth: "0px",
	borderLeftWidth: "5px",
}

const MonthNameContainerStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'column nowrap',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '100%',
	paddingLeft: "5px",
	paddingRight: "5px",
	color: UIConstants.BudgetHeaderTextColor,
}

const MonthStyle:React.CSSProperties = {
	fontSize: "16px",
	fontWeight: "normal",
	marginBottom: "0px"	
}

const YearStyle:React.CSSProperties = {
	fontSize: "12px",
	fontWeight: "normal",
	marginBottom: "0px"	
}

const ATBContainerStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'row nowrap',
	alignItems: 'center',
	justifyContent: 'center',
	width: '100%',
	paddingLeft: '5px',
	paddingRight: '5px'
}

const ATBSubContainerStyle:React.CSSProperties = {
	display: 'flex',
	flexFlow: 'row nowrap',
	alignItems: 'center',
	justifyContent: 'center',
	paddingLeft: '10px',
	paddingRight: '10px',
	borderRadius: '6px',
}

const ATBSubContainerPositiveStyle = Object.assign({}, ATBSubContainerStyle, {
	backgroundColor: UIConstants.PositiveATBColor,
});

const ATBSubContainerNegativeStyle = Object.assign({}, ATBSubContainerStyle, {
	backgroundColor: UIConstants.NegativeATBColor,
});

const ATBNumberStyle:React.CSSProperties = {
	color: '#FFFFFF',
	fontSize: '20px',
	fontWeight: 'normal',
	paddingTop: '0px',
	paddingBottom: '0px',
	marginBottom: '0px',
	border: 'none',
	backgroundColor: 'transparent',
	outline: 'none',
	cursor: 'inherit'
}

const ATBLabelStyle:React.CSSProperties = {
	color: '#FFFFFF',
	fontSize: '12px',
	fontWeight: 'normal',
	fontStyle: 'italic',
	paddingTop: '0px',
	paddingBottom: '0px',
	paddingLeft: '5px',
	marginBottom: '0px',
	cursor: 'inherit'
}

export class PToolbarRow extends React.Component<PToolbarRowProps, {}> {
  
	private addCategoryButton:PLinkButton;
	private atbContainer:HTMLSpanElement;

	constructor(props:PToolbarRowProps) {
        super(props);
		this.onExpandAllButtonClick = this.onExpandAllButtonClick.bind(this);
		this.onCollapseAllButtonClick = this.onCollapseAllButtonClick.bind(this);
		this.onAddCategoryButtonClick = this.onAddCategoryButtonClick.bind(this);
		this.onReorderCategoriesButtonClick = this.onReorderCategoriesButtonClick.bind(this);
		this.handleAvailableToBudgetClick = this.handleAvailableToBudgetClick.bind(this);
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

	private handleAvailableToBudgetClick():void {

		var currentMonth = this.props.currentMonth;
		var entitiesCollection = this.props.entitiesCollection;
		// Get the immediate income category
		var immediateIncomeSubCategory = entitiesCollection.subCategories.getImmediateIncomeSubCategory();
		// Get the availableToBudget value from the monthlyBudget entity
		var monthlyBudget = entitiesCollection.monthlyBudgets.getMonthlyBudgetByMonth(currentMonth.toISOString());
		var availableToBudget = monthlyBudget.availableToBudget;
		// If the ATB value is negative, we will show the cover overspending dialog. Otherwise show the
		// move money dialog.
		if(availableToBudget < 0)
			this.props.showCoverOverspendingDialog(immediateIncomeSubCategory.entityId, currentMonth, availableToBudget, this.atbContainer, "bottom");
		else if(availableToBudget > 0)
			this.props.showMoveMoneyDialog(immediateIncomeSubCategory.entityId, currentMonth, availableToBudget, this.atbContainer, "bottom");
	}

	public getMonthNameNodes():Array<JSX.Element> {

		var dataFormatter = this.props.dataFormatter;
		var monthlyBudgetsArray = this.props.entitiesCollection.monthlyBudgets;
		var currentMonth = this.props.currentMonth.clone().subtractMonths(this.props.visibleMonths - 1);
		var monthNameNodes:Array<JSX.Element> = [];
		while(currentMonth.isAfter(this.props.currentMonth) == false) {

			var availableToBudget = 0;
			var monthlyBudget = monthlyBudgetsArray.getMonthlyBudgetByMonth(currentMonth.toISOString());
			if(monthlyBudget) {

				var currentMonthAvailableToBudget = monthlyBudget.availableToBudget;
				var budgetedInFuture = monthlyBudgetsArray.getBudgetedInFutureForMonth(currentMonth);
				availableToBudget = currentMonthAvailableToBudget - budgetedInFuture;
			}

			// Choose the appropriate style based on whether the available to budget number is positive or negative
			var subContainerStyle = availableToBudget >= 0 ? ATBSubContainerPositiveStyle : ATBSubContainerNegativeStyle;
			// If the available to budget number is not equal to zero, we want to show either the cover overspeding
			// or the move money dialog. Add style to change the cursor to pointer.  
			if(availableToBudget != 0) {
				subContainerStyle = Object.assign({}, subContainerStyle, {
					cursor: "pointer"
				});
			}

			var monthNameNode = (
				<div key={currentMonth.toISOString()} style={MonthDataContainerStyle}>
					<div style={MonthNameContainerStyle}>
						<label style={MonthStyle}>{currentMonth.format("MMM")}</label>
						<label style={YearStyle}>{currentMonth.format("YYYY")}</label>
					</div>
					<div style={ATBContainerStyle}>
						<span style={subContainerStyle} ref={(d)=> this.atbContainer = d} onClick={this.handleAvailableToBudgetClick}>
							<label style={ATBNumberStyle}>{dataFormatter.formatCurrency(availableToBudget)}</label>
							<label style={ATBLabelStyle}>To be Budgeted</label>
						</span>
					</div>
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