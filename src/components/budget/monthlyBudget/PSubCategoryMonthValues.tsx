/// <reference path="../../../_includes.ts" />

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PButtonWithGlyph } from '../../common/PButtonWithGlyph';
import { PSubCategoryBudgetedValue } from './PSubCategoryBudgetedValue';
import { PSubCategoryActivityValue } from './PSubCategoryActivityValue';
import { PSubCategoryBalanceValue } from './PSubCategoryBalanceValue';
import { InternalCategories } from '../../../constants';
import { DataFormatter, DateWithoutTime, SimpleObjectMap, Logger } from '../../../utilities';
import * as budgetEntities from '../../../interfaces/budgetEntities';
import { IEntitiesCollection, ISimpleEntitiesCollection } from '../../../interfaces/state';

export interface PSubCategoryMonthValuesProps {
	dataFormatter:DataFormatter;
	containerHeight:number;
	containerWidth:number;
	currentMonth:DateWithoutTime;
	subCategory:budgetEntities.ISubCategory;
	editingSubCategoryId:string;
	editingSubCategoryMonth:DateWithoutTime;
	isSelected:boolean;
	// MonthlySubCategoryBudget entities mapped by month and subCategoryId
	monthlySubCategoryBudgetsMap:SimpleObjectMap<budgetEntities.IMonthlySubCategoryBudget>;

	setBudgetedAmountForCategory:(subCategoryId:string, month:DateWithoutTime, budgetedValue:number)=>void;
	selectSubCategory:(subCategory:budgetEntities.ISubCategory, month:DateWithoutTime, unselectAllOthers:boolean, setAsEditing:boolean)=>void;
	selectSubCategoryForEditing:(subCategory:budgetEntities.ISubCategory, month:DateWithoutTime)=>void;
	selectNextSubCategoryForEditing:()=>void;
	selectPreviousSubCategoryForEditing:()=>void;
	showCoverOverspendingDialog:(subCategoryId:string, month:DateWithoutTime, amountToCover:number, element:HTMLElement, placement?:string)=>void;
	showMoveMoneyDialog:(subCategoryId:string, month:DateWithoutTime, amountToMove:number, element:HTMLElement, placement?:string)=>void;
	showDefaultSubCategoryActivityDialog:(subCategoryId:string, month:DateWithoutTime, element:HTMLElement, placement?:string)=>void;
	showDebtSubCategoryActivityDialog:(subCategoryId:string, month:DateWithoutTime, element:HTMLElement, placement?:string)=>void;
}

export interface PSubCategoryMonthValuesState {
	hoverState:boolean;
}

const ValuesContainerStyle:React.CSSProperties = {
	display: "flex",
	flexFlow: "row nowrap",
	alignItems: "center",
	height: "100%"
}

export class PSubCategoryMonthValues extends React.Component<PSubCategoryMonthValuesProps, PSubCategoryMonthValuesState> {

	private budgetedValue:PSubCategoryBudgetedValue;
	private activityValue:PSubCategoryActivityValue;
	private balanceValue:PSubCategoryBalanceValue;

	constructor(props:PSubCategoryMonthValuesProps) {
        super(props);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.onBalanceValueClick = this.onBalanceValueClick.bind(this);
		this.state = {
			hoverState:false
		};
	}

	private handleMouseEnter() {
		var state = Object.assign({}, this.state) as PSubCategoryMonthValuesState;
		state.hoverState = true;
		this.setState(state);
	}

	private handleMouseLeave() {

		var state = Object.assign({}, this.state) as PSubCategoryMonthValuesState;
		state.hoverState = false;
		this.setState(state);
	}

	private onKeyDown(event:React.KeyboardEvent<any>):void {

		// We want the user to move the selection up and down the budget screen using the arrow
		// keys, and also the tab/shift-tab combination.
		// Also the escape key can be used to cancel the editing state.
		if(event.keyCode == 38) {
			// Up Arrow Key
			this.budgetedValue.commitValue();
			this.props.selectPreviousSubCategoryForEditing();
			event.stopPropagation();
		}
		else if(event.keyCode == 40) {
			// Down Arrow Key
			this.budgetedValue.commitValue();
			this.props.selectNextSubCategoryForEditing();
			event.stopPropagation();
		}
		else if(event.keyCode == 9) {
			// Tab Key
			event.stopPropagation();
			this.budgetedValue.commitValue();
			if(event.shiftKey)
				this.props.selectPreviousSubCategoryForEditing();
			else
				this.props.selectNextSubCategoryForEditing();

		}
		else if(event.keyCode == 27) {
			// Excape Key
			this.budgetedValue.discardValue();
			this.props.selectSubCategory(this.props.subCategory, this.props.currentMonth, true, false);
			event.stopPropagation();
		}
		else if(event.keyCode == 13) {
			// Enter Key
			this.budgetedValue.commitValue();
			this.props.selectNextSubCategoryForEditing();
			event.stopPropagation();
		}
	}

	private onBalanceValueClick(event:React.MouseEvent<any>):void {

		var subCategory = this.props.subCategory;
		var currentMonth = this.props.currentMonth;
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudgetsMap[`${currentMonth.toISOString()}_${subCategory.entityId}`];

		var balance = monthlySubCategoryBudget.balance ? monthlySubCategoryBudget.balance : 0;
		var upcomingTransactions = monthlySubCategoryBudget.upcomingTransactions ? monthlySubCategoryBudget.upcomingTransactions : 0;
		
		// If we have a positive value, we are going to show the move money dialog. In case of negative
		// value, show the cover overspending dialog
		if(balance > 0)
			this.props.showMoveMoneyDialog(subCategory.entityId, currentMonth, balance, this.balanceValue as any);
		else if(balance < 0)
			this.props.showCoverOverspendingDialog(subCategory.entityId, currentMonth, balance, this.balanceValue as any);
	}

	public render() {

		var dataFormatter = this.props.dataFormatter;
		var subCategory = this.props.subCategory;
		var currentMonth = this.props.currentMonth;
		var isUncategorizedCategory = (subCategory.internalName == InternalCategories.UncategorizedSubCategory); 
		var monthlySubCategoryBudget = this.props.monthlySubCategoryBudgetsMap[`${currentMonth.toISOString()}_${subCategory.entityId}`];

		// Determine the hovering, selected and editing states
		var isHovering = this.state.hoverState;
		var isSelected = this.props.isSelected;
		var isEditing = (
			this.props.editingSubCategoryId != null && 
			subCategory.entityId == this.props.editingSubCategoryId &&
			currentMonth.equalsByMonth(this.props.editingSubCategoryMonth)
		);

		return(
			<div style={ValuesContainerStyle} onKeyDown={this.onKeyDown}  onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<div className="vertical-separator-thick" />
				<PSubCategoryBudgetedValue
					ref={(b)=> this.budgetedValue = b}
					dataFormatter={dataFormatter}
					isSelected={isSelected}
					isHovering={isHovering}
					isEditing={isEditing}
					subCategory={subCategory}
					currentMonth={currentMonth}
					monthlySubCategoryBudget={monthlySubCategoryBudget}
					setBudgetedAmountForCategory={this.props.setBudgetedAmountForCategory}
					selectSubCategory={this.props.selectSubCategory}
					selectSubCategoryForEditing={this.props.selectSubCategoryForEditing}
				/>

				<PSubCategoryActivityValue 
					dataFormatter={dataFormatter}
					isSelected={isSelected}
					subCategory={subCategory}
					currentMonth={currentMonth}
					monthlySubCategoryBudget={monthlySubCategoryBudget}
					showDefaultSubCategoryActivityDialog={this.props.showDefaultSubCategoryActivityDialog}
					showDebtSubCategoryActivityDialog={this.props.showDebtSubCategoryActivityDialog}
				/>

				<PSubCategoryBalanceValue 
					ref={(b)=> this.balanceValue = b}
					dataFormatter={dataFormatter}
					monthlySubCategoryBudget={monthlySubCategoryBudget}
					onClick={this.onBalanceValueClick}
				/>
			</div>
		);
  	}
}